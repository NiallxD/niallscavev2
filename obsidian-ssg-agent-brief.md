# Obsidian → static site pipeline

> A custom publishing system using Obsidian as the writing environment, with full template control and GitHub Pages deployment.

---

## Context

The Obsidian vault is the content source only. Markdown files with frontmatter are the raw material. The static site generator owns all structure, layout, and output. No opinionated theme systems — full template control is the primary requirement.

---

## Repo structure to scaffold

```
my-vault/
├── .git/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── content/              # markdown source files (Obsidian writes here)
├── templates/            # HTML layout templates
├── static/               # CSS, JS, fonts, images
├── eleventy.config.js
├── package.json
└── .gitignore
```

---

## Tasks

### 1. SSG setup

Initialise Eleventy (`@11ty/eleventy`). Configure `eleventy.config.js` to read from `content/` and write to `_site/`. Set up template engine (Nunjucks preferred). Wire up passthrough copy for `static/`.

### 2. Frontmatter conventions

Define a standard frontmatter schema. At minimum:

```yaml
---
title: My note title
date: 2024-01-01
published: true
layout: post.njk
tags: [writing, dev]
---
```

Configure Eleventy to skip any note where `published: false` or the field is absent.

### 3. Base templates

Create a `base.njk` layout with `<head>`, nav, and footer slots. Add a `post.njk` that extends it for content pages. Keep them minimal — these are the user's canvas.

### 4. Dev server

Eleventy's built-in dev server (`--serve` flag) provides live reload out of the box. Add an npm script:

```json
"scripts": {
  "dev": "eleventy --serve",
  "build": "eleventy"
}
```

Confirm hot reload works on both content and template changes.

### 5. GitHub Actions workflow

Create `.github/workflows/deploy.yml` triggered on push to `main`. Steps:

1. Checkout repo
2. Setup Node
3. Install dependencies
4. Run Eleventy build
5. Deploy `_site/` to `gh-pages` branch using `peaceiris/actions-gh-pages`

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

### 6. .gitignore

```
.obsidian/
node_modules/
_site/
.env
.DS_Store
```

---

## Decisions made

| Decision | Choice |
|---|---|
| Static site generator | Eleventy |
| Template engine | Nunjucks |
| Hosting | GitHub Pages |
| Deploy method | `gh-pages` branch |
| Wikilinks | Standard markdown links (no conversion) |

---

## Out of scope (for now)

Wikilink conversion, backlink graphs, search indexing, CMS UI, image optimisation pipelines, custom domain DNS setup.

---

## How to run this with Claude Code

Point Claude Code at the vault root. Paste this brief. Ask it to work through the tasks in order, confirming the file structure before writing any config. Review templates before it moves to the GitHub Actions step.

Suggested prompt:

> Work through these tasks in order. Ask me before making any decisions not covered in this brief. Confirm the file structure with me before writing any config files.
