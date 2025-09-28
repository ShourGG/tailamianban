import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ServerInfo {
  status: 'running' | 'stopped' | 'starting' | 'stopping'
  players: number
  maxPlayers: number
  uptime: string
  cpu: number
  memory: number
  version: string
}

export const useServerStore = defineStore('server', () => {
  const serverInfo = ref<ServerInfo>({
    status: 'stopped',
    players: 0,
    maxPlayers: 8,
    uptime: '0s',
    cpu: 0,
    memory: 0,
    version: '1.4.4.9'
  })

  const isRunning = computed(() => serverInfo.value.status === 'running')
  const isStopped = computed(() => serverInfo.value.status === 'stopped')
  
  function updateServerInfo(info: Partial<ServerInfo>) {
    serverInfo.value = { ...serverInfo.value, ...info }
  }

  function startServer() {
    serverInfo.value.status = 'starting'
    // TODO: Call API to start server
  }

  function stopServer() {
    serverInfo.value.status = 'stopping'
    // TODO: Call API to stop server
  }

  function restartServer() {
    stopServer()
    setTimeout(() => startServer(), 1000)
  }

  return {
    serverInfo,
    isRunning,
    isStopped,
    updateServerInfo,
    startServer,
    stopServer,
    restartServer
  }
})