# NextChat

基于 Next.js 15 (App Router) 的在线社交聊天应用。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **后端服务**:
  - 数据库: PostgreSQL
  - 认证: Auth.js
  - API: tRPC
  - 实时通信: WebSocket (Socket.IO)
- **ORM**: Drizzle
- **缓存**: Redis
- **类型安全**: TypeScript

## 主要功能

- 用户系统
  - 用户认证 (Auth.js)
    - OAuth 社交登录 (Google, GitHub)
    - 邮箱/密码登录
    - 会话管理与安全
  - 个人资料管理
    - 头像上传
    - 个人信息编辑
  - 在线状态显示

- 社交功能
  - 好友系统
    - 添加/删除好友
    - 好友列表管理
    - 好友请求处理
  - 群组系统
    - 创建/加入群组
    - 群组管理
    - 群成员权限控制

- 即时通讯
  - 私聊功能
    - 一对一聊天
    - 消息已读/未读状态
  - 群聊功能
    - 群组消息
    - @成员提醒
  - 消息类型支持
    - 文本消息
    - 表情/贴纸
    - 图片分享
    - 文件传输
  - 消息管理
    - 消息编辑
    - 消息撤回
    - 消息历史记录
  - 消息通知
    - 新消息提醒
    - 未读消息统计

## 项目结构

```
nextchat/
├── app/                      # Next.js App Router 目录
│   ├── (auth)/              # 认证相关路由
│   ├── (chat)/              # 聊天相关路由
│   ├── api/                 # API 路由
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
│
├── components/              # React 组件
│   ├── auth/                # 认证相关组件
│   ├── chat/                # 聊天相关组件
│   ├── friend/              # 好友管理组件
│   ├── group/               # 群组管理组件
│   ├── providers/           # 应用提供者组件
│   └── ui/                  # UI 基础组件 (shadcn/ui)
│
├── lib/                     # 工具函数和配置
│   ├── auth/               # 认证相关配置
│   ├── db/                 # 数据库相关
│   └── trpc/               # tRPC 相关
├── hooks/                   # React Hooks
├── server/                  # 服务器端代码
│   ├── routers/            # tRPC 路由
│   └── trpc.ts             # tRPC 配置
├── drizzle.config.ts       # Drizzle ORM 配置
├── tailwind.config.ts      # Tailwind CSS 配置
└── next.config.js          # Next.js 配置
```

## 开发指南

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- pnpm

### 环境变量

创建 `.env` 文件并配置以下环境变量：

```bash
# 数据库
DATABASE_URL=

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth 提供商
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
```

### 安装

```bash
# 安装依赖
pnpm install

# 初始化数据库
pnpm db:push

# 启动开发服务器
pnpm dev
```

### 数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移
pnpm db:push
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情