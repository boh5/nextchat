# NextChat

基于 Next.js 的实时在线聊天应用

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **后端服务**: 
  - 数据库: PostgreSQL (Supabase)
  - 认证: Supabase Auth
  - 实时通信: WebSocket (Socket.IO)
- **ORM**: Drizzle
- **缓存**: Redis
- **类型安全**: TypeScript

## 主要功能

- 用户认证 (Supabase Auth)
  - 邮箱/密码登录
  - OAuth 社交登录 (Google, GitHub)
  - 会话管理

- 即时通讯
  - 私聊对话
  - 群组聊天
  - 在线状态显示
  - 已读/未读状态
  - 消息通知

- 消息功能
  - 文本消息
  - 表情/贴纸
  - 图片上传 (Supabase Storage)
  - 消息编辑/撤回
  - 消息历史记录

## 项目结构

- `app/`: Next.js App Router 结构的主目录
  - `(auth)/`: 包含登录、注册等认证页面
  - `(chat)/`: 包含聊天室、对话列表等页面
  - `api/`: 后端 API 路由实现

- `components/`: 可复用的 React 组件
  - `auth/`: 登录表单、注册表单等认证组件
  - `chat/`: 消息列表、聊天输入框等聊天组件
  - `ui/`: 按钮、输入框等基础 UI 组件

- `lib/`: 项目核心逻辑
  - `db/`: 数据库模型和查询
  - `supabase/`: Supabase 客户端和工具
  - `utils/`: 日期格式化、验证等通用工具

- `types/`: 全局 TypeScript 类型定义
- `public/`: 图片、字体等静态资源
- `styles/`: 全局 CSS 样式
