# FittedLearner Blog

A personal blog built with React + TanStack Router.

The structure mirrors your requested format:

- Projects
- Articles
- Reading list

## Run locally

```bash
npm install
npm run dev
```

## Add new content

Create a markdown file in one of these folders:

- `src/content/articles/`
- `src/content/projects/`
- `src/content/project-notes/`
- `src/content/reading-list/`
- `src/content/reading-list-notes/`

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

- For projects: `status`, `url`, `repo`, `demo`
- For project notes: `project: your-project-slug`
- For related project articles: add `project: your-project-slug` in article frontmatter
- For reading-list items: `author`, `status`, `url`
- For reading-list notes: `item: your-reading-item-slug`

## Content model

- `projects` and `reading-list` are parent items.
- `project-notes` and `reading-list-notes` are optional child notes.
- You can attach zero, one, or many notes to each parent item.

## Design notes

- Typography uses Japanese-influenced pairings: `Noto Serif JP` + `Zen Kaku Gothic New`
- Calm light and dark modes are both included
- Theme preference is stored in localStorage
