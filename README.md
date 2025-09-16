# AnyRouter 多账号自动签到 - Node.js 版

这是 [AnyRouter 签到工具](https://github.com/millylee/anyrouter-check-in) 的 Node.js 版本实现。


用于 Claude Code 中转站 Any Router 多账号每日签到，一次 $25，限时注册即送 100 美金，[点击这里注册](https://anyrouter.top/register?aff=2cOj)。

## 功能特性

- ✅ 单个/多账号自动签到
- ✅ 多种机器人通知（可选）
- ✅ 绕过 WAF 限制
- ✅ 使用 Playwright 模拟真实浏览器
- ✅ Node.js 原生实现，性能更优

## 技术栈

- Node.js 18+
- Playwright (浏览器自动化)
- Axios (HTTP 请求)
- Nodemailer (邮件通知)

## 使用方法

### 1. Fork 本仓库

点击右上角的 "Fork" 按钮，将本仓库 fork 到你的账户。

### 2. 获取账号信息

对于每个需要签到的账号，你需要获取：
1. **Cookies**: 用于身份验证（主要是 session 值）
2. **API User**: 用于请求头的 new-api-user 参数

#### 获取 Cookies：
1. 打开浏览器，访问 https://anyrouter.top/
2. 登录你的账户
3. 打开开发者工具 (F12)
4. 切换到 "Application" 或 "存储" 选项卡
5. 找到 "Cookies" -> "https://anyrouter.top"
6. 复制 `session` 的值

#### 获取 API User：
1. 在开发者工具中切换到 "Network" 选项卡
2. 过滤只显示 Fetch/XHR 请求
3. 刷新页面或进行任何操作
4. 找到请求头中包含 `New-Api-User` 的请求
5. 复制这个值（通常是 5 位数字）

### 3. 设置 GitHub Environment Secret

1. 在你 fork 的仓库中，点击 "Settings" 选项卡
2. 在左侧菜单中找到 "Environments" -> "New environment"
3. 新建一个名为 `production` 的环境
4. 点击新建的 `production` 环境进入环境配置页
5. 点击 "Add environment secret" 创建 secret：
   - Name: `ANYROUTER_ACCOUNTS`
   - Value: 你的多账号配置数据（JSON 格式）

### 4. 多账号配置格式

```json
[
  {
    "cookies": {
      "session": "你的第一个账号session值"
    },
    "api_user": "12345"
  },
  {
    "cookies": {
      "session": "你的第二个账号session值"
    },
    "api_user": "67890"
  }
]
```

### 5. 启用 GitHub Actions

1. 在你的仓库中，点击 "Actions" 选项卡
2. 如果提示启用 Actions，请点击启用
3. 找到 "AnyRouter 自动签到 (Node.js)" workflow
4. 点击 "Enable workflow"

### 6. 测试运行

你可以手动触发一次签到来测试：

1. 在 "Actions" 选项卡中，点击 "AnyRouter 自动签到 (Node.js)"
2. 点击 "Run workflow" 按钮
3. 确认运行
4. 查看运行日志确认是否成功

## 本地开发

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 或 yarn

### 安装和运行

```bash
# 克隆仓库
git clone https://github.com/your-username/anyrouter-check-in.git
cd anyrouter-check-in/anyrouter-checkin-node

# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install chromium

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的账号信息

# 运行签到
npm start
```

### 运行测试

```bash
npm test
```

## 配置通知（可选）

脚本支持多种通知方式，在 GitHub Secrets 或本地 `.env` 文件中配置：

### 邮箱通知
- `EMAIL_USER`: 发件人邮箱地址
- `EMAIL_PASS`: 发件人邮箱密码/授权码
- `EMAIL_TO`: 收件人邮箱地址

### 钉钉机器人
- `DINGDING_WEBHOOK`: 钉钉机器人的 Webhook 地址

### 飞书机器人
- `FEISHU_WEBHOOK`: 飞书机器人的 Webhook 地址

### 企业微信机器人
- `WEIXIN_WEBHOOK`: 企业微信机器人的 Webhook 地址

### PushPlus 推送
- `PUSHPLUS_TOKEN`: PushPlus 的 Token

### Server酱
- `SERVERPUSHKEY`: Server酱的 SendKey

## 执行时间

- 脚本每 6 小时自动执行一次
- 你也可以随时手动触发签到
- 注意：GitHub Actions 可能有 1-1.5 小时的延迟

## 注意事项

- 请确保每个账号的 cookies 和 API User 都是正确的
- Session 理论上 1 个月有效期，但可能会提前失效
- 如果出现 401 错误，请重新获取 session
- 可以在 Actions 页面查看详细的运行日志

## 与 Python 版本的区别

| 特性 | Python 版 | Node.js 版 |
|-----|----------|------------|
| 运行环境 | Python 3.11+ | Node.js 18+ |
| 包管理器 | uv | npm |
| 浏览器自动化 | Playwright Python | Playwright Node.js |
| HTTP 请求 | httpx | axios |
| 异步处理 | asyncio | async/await |
| 启动速度 | 较慢 | 较快 |
| 内存占用 | 较高 | 较低 |

## 故障排除

如果签到失败，请检查：

1. **账号配置格式是否正确**
   - 确保是有效的 JSON 格式
   - 确保包含必需的 cookies 和 api_user 字段

2. **Session 是否过期**
   - 重新登录获取新的 session 值
   - 更新 GitHub Secrets 中的配置

3. **API User 是否正确**
   - 确保是正确的 5 位数字
   - 不是负数或个位数

4. **查看 Actions 运行日志**
   - 检查具体的错误信息
   - 根据错误提示进行修复

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License

## 免责声明

本脚本仅用于学习和研究目的，使用前请确保遵守相关网站的使用条款。