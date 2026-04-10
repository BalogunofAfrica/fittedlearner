---
title: Building a TanStack Writing Workflow
summary: How this blog balances calm design with fast publishing.
date: 2026-04-09
tags: react, tanstack, workflow
---

I wanted this site to feel like a quiet studio, not a dashboard. The build starts with
TanStack Router so pages stay simple and composable, then uses markdown files for content.

The key decision was avoiding CMS overhead. If I can write in markdown and commit it,
the site gets updated with zero extra tooling.

## Why this setup works

- Content is local and versioned with the code.
- New posts are added by creating a single `.md` file.
- Route structure stays explicit and easy to read.

For a personal site, that tradeoff feels right.
