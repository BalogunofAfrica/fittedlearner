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

Create markdown files using this nested structure:

- `src/content/articles/*.md`
- `src/content/projects/<project-slug>/overview.md`
- `src/content/projects/<project-slug>/notes/*.md`
- `src/content/reading-list/<item-slug>/overview.md`
- `src/content/reading-list/<item-slug>/notes/*.md`

Example:

```text
src/content/projects/refactoring-ui/
  overview.md
  notes/
    visual-rhythm.md
```

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
- For related project articles: add `project: your-project-slug` in article frontmatter
- For reading-list items: `author`, `status`, `url`
- For notes under projects/reading-list: no parent field required, folder nesting defines parent

## Content model

- `projects` and `reading-list` are parent items.
- Notes live inside each parent folder under `notes/`.
- You can attach zero, one, or many notes to each parent item.

## Design notes

- Typography uses Japanese-influenced pairings: `Noto Serif JP` + `Zen Kaku Gothic New`
- Calm light and dark modes are both included
- Theme preference is stored in localStorage
