import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage } from 'node:http';
import type { Plugin } from 'vite';

/**
 * "Modo local" do painel admin.
 *
 * Só existe durante `npm run dev`: expõe uma mini API que lê e grava
 * public/data/catalogo.json e as imagens em public/img/produtos direto no disco.
 * Depois é só fazer commit/push das alterações (ou nem publicar, se o site rodar local).
 */

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const CATALOG_PATH = 'data/catalogo.json';
const ALLOWED_UPLOAD_DIR = 'img/produtos/';

interface SaveBody {
  catalogo: unknown;
  baseVersion: string | null;
  uploads: { path: string; base64: string }[];
  deletions: string[];
}

function resolveSafe(relative: string): string {
  const normalized = relative.replace(/\\/g, '/');
  if (!normalized.startsWith(ALLOWED_UPLOAD_DIR) || normalized.includes('..')) {
    throw new Error(`Caminho não permitido: ${relative}`);
  }
  return path.join(PUBLIC_DIR, normalized);
}

function hash(content: string): string {
  return createHash('sha1').update(content).digest('hex');
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf-8');
}

export function localCatalogApi(): Plugin {
  return {
    name: 'local-catalog-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__local-api', async (req, res) => {
        const send = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
        };

        try {
          const catalogFile = path.join(PUBLIC_DIR, CATALOG_PATH);

          if (req.method === 'GET' && req.url === '/catalogo') {
            const content = await fs.readFile(catalogFile, 'utf-8');
            return send(200, { catalogo: JSON.parse(content), version: hash(content) });
          }

          if (req.method === 'POST' && req.url === '/save') {
            const body = JSON.parse(await readBody(req)) as SaveBody;
            const current = await fs.readFile(catalogFile, 'utf-8');
            if (body.baseVersion && body.baseVersion !== hash(current)) {
              return send(409, { error: 'O catálogo foi alterado por outra aba/pessoa. Recarregue a página.' });
            }

            for (const upload of body.uploads) {
              const target = resolveSafe(upload.path);
              await fs.mkdir(path.dirname(target), { recursive: true });
              await fs.writeFile(target, Buffer.from(upload.base64, 'base64'));
            }
            for (const deletion of body.deletions) {
              await fs.rm(resolveSafe(deletion), { force: true });
            }

            const next = JSON.stringify(body.catalogo, null, 2) + '\n';
            await fs.writeFile(catalogFile, next, 'utf-8');
            return send(200, { version: hash(next) });
          }

          send(404, { error: 'Rota não encontrada' });
        } catch (err) {
          send(500, { error: err instanceof Error ? err.message : String(err) });
        }
      });
    },
  };
}
