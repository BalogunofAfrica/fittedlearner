---
title: Content Model v2
summary: Splitting list items from child notes for better scaling.
date: 2026-04-10
tags: architecture, content-model
project: fittedlearner-blog-engine
---

This revision separates parent items (projects and reading list entries) from child
notes. It keeps the homepage clean while allowing richer long-form updates when needed.

The pattern is:

- one parent markdown file per item,
- zero or many child notes linked by parent slug.
