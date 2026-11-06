import { site } from '@/config/site';
import type { Catalogo } from '@/shared/types/catalog';
import { blobToBase64 } from '@/shared/utils/image';
import { CATALOG_PATH, ConflictError, type CatalogRepository, type LoadedCatalog, type SaveRequest } from './types';

const API = 'https://api.github.com';
/** Os arquivos do site ficam dentro de public/ no repositório. */
const REPO_PUBLIC_DIR = 'public';

export interface GitHubTarget {
  owner: string;
  repo: string;
  branch: string;
}

export class GitHubError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

function friendlyMessage(status: number, apiMessage: string): string {
  if (status === 401) return 'Token inválido ou expirado.';
  if (status === 403) return 'O token não tem permissão para este repositório (precisa de "Contents: Read and write").';
  if (status === 404) return 'Repositório ou arquivo não encontrado. Confira owner/repo/branch em src/config/site.ts e o acesso do token.';
  if (status === 409 || status === 422) return `Conflito ao gravar no GitHub: ${apiMessage}`;
  return `Erro do GitHub (${status}): ${apiMessage}`;
}

function decodeBase64Utf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Usa o próprio repositório Git como "banco de dados".
 * Cada salvamento vira UM commit contendo o catalogo.json e as imagens novas/removidas.
 * O push dispara o deploy automático (GitHub Actions) e o site público é atualizado em ~1 min.
 */
export class GitHubCatalogRepository implements CatalogRepository {
  readonly kind = 'github' as const;
  readonly label: string;

  constructor(
    private readonly token: string,
    private readonly target: GitHubTarget = site.github,
  ) {
    this.label = `${target.owner}/${target.repo} · ${target.branch}`;
  }

  /** Valida o token e confirma que ele pode gravar no repositório. */
  static async verify(token: string, target: GitHubTarget = site.github): Promise<GitHubCatalogRepository> {
    const repo = new GitHubCatalogRepository(token, target);
    const info = await repo.request<{ permissions?: { push?: boolean } }>('');
    if (!info.permissions?.push) {
      throw new GitHubError(403, 'O token tem acesso somente leitura. Ative "Contents: Read and write".');
    }
    return repo;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const { owner, repo } = this.target;
    const res = await fetch(`${API}/repos/${owner}/${repo}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new GitHubError(res.status, friendlyMessage(res.status, body.message ?? res.statusText));
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  private repoPath(publicPath: string): string {
    return `${REPO_PUBLIC_DIR}/${publicPath.replace(/^\/+/, '')}`;
  }

  private async readCatalogFile(ref: string): Promise<{ sha: string; text: string }> {
    const file = await this.request<{ sha: string; content: string; encoding: string }>(
      `/contents/${this.repoPath(CATALOG_PATH)}?ref=${encodeURIComponent(ref)}`,
    );
    // Arquivos > 1 MB vêm sem conteúdo pela Contents API; nesse caso lê o blob diretamente.
    if (!file.content) {
      const blob = await this.request<{ content: string }>(`/git/blobs/${file.sha}`);
      return { sha: file.sha, text: decodeBase64Utf8(blob.content) };
    }
    return { sha: file.sha, text: decodeBase64Utf8(file.content) };
  }

  async load(): Promise<LoadedCatalog> {
    const { sha, text } = await this.readCatalogFile(this.target.branch);
    return { catalogo: JSON.parse(text) as Catalogo, version: sha };
  }

  async save({ catalogo, baseVersion, uploads, deletions, message }: SaveRequest): Promise<string> {
    const branch = encodeURIComponent(this.target.branch);

    // 1. Estado atual da branch
    const ref = await this.request<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    const headSha = ref.object.sha;
    const head = await this.request<{ tree: { sha: string } }>(`/git/commits/${headSha}`);

    // 2. Detecta edição concorrente (outra pessoa salvou depois que você abriu o painel)
    if (baseVersion) {
      const current = await this.readCatalogFile(headSha);
      if (current.sha !== baseVersion) throw new ConflictError();
    }

    // 3. Cria os blobs (imagens + JSON)
    const tree: { path: string; mode: '100644'; type: 'blob'; sha: string | null }[] = [];

    for (const upload of uploads) {
      const blob = await this.request<{ sha: string }>('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: await blobToBase64(upload.data), encoding: 'base64' }),
      });
      tree.push({ path: this.repoPath(upload.path), mode: '100644', type: 'blob', sha: blob.sha });
    }

    const json = JSON.stringify(catalogo, null, 2) + '\n';
    const jsonBlob = await this.request<{ sha: string }>('/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: json, encoding: 'utf-8' }),
    });
    tree.push({ path: this.repoPath(CATALOG_PATH), mode: '100644', type: 'blob', sha: jsonBlob.sha });

    for (const path of deletions) {
      tree.push({ path: this.repoPath(path), mode: '100644', type: 'blob', sha: null });
    }

    // 4. Árvore → commit → avança a branch (sem force: se alguém fez push no meio, falha em vez de sobrescrever)
    const newTree = await this.request<{ sha: string }>('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: head.tree.sha, tree }),
    });
    const commit = await this.request<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
    });
    try {
      await this.request(`/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });
    } catch (err) {
      if (err instanceof GitHubError && err.status === 422) throw new ConflictError();
      throw err;
    }

    return jsonBlob.sha;
  }

  imageUrl(path: string): string {
    if (/^(https?:|data:|blob:)/.test(path)) return path;
    const { owner, repo, branch } = this.target;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${this.repoPath(path)}`;
  }
}
