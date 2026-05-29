# 每日面试题

一个公开浏览、受邀上传的每日面试题网站。当前部署使用 Netlify Functions + Netlify Blobs 保存数据，不需要自建服务器或单独数据库。

## 本地预览

直接在浏览器打开 `index.html` 时会使用内置演示数据。线上 Netlify 环境会自动调用 `/api/questions` 读写真实数据。

## Netlify 配置

需要在 Netlify 项目里配置两个环境变量：

```text
INVITE_TOKEN=你的邀请 token
INVITE_PASSCODE=你的上传口令
```

分享上传链接：

```text
https://你的站点.netlify.app/?invite=你的邀请token#/upload
```

## 功能

- 首页展示最新上传题目。
- 答案默认隐藏，点击后展开。
- 公开浏览全部题目和分类。
- 受邀者可上传题目，可选择已有分类或输入新分类。
- 受邀者可给无答案题目补充一次正式答案。
- 受邀者可编辑已上传题目，用于修正错别字、分类、标签、来源或答案。
