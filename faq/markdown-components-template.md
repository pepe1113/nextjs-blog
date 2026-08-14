# Markdown / MDX 元件範本

新增文章時可複製以下範本，再刪除不需要的區塊。

```mdx
---
title: '文章標題'
date: '2026-08-14'
tags: ['標籤']
draft: true
summary: '文章摘要'
---

## 一般引用

> 適合引用原文或補充一句話。

## Notice

<Notice type="note" title="自訂標題">

適合一般補充資訊，`title` 可以省略。

</Notice>

<Notice type="tip">適合實用提示。</Notice>

<Notice type="info">適合需要讀者留意的資訊。</Notice>

<Notice type="warning">適合可能造成問題的操作。</Notice>

<Notice type="danger">適合不可逆或高風險操作。</Notice>

## 社群帳號

<SocialAccountLink kind="github" account="帳號" />
```

`Notice` 支援 `note`、`tip`、`info`、`warning`、`danger`。未填 `title` 時會顯示對應 icon；語意與版型參考 [Docusaurus Admonitions](https://docusaurus.io/zh-CN/docs/markdown-features/admonitions)。
