---
title: List of All Tags
publish: true
permalink: tags
description: List of All Tags
excerpt: List of All Tags
hide: true
Published: 16/04/2024
---

# List of All Tags

These are all the tags used in the Cave. You can click a tag below to view all posts with that tag.

```dataview
TABLE WITHOUT ID (tag + "(" + length(rows.file.link) + ")") AS Tags
WHERE file.tags
FLATTEN file.tags AS tag
GROUP BY tag
SORT length(rows.file.link) DESC
```
