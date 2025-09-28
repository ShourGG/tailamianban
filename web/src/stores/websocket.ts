import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWebSocketStore = defineStore('websocket', () => {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const reconnectTimer = ref<NodeJS.Timeout | null>(null)
  
  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) {
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    ws.value = new WebSocket(`${protocol}//${host}/ws`)

    ws.value.onopen = () => {
      connected.value = true
      console.log('WebSocket connected')
      
      if (reconnectTimer.value) {
        clearTimeout(reconnectTimer.value)
        reconnectTimer.value = null
      }
    }

    ws.value.onclose = () => {
      connected.value = false
      console.log('WebSocket disconnected')
      
      // Auto reconnect after 3 seconds
      reconnectTimer.value = setTimeout(() => {
        connect()
      }, 3000)
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleMessage(data)
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }
  }

  function disconnect() {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
    
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    
    connected.value = false
  }

  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  function handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'serverStatus':
        // Update server status
        break
      case 'playerUpdate':
        // Update player list
        break
      case 'log':
        // Add to logs
        break
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  return {
    connected,
    connect,
    disconnect,
    send
  }
})