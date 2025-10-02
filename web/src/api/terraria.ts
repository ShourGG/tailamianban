import { api } from '@/utils/api'

// ==================== 类型定义 ====================

export interface ServerStatus {
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error'
  uptime: number
  version: string
  port: number
  maxPlayers: number
  currentPlayers: number
  worldName: string
  difficulty: string
  password: boolean
}

export interface Player {
  id: string
  name: string
  ip: string
  joinTime: string
  team: number
  health: number
  mana: number
}

export interface World {
  id: string
  name: string
  size: number
  sizeLabel: string
  createdAt: string
  modifiedAt: string
  difficulty: 'normal' | 'expert' | 'master'
  hardmode: boolean
  path: string
}

export interface SystemStats {
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
  timestamp: string
}

export interface ServerConfig {
  port: number
  maxPlayers: number
  password: string
  motd: string
  worldPath: string
  difficulty: string
  autocreate: boolean
}

export interface BanRecord {
  id: string
  playerName: string
  playerIp: string
  reason: string
  bannedBy: string
  bannedAt: string
}

export interface ServerLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

// ==================== 服务器控制 ====================

/**
 * Get server status
 * GET /api/server/status
 */
export const getServerStatus = () => 
  api.get<ServerStatus>('/api/server/status')

/**
 * Start server
 * POST /api/server/start
 */
export const startServer = () => 
  api.post('/api/server/start')

/**
 * Stop server
 * POST /api/server/stop
 */
export const stopServer = () => 
  api.post('/api/server/stop')

/**
 * Restart server
 * POST /api/server/restart
 */
export const restartServer = () => 
  api.post('/api/server/restart')

/**
 * Get server configuration
 * GET /api/server/config
 */
export const getServerConfig = () => 
  api.get<ServerConfig>('/api/server/config')

/**
 * Update server configuration
 * PUT /api/server/config
 */
export const updateServerConfig = (config: Partial<ServerConfig>) => 
  api.put('/api/server/config', config)

// ==================== 玩家管理 ====================

/**
 * Get online players
 * GET /api/players/online
 */
export const getOnlinePlayers = () => 
  api.get<Player[]>('/api/players/online')

/**
 * Kick player
 * POST /api/players/:id/kick
 */
export const kickPlayer = (playerId: string, reason?: string) => 
  api.post(`/api/players/${playerId}/kick`, { reason })

/**
 * Ban player
 * POST /api/players/:id/ban
 */
export const banPlayer = (playerId: string, reason: string) => 
  api.post(`/api/players/${playerId}/ban`, { reason })

/**
 * Unban player
 * POST /api/players/:id/unban
 */
export const unbanPlayer = (playerId: string) => 
  api.post(`/api/players/${playerId}/unban`)

/**
 * Get ban list
 * GET /api/players/banlist
 */
export const getBanList = () => 
  api.get<BanRecord[]>('/api/players/banlist')

/**
 * Send message to player
 * POST /api/players/:id/message
 */
export const sendPlayerMessage = (playerId: string, message: string) => 
  api.post(`/api/players/${playerId}/message`, { message })

/**
 * Send broadcast message
 * POST /api/players/broadcast
 */
export const broadcastMessage = (message: string) => 
  api.post('/api/players/broadcast', { message })

// ==================== 世界管理 ====================

/**
 * Get world list
 * GET /api/worlds
 */
export const getWorldList = () => 
  api.get<World[]>('/api/worlds')

/**
 * Upload world file
 * POST /api/worlds/upload
 */
export const uploadWorld = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/worlds/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Download world file
 * GET /api/worlds/:id/download
 */
export const downloadWorld = (worldId: string) => {
  const url = `/api/worlds/${worldId}/download`
  window.open(url, '_blank')
}

/**
 * Delete world
 * DELETE /api/worlds/:id
 */
export const deleteWorld = (worldId: string) => 
  api.delete(`/api/worlds/${worldId}`)

/**
 * Backup world
 * POST /api/worlds/:id/backup
 */
export const backupWorld = (worldId: string) => 
  api.post(`/api/worlds/${worldId}/backup`)

/**
 * Restore world from backup
 * POST /api/worlds/:id/restore
 */
export const restoreWorld = (worldId: string, backupId: string) => 
  api.post(`/api/worlds/${worldId}/restore`, { backupId })

/**
 * Get world backups
 * GET /api/worlds/:id/backups
 */
export const getWorldBackups = (worldId: string) => 
  api.get<any[]>(`/api/worlds/${worldId}/backups`)

// ==================== 系统监控 ====================

/**
 * Get system stats
 * GET /api/monitor/stats
 */
export const getSystemStats = () => 
  api.get<SystemStats>('/api/monitor/stats')

/**
 * Get server logs
 * GET /api/server/logs
 */
export const getServerLogs = (lines: number = 100) => 
  api.get<ServerLog[]>(`/api/server/logs?lines=${lines}`)

/**
 * Clear server logs
 * DELETE /api/server/logs
 */
export const clearServerLogs = () => 
  api.delete('/api/server/logs')

/**
 * Get system info
 * GET /api/monitor/info
 */
export const getSystemInfo = () => 
  api.get<any>('/api/monitor/info')