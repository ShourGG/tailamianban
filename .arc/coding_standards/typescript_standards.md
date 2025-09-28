# TypeScript编码规范

## 基本原则

### 1. 类型安全优先
- 启用严格模式 (`strict: true`)
- 避免使用 `any` 类型
- 优先使用类型推断
- 为所有公共API提供明确类型

### 2. 命名规范

#### 变量和函数命名
```typescript
// ✅ 正确：驼峰命名，语义清晰
const serverConfig: ServerConfig = {};
const isServerRunning: boolean = false;
const playerCount: number = 0;

function startServer(): Promise<void> {}
function getPlayerList(): Player[] {}
function validateConfiguration(config: ServerConfig): boolean {}

// ❌ 错误：下划线、不清晰
const server_config = {};
const flag = false;
const count = 0;

function start() {}
function get() {}
function check() {}
```

#### 类型和接口命名
```typescript
// ✅ 正确：接口以I开头或使用描述性名称
interface ServerConfig {
  name: string;
  port: number;
  maxPlayers: number;
}

interface IPlayerManager {
  addPlayer(player: Player): void;
  removePlayer(playerId: string): void;
}

type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping';
type PlayerRole = 'admin' | 'moderator' | 'player';

// ❌ 错误：命名不规范
interface config {
  name: string;
}

type status = string;
```

#### 类命名
```typescript
// ✅ 正确：PascalCase，名词性
class TerrariaServer {
  private config: ServerConfig;
  
  constructor(config: ServerConfig) {
    this.config = config;
  }
}

class PlayerManager {
  private players: Map<string, Player> = new Map();
}

// ❌ 错误：动词性、小写开头
class startServer {}
class playerManager {}
```

### 3. 类型定义

#### 基础类型定义
```typescript
// ✅ 正确：明确的类型定义
interface ServerConfig {
  readonly name: string;
  readonly port: number;
  readonly maxPlayers: number;
  readonly password?: string;
  readonly isPublic: boolean;
  readonly worldName: string;
  readonly difficulty: 'classic' | 'expert' | 'master';
}

interface Player {
  readonly id: string;
  readonly name: string;
  readonly ipAddress: string;
  readonly joinTime: Date;
  readonly role: PlayerRole;
  readonly isOnline: boolean;
}

// ❌ 错误：类型不明确
interface ServerConfig {
  name: any;
  port: any;
  settings: object;
}
```

#### 联合类型和字面量类型
```typescript
// ✅ 正确：使用联合类型和字面量类型
type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ❌ 错误：使用字符串类型
type ServerStatus = string;
type LogLevel = string;
```

#### 泛型使用
```typescript
// ✅ 正确：合理使用泛型
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class PlayerRepository implements Repository<Player> {
  async findById(id: string): Promise<Player | null> {
    // 实现
  }
  
  // 其他方法实现...
}

// ❌ 错误：过度使用泛型
interface GenericService<T, U, V, W> {
  process<X, Y, Z>(input: T): Promise<U>;
}
```

### 4. 函数定义

#### 函数签名
```typescript
// ✅ 正确：明确的参数和返回类型
async function startServer(
  config: ServerConfig,
  options?: StartOptions
): Promise<ServerInstance> {
  // 实现
}

function validatePlayer(
  player: Player,
  rules: ValidationRule[]
): ValidationResult {
  // 实现
}

// 箭头函数
const calculateUptime = (startTime: Date): number => {
  return Date.now() - startTime.getTime();
};

// ❌ 错误：类型不明确
async function startServer(config: any, options?: any): Promise<any> {
  // 实现
}
```

#### 函数重载
```typescript
// ✅ 正确：函数重载
function getPlayer(id: string): Promise<Player | null>;
function getPlayer(name: string, exact: true): Promise<Player | null>;
function getPlayer(name: string, exact: false): Promise<Player[]>;
function getPlayer(
  identifier: string,
  exact?: boolean
): Promise<Player | Player[] | null> {
  if (exact === undefined) {
    // 按ID查找
    return findPlayerById(identifier);
  } else if (exact) {
    // 精确按名称查找
    return findPlayerByNameExact(identifier);
  } else {
    // 模糊按名称查找
    return findPlayersByNameFuzzy(identifier);
  }
}
```

### 5. 类设计

#### 类定义
```typescript
// ✅ 正确：清晰的类结构
class TerrariaServer {
  private readonly config: ServerConfig;
  private process: ChildProcess | null = null;
  private status: ServerStatus = 'stopped';
  private readonly eventEmitter = new EventEmitter();

  constructor(config: ServerConfig) {
    this.config = Object.freeze({ ...config });
  }

  public async start(): Promise<void> {
    if (this.status !== 'stopped') {
      throw new Error(`Cannot start server in ${this.status} state`);
    }

    this.status = 'starting';
    try {
      await this.doStart();
      this.status = 'running';
      this.eventEmitter.emit('started');
    } catch (error) {
      this.status = 'error';
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public getStatus(): ServerStatus {
    return this.status;
  }

  private async doStart(): Promise<void> {
    // 启动逻辑
  }
}

// ❌ 错误：访问修饰符混乱，职责不清
class Server {
  config: any;
  process: any;
  status: string;

  start() {
    // 实现
  }

  stop() {
    // 实现
  }

  getPlayers() {
    // 实现
  }

  saveWorld() {
    // 实现
  }

  // 太多职责混在一个类中
}
```

#### 抽象类和继承
```typescript
// ✅ 正确：合理的继承层次
abstract class BaseServer {
  protected readonly config: ServerConfig;
  protected status: ServerStatus = 'stopped';

  constructor(config: ServerConfig) {
    this.config = config;
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public getStatus(): ServerStatus {
    return this.status;
  }

  protected validateConfig(): void {
    if (!this.config.name) {
      throw new Error('Server name is required');
    }
  }
}

class TerrariaServer extends BaseServer {
  public async start(): Promise<void> {
    this.validateConfig();
    // Terraria特定的启动逻辑
  }

  public async stop(): Promise<void> {
    // Terraria特定的停止逻辑
  }
}
```

### 6. 错误处理

#### 自定义错误类型
```typescript
// ✅ 正确：自定义错误类型
class ServerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly serverName?: string
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 错误处理函数
function handleServerError(error: unknown): never {
  if (error instanceof ServerError) {
    console.error(`Server error [${error.code}]: ${error.message}`);
  } else if (error instanceof ValidationError) {
    console.error(`Validation error for ${error.field}: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
  
  process.exit(1);
}
```

#### 结果类型模式
```typescript
// ✅ 正确：Result类型模式
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function startServerSafe(config: ServerConfig): Promise<Result<ServerInstance>> {
  try {
    const server = await startServer(config);
    return { success: true, data: server };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

// 使用
const result = await startServerSafe(config);
if (result.success) {
  console.log('Server started:', result.data.name);
} else {
  console.error('Failed to start server:', result.error.message);
}
```

### 7. 异步编程

#### Promise和async/await
```typescript
// ✅ 正确：正确使用async/await
class ServerManager {
  private servers: Map<string, TerrariaServer> = new Map();

  public async startServer(name: string, config: ServerConfig): Promise<void> {
    if (this.servers.has(name)) {
      throw new Error(`Server ${name} already exists`);
    }

    const server = new TerrariaServer(config);
    
    try {
      await server.start();
      this.servers.set(name, server);
    } catch (error) {
      // 清理资源
      await server.cleanup?.();
      throw error;
    }
  }

  public async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.servers.values()).map(
      server => server.stop()
    );
    
    await Promise.allSettled(stopPromises);
    this.servers.clear();
  }
}

// ❌ 错误：混用Promise和async/await
async function badExample() {
  return startServer(config).then(server => {
    return server.getStatus();
  }).catch(error => {
    throw error;
  });
}
```

#### 超时和取消
```typescript
// ✅ 正确：支持超时和取消
class ServerOperations {
  public async startWithTimeout(
    config: ServerConfig,
    timeoutMs: number = 30000,
    signal?: AbortSignal
  ): Promise<ServerInstance> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Server start timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Server start aborted'));
      });
    });

    const startPromise = this.startServer(config, signal);

    return Promise.race([startPromise, timeoutPromise]);
  }

  private async startServer(
    config: ServerConfig,
    signal?: AbortSignal
  ): Promise<ServerInstance> {
    // 检查取消信号
    if (signal?.aborted) {
      throw new Error('Operation aborted');
    }

    // 启动逻辑
    const server = new TerrariaServer(config);
    await server.start();
    
    return server;
  }
}
```

### 8. 模块和导入

#### 模块导出
```typescript
// ✅ 正确：明确的导出
// server/types.ts
export interface ServerConfig {
  name: string;
  port: number;
  maxPlayers: number;
}

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping';

export class TerrariaServer {
  // 实现
}

// server/index.ts
export { TerrariaServer, type ServerConfig, type ServerStatus } from './types';
export { ServerManager } from './manager';
export { ServerValidator } from './validator';

// ❌ 错误：默认导出过多
export default {
  TerrariaServer,
  ServerManager,
  ServerValidator,
  ServerConfig,
  // ...
};
```

#### 模块导入
```typescript
// ✅ 正确：明确的导入
import { TerrariaServer, type ServerConfig } from '@/server';
import { PlayerManager } from '@/player';
import { Logger } from '@/utils/logger';

// 类型导入
import type { Player, PlayerRole } from '@/player/types';
import type { ApiResponse } from '@/api/types';

// ❌ 错误：导入过多或不明确
import * as Server from '@/server';
import { TerrariaServer, ServerManager, ServerValidator, PlayerManager, Logger } from '@/index';
```

### 9. 工具类型使用

#### 内置工具类型
```typescript
// ✅ 正确：合理使用工具类型
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建用户时不需要id和时间戳
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// 更新用户时所有字段都是可选的
type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>;

// 公开用户信息（不包含密码）
type PublicUser = Omit<User, 'password'>;

// 只读配置
type ReadonlyConfig = Readonly<ServerConfig>;
```

#### 自定义工具类型
```typescript
// ✅ 正确：自定义工具类型
// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 非空类型
type NonNullable<T> = T extends null | undefined ? never : T;

// 函数参数类型
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

// 使用示例
type StartServerParams = Parameters<typeof startServer>;
type ReadonlyServerConfig = DeepReadonly<ServerConfig>;
```

### 10. 性能优化

#### 类型优化
```typescript
// ✅ 正确：避免复杂的类型计算
interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: {
    bytesIn: number;
    bytesOut: number;
  };
}

// 使用索引签名而不是联合类型（当键很多时）
interface MetricValues {
  [key: string]: number;
}

// ❌ 错误：过度复杂的类型
type ComplexType<T> = T extends string 
  ? T extends `${infer A}_${infer B}` 
    ? A extends 'server' 
      ? B extends 'config' 
        ? ServerConfig 
        : never 
      : never 
    : never 
  : never;
```

#### 运行时优化
```typescript
// ✅ 正确：对象冻结和缓存
class ConfigManager {
  private static readonly DEFAULT_CONFIG: Readonly<ServerConfig> = Object.freeze({
    name: 'default-server',
    port: 7777,
    maxPlayers: 10,
    isPublic: false,
    worldName: 'default-world',
    difficulty: 'classic'
  });

  private configCache = new Map<string, Readonly<ServerConfig>>();

  public getConfig(name: string): Readonly<ServerConfig> {
    if (!this.configCache.has(name)) {
      const config = this.loadConfig(name);
      this.configCache.set(name, Object.freeze(config));
    }
    
    return this.configCache.get(name)!;
  }

  private loadConfig(name: string): ServerConfig {
    // 加载配置逻辑
    return { ...ConfigManager.DEFAULT_CONFIG };
  }
}
```