import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

export function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Skip API routes and files with extensions
        if (
          req.url?.startsWith('/api') ||
          req.url?.match(/\.[a-z0-9]+$/i)
        ) {
          return next()
        }

        // For all other routes, serve index.html
        const indexPath = path.resolve(__dirname, 'index.html')
        if (fs.existsSync(indexPath)) {
          res.setHeader('Content-Type', 'text/html')
          fs.createReadStream(indexPath).pipe(res)
        } else {
          next()
        }
      })
    }
  }
}
