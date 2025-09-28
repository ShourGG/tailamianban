import type { RouteRecordRaw } from 'vue-router'

// 泰拉瑞亚面板路由
export const terrariaRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/terraria/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'i-mdi-view-dashboard'
        }
      },
      {
        path: 'server',
        name: 'ServerManagement',
        meta: {
          title: '服务器管理',
          icon: 'i-mdi-server'
        },
        children: [
          {
            path: 'control',
            name: 'ServerControl',
            component: () => import('@/views/terraria/server/control.vue'),
            meta: {
              title: '服务器控制'
            }
          },
          {
            path: 'config',
            name: 'ServerConfig',
            component: () => import('@/views/terraria/server/config.vue'),
            meta: {
              title: '服务器配置'
            }
          },
          {
            path: 'logs',
            name: 'ServerLogs',
            component: () => import('@/views/terraria/server/logs.vue'),
            meta: {
              title: '服务器日志'
            }
          }
        ]
      },
      {
        path: 'world',
        name: 'WorldManagement',
        meta: {
          title: '世界管理',
          icon: 'i-mdi-earth'
        },
        children: [
          {
            path: 'list',
            name: 'WorldList',
            component: () => import('@/views/terraria/world/list.vue'),
            meta: {
              title: '世界列表'
            }
          },
          {
            path: 'backup',
            name: 'WorldBackup',
            component: () => import('@/views/terraria/world/backup.vue'),
            meta: {
              title: '备份管理'
            }
          }
        ]
      },
      {
        path: 'player',
        name: 'PlayerManagement',
        meta: {
          title: '玩家管理',
          icon: 'i-mdi-account-group'
        },
        children: [
          {
            path: 'online',
            name: 'OnlinePlayers',
            component: () => import('@/views/terraria/player/online.vue'),
            meta: {
              title: '在线玩家'
            }
          },
          {
            path: 'ban',
            name: 'BannedPlayers',
            component: () => import('@/views/terraria/player/banned.vue'),
            meta: {
              title: '封禁列表'
            }
          },
          {
            path: 'statistics',
            name: 'PlayerStatistics',
            component: () => import('@/views/terraria/player/statistics.vue'),
            meta: {
              title: '玩家统计'
            }
          }
        ]
      },
      {
        path: 'monitor',
        name: 'SystemMonitor',
        component: () => import('@/views/terraria/monitor/index.vue'),
        meta: {
          title: '系统监控',
          icon: 'i-mdi-monitor-dashboard'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        meta: {
          title: '系统设置',
          icon: 'i-mdi-cog'
        },
        children: [
          {
            path: 'panel',
            name: 'PanelSettings',
            component: () => import('@/views/terraria/settings/panel.vue'),
            meta: {
              title: '面板设置'
            }
          },
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/terraria/settings/users.vue'),
            meta: {
              title: '用户管理'
            }
          },
          {
            path: 'audit',
            name: 'AuditLogs',
            component: () => import('@/views/terraria/settings/audit.vue'),
            meta: {
              title: '审计日志'
            }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/terraria/login/index.vue'),
    meta: {
      title: '登录'
    }
  }
]