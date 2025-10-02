import P from"./index-CycPa0b1.js";import{b as I}from"./index-DbHuSC4d.js";import{H as F,aJ as L,X as D,a9 as M,a8 as j,K as O,af as $,M as H,ae as V}from"./ui-vendor-Dblj447Y.js";import{k as B,r as E,P as T,Q as p,R as e,U as q,S as r,j as u,F as G,M as J,J as a,Z as y,X as z,a2 as X}from"./vue-vendor-DgJqRHrX.js";import{_ as Q}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./editor-vendor-BwkH8h9-.js";import"./charts-vendor-DjXuxi75.js";import"./spline-vendor-Btm54g1Q.js";const W=[{label:"C++",value:"cpp"},{label:"Rust",value:"rust"},{label:"Swift",value:"swift"},{label:"PHP",value:"php"},{label:"Ruby",value:"ruby"},{label:"SQL",value:"sql"}],m={javascript:`// JavaScript 工具函数
class Utils {
  /**
   * * @description 格式化日期为中文格式
   * ? @param date - 日期对象
   * ! @return string 格式化后的日期字符串
   */
  static formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN').format(date)
  }

  /**
   * * @description 防抖函数，延迟执行
   * ? @param func - 要防抖的函数
   * ? @param wait - 延迟时间(毫秒)
   * ! @return Function 防抖后的函数
   */
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * * @description 深度克隆对象
   * ? @param obj - 要克隆的对象
   * ! @return any 克隆后的对象
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item))
    
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = Utils.deepClone(obj[key])
      }
    }
    return cloned
  }
}

export default Utils`,typescript:`// TypeScript 接口定义
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  isActive: boolean
  createdAt: Date
}

export interface ApiResponse<T> {
  data: T
  code: number
  message: string
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class UserService {
  private baseUrl = '/api/users'

  /**
   * * @description 获取用户列表
   * ! @return Promise<PaginatedResponse<User>> 分页用户数据
   */
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response = await fetch(this.baseUrl)
    return response.json()
  }

  /**
   * * @description 创建新用户
   * ? @param user - 用户信息(排除id和创建时间)
   * ! @return Promise<ApiResponse<User>> 创建结果
   */
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    return response.json()
  }
}`,python:`# Python 数据处理脚本
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

class DataProcessor:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.data: Optional[pd.DataFrame] = None
    
    def load_data(self) -> pd.DataFrame:
        """
        * @description 加载数据文件
        ! @return pd.DataFrame 加载的数据框
        """
        try:
            if self.file_path.endswith('.csv'):
                self.data = pd.read_csv(self.file_path)
            elif self.file_path.endswith('.xlsx'):
                self.data = pd.read_excel(self.file_path)
            else:
                raise ValueError("不支持的文件格式")
            
            print(f"数据加载成功: {self.data.shape}")
            return self.data
        except Exception as e:
            print(f"数据加载失败: {e}")
            raise
    
    def clean_data(self) -> pd.DataFrame:
        """
        * @description 清理数据，删除重复行和处理缺失值
        ! @return pd.DataFrame 清理后的数据框
        """
        if self.data is None:
            raise ValueError("请先加载数据")
        
        # 删除重复行
        self.data.drop_duplicates(inplace=True)
        
        # 处理缺失值
        self.data.fillna(self.data.mean(), inplace=True)
        
        return self.data
    
    def get_summary(self) -> Dict[str, any]:
        """
        * @description 获取数据摘要统计信息
        ! @return Dict[str, any] 数据摘要字典
        """
        if self.data is None:
            return {}
        
        return {
            'rows': len(self.data),
            'columns': len(self.data.columns),
            'missing_values': self.data.isnull().sum().sum(),
            'dtypes': self.data.dtypes.to_dict()
        }

if __name__ == "__main__":
    processor = DataProcessor("data.csv")
    processor.load_data()
    processor.clean_data()
    print(processor.get_summary())`,java:`// Java 用户管理类
import java.util.*;
import java.time.LocalDateTime;

public class UserManager {
    private Map<Long, User> users = new HashMap<>();
    private Long nextId = 1L;
    
    public static class User {
        private Long id;
        private String name;
        private String email;
        private LocalDateTime createdAt;
        
        public User(String name, String email) {
            this.name = name;
            this.email = email;
            this.createdAt = LocalDateTime.now();
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }
    
    /**
     * * @description 创建新用户
     * ? @param name - 用户姓名
     * ? @param email - 用户邮箱
     * ! @return User 创建的用户对象
     */
    public User createUser(String name, String email) {
        if (name == null || email == null) {
            throw new IllegalArgumentException("姓名和邮箱不能为空");
        }
        
        // 检查邮箱是否已存在
        boolean emailExists = users.values().stream()
            .anyMatch(user -> user.getEmail().equals(email));
        
        if (emailExists) {
            throw new IllegalArgumentException("邮箱已存在");
        }
        
        User user = new User(name, email);
        user.setId(nextId++);
        users.put(user.getId(), user);
        
        System.out.println("用户创建成功: " + user.getName());
        return user;
    }
    
    /**
     * * @description 根据邮箱查找用户
     * ? @param email - 邮箱地址
     * ! @return Optional<User> 用户对象（可能为空）
     */
    public Optional<User> findUserByEmail(String email) {
        return users.values().stream()
            .filter(user -> user.getEmail().equals(email))
            .findFirst();
    }
    
    /**
     * * @description 获取所有用户列表
     * ! @return List<User> 用户列表
     */
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
}`,go:`// Go Web 服务
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "time"
    
    "github.com/gorilla/mux"
)

type User struct {
    ID        int       \`json:"id"\`
    Name      string    \`json:"name"\`
    Email     string    \`json:"email"\`
    CreatedAt time.Time \`json:"created_at"\`
}

type UserService struct {
    users  map[int]*User
    nextID int
}

func NewUserService() *UserService {
    return &UserService{
        users:  make(map[int]*User),
        nextID: 1,
    }
}

/**
 * * @description 创建用户的HTTP处理函数
 * ? @param w - HTTP响应写入器
 * ? @param r - HTTP请求对象
 * ! @return void
 */
func (s *UserService) CreateUser(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    
    user.ID = s.nextID
    user.CreatedAt = time.Now()
    s.users[user.ID] = &user
    s.nextID++
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

/**
 * * @description 获取所有用户的HTTP处理函数
 * ? @param w - HTTP响应写入器
 * ? @param r - HTTP请求对象
 * ! @return void
 */
func (s *UserService) GetUsers(w http.ResponseWriter, r *http.Request) {
    users := make([]*User, 0, len(s.users))
    for _, user := range s.users {
        users = append(users, user)
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(users)
}

func main() {
    service := NewUserService()
    
    r := mux.NewRouter()
    r.HandleFunc("/users", service.CreateUser).Methods("POST")
    r.HandleFunc("/users", service.GetUsers).Methods("GET")
    
    fmt.Println("服务器启动在 :8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}`,json:`{
  "name": "robot-admin",
  "version": "1.0.0",
  "description": "Vue 3 管理后台",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build", 
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "naive-ui": "^2.38.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}`,simple:`// 简单示例
/**
 * * @description 问候函数
 * ? @param name - 姓名
 * ! @return string 问候语
 */
function hello(name) {
  return \`Hello, \${name}!\`
}

console.log(hello('World'))`,fullscreen:`// 全屏功能演示
interface FullscreenAPI {
  isSupported: boolean
  currentElement: Element | null
  requestFullscreen(element?: Element): Promise<void>
  exitFullscreen(): Promise<void>
  onChange(callback: (isFullscreen: boolean) => void): void
}

class FullscreenManager implements FullscreenAPI {
  private callbacks = new Set<(isFullscreen: boolean) => void>()
  
  get isSupported(): boolean {
    return !!(document.exitFullscreen || (document as any).webkitExitFullscreen)
  }
  
  get currentElement(): Element | null {
    return document.fullscreenElement || (document as any).webkitFullscreenElement
  }
  
  /**
   * * @description 请求进入全屏模式
   * ? @param element - 要全屏的元素，默认为根元素
   * ! @return Promise<void> 异步操作结果
   */
  async requestFullscreen(element = document.documentElement): Promise<void> {
    if (element.requestFullscreen) {
      await element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen()
    }
  }
  
  /**
   * * @description 退出全屏模式
   * ! @return Promise<void> 异步操作结果
   */
  async exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    }
  }
  
  /**
   * * @description 监听全屏状态变化
   * ? @param callback - 状态变化回调函数
   * ! @return void
   */
  onChange(callback: (isFullscreen: boolean) => void): void {
    this.callbacks.add(callback)
  }
}

export const fullscreenManager = new FullscreenManager()`,long:`#!/bin/bash
# 自动化部署脚本

set -e

APP_NAME="my-app"
IMAGE_NAME="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"

echo "开始构建应用..."

# 停止旧容器
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 构建新镜像
docker build -t $IMAGE_NAME .

# 运行新容器
docker run -d \\
  --name $CONTAINER_NAME \\
  --restart unless-stopped \\
  -p 3000:3000 \\
  -e NODE_ENV=production \\
  $IMAGE_NAME

# 健康检查
sleep 5
if curl -f http://localhost:3000/health; then
  echo "部署成功！"
else
  echo "部署失败"
  exit 1
fi

# 清理旧镜像
docker image prune -f

echo "完成！"`},Y={cpp:`#include <iostream>
#include <vector>
#include <algorithm>

class NumberProcessor {
private:
    std::vector<int> numbers;
    
public:
    /**
     * * @description 添加数字到集合中
     * ? @param num - 要添加的数字
     * ! @return void
     */
    void addNumber(int num) {
        numbers.push_back(num);
    }
    
    /**
     * * @description 计算所有数字的总和
     * ! @return int 数字总和
     */
    int getSum() const {
        return std::accumulate(numbers.begin(), numbers.end(), 0);
    }
    
    /**
     * * @description 计算数字的平均值
     * ! @return double 平均值
     */
    double getAverage() const {
        return numbers.empty() ? 0 : static_cast<double>(getSum()) / numbers.size();
    }
};

int main() {
    NumberProcessor processor;
    processor.addNumber(10);
    processor.addNumber(20);
    processor.addNumber(30);
    
    std::cout << "平均值: " << processor.getAverage() << std::endl;
    return 0;
}`,rust:`struct Calculator {
    value: f64,
}

impl Calculator {
    fn new() -> Self {
        Calculator { value: 0.0 }
    }
    
    /**
     * * @description 加法运算
     * ? @param num - 要相加的数字
     * ! @return &mut Self 返回自身引用以支持链式调用
     */
    fn add(&mut self, num: f64) -> &mut Self {
        self.value += num;
        self
    }
    
    /**
     * * @description 乘法运算
     * ? @param num - 要相乘的数字
     * ! @return &mut Self 返回自身引用以支持链式调用
     */
    fn multiply(&mut self, num: f64) -> &mut Self {
        self.value *= num;
        self
    }
    
    /**
     * * @description 获取计算结果
     * ! @return f64 当前计算值
     */
    fn result(&self) -> f64 {
        self.value
    }
}

fn main() {
    let mut calc = Calculator::new();
    let result = calc.add(10.0).multiply(2.0).result();
    println!("结果: {}", result);
}`,swift:`import Foundation

class TaskManager {
    private var tasks: [String] = []
    
    /**
     * * @description 添加任务到列表
     * ? @param task - 任务描述
     * ! @return void
     */
    func addTask(_ task: String) {
        tasks.append(task)
        print("任务已添加: \\(task)")
    }
    
    /**
     * * @description 移除指定位置的任务
     * ? @param index - 任务索引
     * ! @return void
     */
    func removeTask(at index: Int) {
        guard index < tasks.count else { return }
        let removed = tasks.remove(at: index)
        print("任务已删除: \\(removed)")
    }
    
    /**
     * * @description 列出所有任务
     * ! @return void
     */
    func listTasks() {
        for (index, task) in tasks.enumerated() {
            print("\\(index + 1). \\(task)")
        }
    }
}

let manager = TaskManager()
manager.addTask("学习 Swift")
manager.addTask("完成项目")
manager.listTasks()`,php:`<?php
class UserValidator {
    /**
     * * @description 验证邮箱格式
     * ? @param $email - 邮箱地址
     * ! @return bool 是否为有效邮箱
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * * @description 验证密码强度
     * ? @param $password - 密码字符串
     * ! @return bool 是否满足强度要求
     */
    public static function validatePassword($password) {
        return strlen($password) >= 8 && 
               preg_match('/[A-Z]/', $password) && 
               preg_match('/[a-z]/', $password) && 
               preg_match('/[0-9]/', $password);
    }
    
    /**
     * * @description 清理用户输入
     * ? @param $input - 用户输入
     * ! @return string 清理后的安全字符串
     */
    public static function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}

// 使用示例
$email = "user@example.com";
$password = "Password123";

if (UserValidator::validateEmail($email)) {
    echo "邮箱格式正确\\n";
}

if (UserValidator::validatePassword($password)) {
    echo "密码强度足够\\n";
}
?>`,ruby:`class BookLibrary
  def initialize
    @books = []
  end
  
  # * @description 添加图书到图书馆
  # ? @param title - 图书标题
  # ? @param author - 作者
  # ? @param year - 出版年份
  # ! @return void
  def add_book(title, author, year)
    book = {
      title: title,
      author: author,
      year: year,
      id: generate_id
    }
    @books << book
    puts "图书已添加: #{title}"
  end
  
  # * @description 根据作者查找图书
  # ? @param author - 作者名称
  # ! @return Array 该作者的图书列表
  def find_books_by_author(author)
    @books.select { |book| book[:author] == author }
  end
  
  # * @description 列出所有图书
  # ! @return void
  def list_books
    @books.each do |book|
      puts "#{book[:id]}: #{book[:title]} - #{book[:author]} (#{book[:year]})"
    end
  end
  
  private
  
  def generate_id
    @books.length + 1
  end
end

library = BookLibrary.new
library.add_book("Ruby程序设计", "松本行弘", 2008)
library.add_book("Rails实践", "DHH", 2010)
library.list_books`,sql:`-- 用户管理数据库设计
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引提升查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 查询活跃用户及其资料
SELECT 
    u.id,
    u.username,
    u.email,
    up.first_name,
    up.last_name,
    u.created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = true
ORDER BY u.created_at DESC;`},K={class:"code-editor-demo"},Z=B({__name:"index",setup(ee){const c=F(),A=I(),s=E("cpp"),f=E(!1),_=E(""),N={javascript:"JavaScript",typescript:"TypeScript",python:"Python",java:"Java",go:"Go",json:"JSON"};function h(n){return["simple","fullscreen","long"].includes(n)?"":N[n]}function o(n){c.success(`已复制 ${n.length} 个字符`)}function k(n){c.info(n?"已进入全屏":"已退出全屏")}async function w(){if(s.value){f.value=!0;try{await A.loadLanguage(s.value),_.value=Y[s.value]||"// 示例代码",c.success(`${s.value} 加载成功`)}catch(n){c.error(`加载失败: ${n}`)}finally{f.value=!1}}}return(n,t)=>{const U=L,l=P,S=j,C=M,g=D,R=$,x=H,d=O,b=V;return p(),T("div",K,[e(U,null,{default:r(()=>[...t[1]||(t[1]=[u("Code编辑器组件场景示例",-1)])]),_:1}),t[6]||(t[6]=q("p",{class:"mb-10px"}," 基于 NCode 封装的 C_Code 组件，集成多种API，预设常用的功能、代码高亮、复制、全屏等功能。 ",-1)),e(d,{vertical:"",size:"large"},{default:r(()=>[e(g,{title:"多语言支持"},{default:r(()=>[e(C,{type:"line",animated:""},{default:r(()=>[(p(!0),T(G,null,J(a(m),(v,i)=>(p(),y(S,{key:i,name:i,tab:h(i)},{default:r(()=>[e(l,{code:v,language:i,title:`${h(i)} 示例`,"max-height":i==="json"?300:void 0,onCopy:o},null,8,["code","language","title","max-height"])]),_:2},1032,["name","tab"]))),128))]),_:1})]),_:1}),e(g,{title:"动态语言加载"},{default:r(()=>[e(d,{vertical:""},{default:r(()=>[e(d,null,{default:r(()=>[e(R,{value:a(s),"onUpdate:value":t[0]||(t[0]=v=>X(s)?s.value=v:null),options:a(W),placeholder:"选择语言",style:{width:"200px"}},null,8,["value","options"]),e(x,{onClick:w,loading:a(f),type:"primary"},{default:r(()=>[...t[2]||(t[2]=[u(" 加载并显示 ",-1)])]),_:1},8,["loading"])]),_:1}),a(_)?(p(),y(l,{key:0,code:a(_),language:a(s),title:`${a(s).toUpperCase()} 示例`,onCopy:o},null,8,["code","language","title"])):z("",!0)]),_:1})]),_:1}),e(g,{title:"功能演示"},{default:r(()=>[e(d,{vertical:""},{default:r(()=>[e(b,{"title-placement":"left"},{default:r(()=>[...t[3]||(t[3]=[u("悬浮复制（无标题栏）",-1)])]),_:1}),e(l,{code:a(m).simple,language:"javascript","show-header":!1,onCopy:o},null,8,["code"]),e(b,{"title-placement":"left"},{default:r(()=>[...t[4]||(t[4]=[u("全屏查看",-1)])]),_:1}),e(l,{code:a(m).fullscreen,language:"typescript",title:"全屏演示","show-fullscreen":!0,onCopy:o,onFullscreen:k},null,8,["code"]),e(b,{"title-placement":"left"},{default:r(()=>[...t[5]||(t[5]=[u("限制高度",-1)])]),_:1}),e(l,{code:a(m).long,language:"bash",title:"长代码示例","max-height":200,onCopy:o},null,8,["code"])]),_:1})]),_:1})]),_:1})])}}}),ue=Q(Z,[["__scopeId","data-v-badc9cb3"]]);export{ue as default};
