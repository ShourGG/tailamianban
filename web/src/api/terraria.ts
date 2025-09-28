import { http } from '@/axios'

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 服务器状态
export interface ServerStatus {
  status: 'running' | 'stopped' | 'starting' | 'stopping'
  pid: number
  uptime: number
  player_count: number
  max_players: number
  world_name: string
  port: number
  version: string
}

// 服务器配置
export interface ServerConfig {
  world_name: string
  max_players: number
  port: number
  password?: string
  difficulty: 'classic' | 'expert' | 'master'
  auto_save: boolean
  auto_save_time: number
}

// 世界信息
export interface World {
  id: string
  name: string
  size: number
  created_at: string
  modified_at: string
  is_active: boolean
  backup_count: number
}

// 玩家信息
export interface Player {
  id: string
  name: string
  steam_id?: string
  ip: string
  is_online: boolean
  is_banned: boolean
  play_time: number
  last_seen: string
  joined_at: string
}

// 系统指标
export interface SystemMetrics {
  cpu: {
    usage_percent: number
    cores: number
    load_average?: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    used_percent: number
  }
  disk: {
    total: number
    used: number
    free: number
    used_percent: number
  }
  network: {
    bytes_sent: number
    bytes_recv: number
  }
  timestamp: string
}

// 用户信息
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'moderator' | 'viewer'
  is_active: boolean
  created_at: string
  last_login?: string
}

/**
 * 泰拉瑞亚面板API
 */
export const terrariaApi = {
  // ========== 认证相关 ==========
  auth: {
    login: (data: { username: string; password: string }) =>
      http.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', data),
    
    logout: () => http.post('/api/auth/logout'),
    
    getCurrentUser: () => http.get<ApiResponse<User>>('/api/auth/me')
  },

  // ========== 服务器管理 ==========
  server: {
    getStatus: () => http.get<ApiResponse<ServerStatus>>('/api/server/status'),
    
    start: () => http.post('/api/server/start'),
    
    stop: () => http.post('/api/server/stop'),
    
    restart: () => http.post('/api/server/restart'),
    
    getConfig: () => http.get<ApiResponse<ServerConfig>>('/api/server/config'),
    
    updateConfig: (config: ServerConfig) =>
      http.put('/api/server/config', config),
    
    getLogs: (lines = 100) =>
      http.get<ApiResponse<string[]>>(`/api/server/logs?lines=${lines}`),
    
    clearLogs: () => http.delete('/api/server/logs')
  },

  // ========== 世界管理 ==========
  world: {
    getList: () =>
      http.get<ApiResponse<{ worlds: World[]; count: number }>>('/api/worlds'),
    
    create: (data: { name: string; size: string; difficulty: string; seed?: string }) =>
      http.post<ApiResponse<World>>('/api/worlds', data),
    
    getById: (id: string) =>
      http.get<ApiResponse<World>>(`/api/worlds/${id}`),
    
    update: (id: string, data: Partial<World>) =>
      http.put(`/api/worlds/${id}`, data),
    
    delete: (id: string) =>
      http.delete(`/api/worlds/${id}`),
    
    backup: (id: string) =>
      http.post<ApiResponse<{ backup_path: string }>>(`/api/worlds/${id}/backup`),
    
    restore: (id: string, backupPath: string) =>
      http.post(`/api/worlds/${id}/restore`, { backup_path: backupPath }),
    
    upload: (file: File) => {
      const formData = new FormData()
      formData.append('world', file)
      return http.post<ApiResponse<World>>('/api/worlds/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    
    download: (id: string) =>
      window.open(`/api/worlds/${id}/download`, '_blank')
  },

  // ========== 玩家管理 ==========
  player: {
    getList: (params?: { online?: boolean; banned?: boolean }) =>
      http.get<ApiResponse<{ players: Player[]; count: number }>>('/api/players', { params }),
    
    getOnline: () =>
      http.get<ApiResponse<{ players: Player[]; online_count: number; max_players: number }>>('/api/players/online'),
    
    getById: (id: string) =>
      http.get<ApiResponse<{ player: Player; stats: any }>>(`/api/players/${id}`),
    
    kick: (id: string, reason: string) =>
      http.post(`/api/players/${id}/kick`, { reason }),
    
    ban: (id: string, data: { reason: string; duration?: number; ip_ban?: boolean }) =>
      http.post(`/api/players/${id}/ban`, data),
    
    unban: (id: string) =>
      http.delete(`/api/players/${id}/ban`),
    
    getBanned: () =>
      http.get<ApiResponse<{ bans: Player[]; count: number }>>('/api/players/bans')
  },

  // ========== 系统监控 ==========
  system: {
    getMetrics: () =>
      http.get<ApiResponse<SystemMetrics>>('/api/system/metrics'),
    
    getMetricsHistory: (duration = '1h', resolution = '1m') =>
      http.get<ApiResponse<{ history: SystemMetrics[]; count: number }>>('/api/system/metrics/history', {
        params: { duration, resolution }
      }),
    
    getInfo: () =>
      http.get<ApiResponse<any>>('/api/system/info'),
    
    getProcesses: () =>
      http.get<ApiResponse<{ processes: any[]; count: number }>>('/api/system/processes')
  },

  // ========== 面板设置 ==========
  panel: {
    getSettings: () =>
      http.get<ApiResponse<any>>('/api/panel/settings'),
    
    updateSettings: (settings: any) =>
      http.put('/api/panel/settings', settings),
    
    getUsers: () =>
      http.get<ApiResponse<{ users: User[]; count: number }>>('/api/panel/users'),
    
    createUser: (data: { username: string; email: string; password: string; role: string }) =>
      http.post<ApiResponse<User>>('/api/panel/users', data),
    
    updateUser: (id: string, data: Partial<User>) =>
      http.put(`/api/panel/users/${id}`, data),
    
    deleteUser: (id: string) =>
      http.delete(`/api/panel/users/${id}`),
    
    getAuditLogs: (params?: { user_id?: string; action?: string }) =>
      http.get<ApiResponse<{ logs: any[]; count: number }>>('/api/panel/audit-logs', { params })
  },

  // ========== WebSocket连接 ==========
  ws: {
    connect: () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      return new WebSocket(`${protocol}//${host}/api/ws`)
    }
  }
}