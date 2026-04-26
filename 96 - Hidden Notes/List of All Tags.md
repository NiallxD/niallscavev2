---
dg-hide: true
dg-publish: true
dg-permalink: tags
Type: 
Published: 16/04/2024
tags: 
title: List of All Tags
description: List of All Tags
dg-note-icon:
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

