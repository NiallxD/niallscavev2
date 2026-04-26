# Niall Bell Portfolio - Project State

## 🎯 Overall Goal
Modernize Niall Bell's personal portfolio and blog with an editorial-grade Eleventy site, featuring high-impact photography showcases, a professional profile, and a streamlined Obsidian workflow.

## 🛠 Architectural Mandates
- **Typography:** 100% Sans-Serif (`var(--font-sans)`). Global paragraphs use `1.1rem` size and `var(--color-secondary)`.
- **Frontmatter:** Standardized keys (no `dg-` prefix). Use `publish`, `permalink`, `Type`, `author`, `date`, `excerpt`, `featured`, `heroImage`, `profilePicture`.
- **Collections:** Normalization of `Type` (Blog Post, Gallery, Project, etc.) drives the automated index grids.
- **Galleries:** Slides generated from Markdown `## Header` blocks. Supports images and `<iframe>` 360 viewers. Multi-media under one header creates unique slides (e.g., "Title (1)", "Title (2)").

## 🎨 Visual System
- **Green Accent:** `var(--color-link)` (#2d6a4f light / #52b788 dark) used for major headers, tags, and interactive elements.
- **Card Design:** Unified "slick" cards across Blog, Projects, and About page. Headers are uppercase, bold, and green. Metadata is muted and small.
- **About Page:** Dual-purpose layout with a personal "Me" intro (row with square photo) and a professional "Profile" (CV-grade experience/skills/education cards).
- **Footer:** Subtle grey background (`#f4f4f2` light / `#1a1a1a` dark). Logo automatically swaps to white version in dark mode.

## 📂 Key Files
- `templates/base.njk`: Site shell with theme toggle and dark mode logo logic.
- `templates/about.njk`: Professional profile layout.
- `templates/gallery.njk`: Hybrid slideshow/viewer with dynamic captioning.
- `eleventy.config.js`: Contains `parseGalleryBlocks` (the heart of the gallery parsing) and collection filters.
- `static/css/style.css`: Master stylesheet containing all "slick" UI rules.

## ✅ Completed Milestones
- [x] Vault-wide frontmatter standardization (150+ files).
- [x] Restoration of truncated Quartz content.
- [x] Full redesign of the About page professional CV.
- [x] Global typography unification (Sans-serif).
- [x] 360 Panorama iframe integration in slideshows.

## 🚀 Ongoing / Next Steps
- Verify mobile "tap" states for the newest CV cards.
- Final audit for any remaining Quartz-specific Markdown artifacts.
- Monitor `_site` builds to ensure CSS minification/deployment is stable.
