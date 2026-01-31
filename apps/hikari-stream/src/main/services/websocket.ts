import { WebSocketServer, WebSocket } from 'ws'
import { EventEmitter } from 'events'

export interface WSMessage {
  type: string
  payload?: unknown
}

export interface WSClient {
  id: string
  ws: WebSocket
  type: 'deck' | 'layout' | 'ui'
}

class WebSocketService extends EventEmitter {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WSClient> = new Map()
  private port: number = 9876

  get isRunning(): boolean {
    return this.wss !== null
  }

  get connectedClients(): number {
    return this.clients.size
  }

  start(port?: number): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.wss) {
        resolve(this.port)
        return
      }

      this.port = port || 9876

      this.wss = new WebSocketServer({ port: this.port })

      this.wss.on('listening', () => {
        console.log(`[WebSocket] Server listening on port ${this.port}`)
        this.emit('started', this.port)
        resolve(this.port)
      })

      this.wss.on('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE') {
          // Try next port
          this.wss = null
          this.start(this.port + 1).then(resolve).catch(reject)
        } else {
          console.error('[WebSocket] Server error:', error)
          reject(error)
        }
      })

      this.wss.on('connection', (ws, req) => {
        const clientId = this.generateClientId()
        const clientType = this.parseClientType(req.url || '')

        const client: WSClient = { id: clientId, ws, type: clientType }
        this.clients.set(clientId, client)

        console.log(`[WebSocket] Client connected: ${clientId} (${clientType})`)
        this.emit('client:connected', client)

        // Send welcome message
        this.sendTo(clientId, {
          type: 'welcome',
          payload: { clientId, serverVersion: '0.1.0' }
        })

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString()) as WSMessage
            this.handleMessage(clientId, message)
          } catch (error) {
            console.error('[WebSocket] Invalid message:', error)
          }
        })

        ws.on('close', () => {
          this.clients.delete(clientId)
          console.log(`[WebSocket] Client disconnected: ${clientId}`)
          this.emit('client:disconnected', clientId)
        })

        ws.on('error', (error) => {
          console.error(`[WebSocket] Client ${clientId} error:`, error)
        })
      })
    })
  }

  stop(): void {
    if (this.wss) {
      this.clients.forEach((client) => {
        client.ws.close()
      })
      this.clients.clear()
      this.wss.close()
      this.wss = null
      console.log('[WebSocket] Server stopped')
      this.emit('stopped')
    }
  }

  sendTo(clientId: string, message: WSMessage): boolean {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  broadcast(message: WSMessage, excludeClient?: string): void {
    const data = JSON.stringify(message)
    this.clients.forEach((client, id) => {
      if (id !== excludeClient && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data)
      }
    })
  }

  broadcastToType(type: WSClient['type'], message: WSMessage): void {
    const data = JSON.stringify(message)
    this.clients.forEach((client) => {
      if (client.type === type && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data)
      }
    })
  }

  private handleMessage(clientId: string, message: WSMessage): void {
    console.log(`[WebSocket] Message from ${clientId}:`, message.type)
    this.emit('message', { clientId, message })
    this.emit(`message:${message.type}`, { clientId, payload: message.payload })
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private parseClientType(url: string): WSClient['type'] {
    if (url.includes('deck')) return 'deck'
    if (url.includes('layout')) return 'layout'
    return 'ui'
  }

  getPort(): number {
    return this.port
  }
}

// Singleton instance
export const wsService = new WebSocketService()
