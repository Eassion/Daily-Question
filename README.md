# Daily Question

前后端分离的每日一题网站：

- 后端：`Spring Boot 3 + MyBatis + MySQL`
- 前端：`Vue 3 + Vite + Vue Router + Axios + Element Plus`

## 目录结构

```text
frontend/                    Vue 前端工程
src/main/java/               Spring Boot 后端代码
src/main/resources/          后端配置与 SQL 初始化脚本
deploy/backend/              后端镜像与构建脚本
deploy/frontend/             前端镜像与 Nginx 配置
deploy/compose/              联合部署示例
```

## 本地启动

### 1. 数据库

```sql
CREATE DATABASE daily_question DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

默认连接配置在 [application.yml](/d:/Projects/VScodeProjects/Daily-Question/src/main/resources/application.yml)。

### 2. 启动后端

```bash
mvn spring-boot:run
```

默认地址：

```text
http://localhost:8080
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173
```

## 前端环境变量

开发环境示例：

```text
frontend/.env.example
```

生产环境示例：

```text
frontend/.env.production.example
```

核心变量：

```text
VITE_API_BASE_URL=https://api.your-domain.com
```

## 后端环境变量

后端支持环境变量覆盖配置，常用项：

```text
SERVER_PORT
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_SQL_INIT_MODE
APP_INVITE_TOKEN
APP_INVITE_PASSCODE
APP_CORS_ALLOWED_ORIGINS
```

生产环境默认会加载：

```text
src/main/resources/application-prod.yml
```

## 接口

- `GET /api/questions`
- `POST /api/questions`
- `PATCH /api/questions`
- `PUT /api/questions`

## Docker 部署

### 后端镜像

PowerShell:

```powershell
./deploy/backend/build-image.ps1
```

Shell:

```bash
sh ./deploy/backend/build-image.sh
```

### 前端镜像

PowerShell:

```powershell
./deploy/frontend/build-image.ps1
```

Shell:

```bash
sh ./deploy/frontend/build-image.sh
```

### 联合部署示例

```bash
docker compose -f deploy/compose/docker-compose.prod.yml up -d
```

真正上线时建议按下面步骤：

1. 构建后端镜像
2. 构建前端镜像
3. 复制 `deploy/compose/.env.prod.example` 为 `deploy/compose/.env.prod`
4. 把域名、数据库密码、邀请口令改成你自己的
5. 把 SSL 证书放到 `deploy/nginx/ssl/`
6. 执行：

```bash
sh ./deploy/compose/start-prod.sh
```

或 PowerShell：

```powershell
./deploy/compose/start-prod.ps1
```

这套生产部署结构是：

- `gateway`：统一对外暴露 `80/443`
- `frontend`：只在 Docker 内网提供静态站点
- `backend`：只在 Docker 内网提供 Spring Boot API
- `mysql`：只在 Docker 内网提供数据库

外部域名访问路径：

- `https://your-domain.com/` -> 前端
- `https://your-domain.com/api/*` -> 后端

## 说明

- 旧的 Spring Boot `static` 页面已经移除
- 后端首次初始化时会执行 `schema.sql` 和 `data.sql`
- 生产环境建议把数据库、邀请口令、跨域域名都改成环境变量管理
