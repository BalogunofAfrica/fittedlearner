# FittedLearner Blog

A personal blog built with React + TanStack Router.

The structure mirrors your requested format:

- Projects
- Articles
- Reading notes

## Run locally

```bash
npm install
npm run dev
```

## Add new content

Create a markdown file in one of these folders:

- `src/content/articles/`
- `src/content/projects/`
- `src/content/reading-notes/`

Use this frontmatter format:

```md
---
title: Your title
summary: One-line summary
date: 2026-04-09
tags: tag-one, tag-two
---

Your markdown content here.
```

Optional metadata fields are supported and shown automatically on detail pages.
Examples:

- For projects: `status`, `repo`, `demo`
- For reading notes: `author`, `source`, `buy`

## Design notes

- Typography uses Japanese-influenced pairings: `Noto Serif JP` + `Zen Kaku Gothic New`
- Calm light and dark modes are both included
- Theme preference is stored in localStorage
