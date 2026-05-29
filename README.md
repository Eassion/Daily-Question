# 每日面试题

一个公开浏览、受邀上传的每日面试题网站。当前实现是无需构建的静态版本，直接打开 `index.html` 即可预览；配置 Supabase 后可启用真实数据写入。

## 本地预览

直接在浏览器打开 `index.html`。如果 `src/config.js` 里没有 Supabase 配置，页面会使用内置演示数据。

## Supabase 配置

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 创建邀请 token：

```sql
insert into public.invite_tokens (token, passcode_hash)
values ('team-2026', crypt('shared-passcode', gen_salt('bf')));
```

3. 把 `src/config.example.js` 的内容复制到 `src/config.js`，填入项目 URL 和 anon key。
4. 分享上传链接：

```text
index.html?invite=team-2026#/upload
```

## 功能

- 首页展示最新上传题目。
- 答案默认隐藏，点击后展开。
- 公开浏览全部题目和分类。
- 受邀者可上传题目，可选择已有分类或输入新分类。
- 受邀者可给无答案题目补充一次正式答案。
- 受邀者可编辑已上传题目，用于修正错别字、分类、标签、来源或答案。
