---
title: niallbell.com Updates
author: Niall Bell
date: 2026-05-04
Type: Blog Post
publish: true
permalink: /blog/niallbell-com-updates
description: After several years of working with the Digital Garden Plugin for Obsidian, I decided I needed to break free of the constrains baked into that plugin (not a bad thing!). Here is what I'm up to!
excerpt: After several years of working with the Digital Garden Plugin for Obsidian, I decided I needed to break free of the constrains baked into that plugin (not a bad thing!). Here is what I'm up to!
tags:
  - photography
  - web
  - webdevelopment
heroImage: https://i.imgur.com/2ijpl7Q.png
current_project: true
---
After several years of working with the Digital Garden Plugin for Obsidian, I decided I needed to break free of the constrains baked into that plugin (not a bad thing!). Here is what I'm up to!

## My Personal Website History

First things first it's worth spending a moment to run over the history of my personal website, as I've changed and rebuilt it several times over the years. I purchased my domains over 10 years ago, starting with niallbell.co.uk and soon after niallbell.com. I hosted a portfolio at these domains through via SquareSpace for a few years. After a couple price increases I started looking for other options and landed on Wordpress hosted with FastHost. This was great, but I soon realised that the entry rates were not going to last forever, and the costs swelled. This had me looking for other options.

After five years with Wordpress I moved to a completed free, static solution which made use of the Markdown Text Editor, Obsidian, and a community plugin - Digital Garden. This combination is essentially a static site generator (SSG) built on Eleventy which uses a standard template format to layout the site, and markdown notes for the content. The whole thing is deployed and hosted by one of a few serverless environment hosts such as Vercel or GitHub Pages, for free.

For the most part this worked great. My only cost was the maintenance of my domain names, which is something I want to keep regardless. The Digital Garden plugin makes launching a simple website easy and offers lots of customisability. Its all open source and works fairly flawlessly. But it is restrictive to some senses, and this is what started to get in my way.

## A Move to Eleventy

I was looking to refresh my wesbite with an updated theme and kept running into awkward code and updates through the plugin. I opted to lean into the idea of working with Eleventy directly, and built templates with Nunjucks to really get the site I wanted, with full control. So this is what I did...and boy did I take on more than I anticipated.

Now, Claude Code helped me out with some of the mundane code generation, and eventually I started to build a framework that works for me.

My Framework:

- .md notes form the content for Galleries and Blog Posts
- Main pages have their own .njk template
- YAML Frontmatter is used for configuration of pages
- JS and CSS for functionality and styling

## What I'm Working on Now

Updating the content of my site. This iteration has captions and titles for all photographs, and I have to go through and add them in as the previous versions didn't have that. I'm also working on some fun and whacky parallels to my website, which exist alongside the main, professional site, but add some character and fun, ideas which I've had for years - See if you can find any.

This is all really, I'm just working away on building this new iteration for fun.

Thanks for the quick read, and thanks for visiting my website!

Niall
