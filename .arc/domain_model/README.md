# 泰拉瑞亚面板领域模型

## 核心领域概念

### 限界上下文 (Bounded Contexts)

#### 1. 服务器管理上下文 (Server Management Context)
**职责**: 管理泰拉瑞亚游戏服务器的生命周期和配置

**核心聚合**:
- `TerrariaServer` - 泰拉瑞亚服务器聚合根
  - 服务器状态 (启动/停止/重启)
  - 服务器配置 (端口、密码、世界设置)
  - 进程管理 (PID、内存使用、CPU使用)

**领域服务**:
- `ServerLifecycleService` - 服务器生命周期管理
- `ConfigurationService` - 配置文件管理
- `ProcessMonitorService` - 进程监控服务

#### 2. 世界管理上下文 (World Management Context)
**职责**: 管理游戏世界文件和相关操作

**核心聚合**:
- `GameWorld` - 游戏世界聚合根
  - 世界文件信息 (名称、大小、创建时间)
  - 世界配置 (难度、模式、种子)
  - 备份历史

**领域服务**:
- `WorldBackupService` - 世界备份服务
- `WorldImportService` - 世界导入服务
- `WorldValidationService` - 世界文件验证服务

#### 3. 玩家管理上下文 (Player Management Context)
**职责**: 管理在线玩家和玩家数据

**核心聚合**:
- `Player` - 玩家聚合根
  - 玩家基本信息 (用户名、IP地址)
  - 在线状态 (登录时间、游戏时长)
  - 权限级别 (普通玩家、管理员)

**领域服务**:
- `PlayerAuthenticationService` - 玩家认证服务
- `PlayerStatisticsService` - 玩家统计服务
- `PlayerModerationService` - 玩家管理服务

#### 4. 系统监控上下文 (System Monitoring Context)
**职责**: 监控系统资源和性能指标

**核心聚合**:
- `SystemMetrics` - 系统指标聚合根
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 网络流量

**领域服务**:
- `MetricsCollectionService` - 指标收集服务
- `AlertingService` - 告警服务
- `LoggingService` - 日志服务

#### 5. 面板管理上下文 (Panel Management Context)
**职责**: 管理面板用户和权限

**核心聚合**:
- `PanelUser` - 面板用户聚合根
  - 用户认证信息
  - 权限角色
  - 操作历史

**领域服务**:
- `UserAuthenticationService` - 用户认证服务
- `AuthorizationService` - 权限授权服务
- `AuditLogService` - 审计日志服务

## 通用语言 (Ubiquitous Language)

### 服务器相关术语
- **Server Instance** - 服务器实例，一个运行中的泰拉瑞亚服务器进程
- **Server Configuration** - 服务器配置，包含启动参数和游戏设置
- **Server Status** - 服务器状态：`STOPPED`, `STARTING`, `RUNNING`, `STOPPING`, `ERROR`

### 世界相关术语
- **World File** - 世界文件，包含游戏世界数据的.wld文件
- **World Backup** - 世界备份，世界文件的历史版本快照
- **World Import** - 世界导入，从外部导入世界文件的过程

### 玩家相关术语
- **Online Player** - 在线玩家，当前连接到服务器的玩家
- **Player Session** - 玩家会话，从登录到退出的完整游戏过程
- **Player Moderation** - 玩家管理，包括踢出、封禁等操作

### 系统相关术语
- **System Metrics** - 系统指标，CPU、内存、磁盘等资源使用情况
- **Alert Threshold** - 告警阈值，触发告警的指标临界值
- **Log Entry** - 日志条目，系统或应用产生的日志记录

## 领域事件 (Domain Events)

### 服务器事件
- `ServerStarted` - 服务器启动完成
- `ServerStopped` - 服务器停止
- `ServerConfigurationChanged` - 服务器配置变更
- `ServerErrorOccurred` - 服务器发生错误

### 世界事件
- `WorldCreated` - 世界创建
- `WorldBackupCreated` - 世界备份创建
- `WorldImported` - 世界导入完成
- `WorldDeleted` - 世界删除

### 玩家事件
- `PlayerJoined` - 玩家加入游戏
- `PlayerLeft` - 玩家离开游戏
- `PlayerKicked` - 玩家被踢出
- `PlayerBanned` - 玩家被封禁

### 系统事件
- `MetricsCollected` - 指标收集完成
- `AlertTriggered` - 告警触发
- `SystemResourceExhausted` - 系统资源耗尽

## 数据模型关系

```
PanelUser (1) -----> (N) AuditLog
TerrariaServer (1) -> (N) GameWorld
TerrariaServer (1) -> (N) Player
GameWorld (1) -----> (N) WorldBackup
SystemMetrics (1) -> (N) AlertRule
```

## 业务规则

### 服务器管理规则
1. 同一时间只能有一个服务器实例运行
2. 服务器配置变更需要重启服务器才能生效
3. 服务器停止前必须保存当前世界状态

### 世界管理规则
1. 世界文件名必须唯一
2. 删除世界前必须创建备份
3. 导入的世界文件必须通过格式验证

### 玩家管理规则
1. 同一IP地址同时在线玩家数量有限制
2. 被封禁的玩家无法连接服务器
3. 管理员操作需要记录审计日志

### 系统监控规则
1. 系统指标收集间隔不少于30秒
2. 告警触发后需要冷却时间避免重复告警
3. 日志文件大小超过限制时自动轮转