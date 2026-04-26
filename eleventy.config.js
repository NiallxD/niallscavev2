import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import markdownIt from "markdown-it";

function buildWikilinkMap(rootDir) {
  const map = new Map();
  const skip = new Set(["node_modules", "_site", ".obsidian", ".git", "96 - Hidden Notes", "99 - Not For Publish", "98 - Media", "97 - Drafts"]);
  function walk(dir) {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        try {
          if (statSync(full).isDirectory()) {
            if (!skip.has(entry)) walk(full);
          } else if (extname(entry) === ".md") {
            const raw = readFileSync(full, "utf8");
            const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
            if (!/^publish:\s*true/m.test(fm)) continue;
            const permalink = fm.match(/^permalink:\s*(.+)$/m)?.[1]?.trim();
            const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
            if (!permalink) continue;
            const url = (permalink.startsWith("/") ? permalink : "/" + permalink).replace(/\/?$/, "/");
            if (title) map.set(title.toLowerCase(), url);
            map.set(entry.replace(/\.md$/, "").toLowerCase(), url);
          }
        } catch {}
      }
    } catch {}
  }
  walk(rootDir);
  return map;
}

function wikilinkPlugin(md, wikilinkMap) {
  md.core.ruler.push("wikilinks", (state) => {
    for (const block of state.tokens) {
      if (block.type !== "inline" || !block.children) continue;
      const out = [];
      for (const tok of block.children) {
        if (tok.type !== "text" || !tok.content.includes("[[")) {
          out.push(tok);
          continue;
        }
        const re = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
        let last = 0, m;
        let matched = false;
        while ((m = re.exec(tok.content)) !== null) {
          matched = true;
          if (m.index > last) {
            const t = new state.Token("text", "", 0);
            t.content = tok.content.slice(last, m.index);
            out.push(t);
          }
          const [, page, display] = m;
          const label = (display || page).trim();
          const href = wikilinkMap.get(page.trim().toLowerCase()) ?? wikilinkMap.get((display || page).trim().toLowerCase());
          if (href) {
            const o = new state.Token("link_open", "a", 1);
            o.attrs = [["href", href], ["class", "wikilink"]];
            out.push(o);
            const t = new state.Token("text", "", 0);
            t.content = label;
            out.push(t);
            out.push(new state.Token("link_close", "a", -1));
          } else {
            const t = new state.Token("html_inline", "", 0);
            t.content = `<span class="wikilink">${label}</span>`;
            out.push(t);
          }
          last = m.index + m[0].length;
        }
        if (matched && last < tok.content.length) {
          const t = new state.Token("text", "", 0);
          t.content = tok.content.slice(last);
          out.push(t);
        } else if (!matched) {
          out.push(tok);
        }
      }
      block.children = out;
    }
  });
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Markdown-it with HTML enabled + wikilinks
  const wikilinkMap = buildWikilinkMap(".");
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  wikilinkPlugin(md, wikilinkMap);
  eleventyConfig.setLibrary("md", md);

  // Strip Obsidian artifacts from rendered post content
  eleventyConfig.addTransform("stripObsidianArtifacts", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    // Remove hashtag-only paragraphs (#nature #wildlife etc.)
    content = content.replace(/<p>(\s*#[\w-]+)+\s*<\/p>/g, "");
    // Remove reading-time paragraph (Obsidian plugin, JS never runs)
    content = content.replace(/<p[^>]*id="reading-time"[^>]*>[\s\S]*?<\/p>/g, "");
    // Remove first <h1> inside .post-content (duplicate of frontmatter title in header)
    content = content.replace(
      /(<div class="post-content">)\s*<h1>[\s\S]*?<\/h1>/,
      "$1"
    );
    return content;
  });

  // Transform Obsidian callouts into styled divs
  eleventyConfig.addTransform("callouts", (content, outputPath) => {
    if (typeof outputPath !== "string" || !outputPath.endsWith(".html")) return content;
    return content.replace(
      /<blockquote>\s*<p>\[!([\w-]+)\]([^<\n]*)([\s\S]*?)<\/blockquote>/g,
      (_, type, titleRaw, bodyRaw) => {
        const t = type.toLowerCase();
        const title = titleRaw.trim() || type;
        let body = bodyRaw;
        if (body.startsWith("\n")) {
          body = body.replace(/^\n/, "").replace(/<\/p>\s*$/, "").trim();
          body = body ? `<p>${body}</p>` : "";
        } else {
          body = body.replace(/^<\/p>\s*/, "").trim();
        }
        return `<div class="callout callout-${t}"><div class="callout-title">${title}</div><div class="callout-body">${body}</div></div>`;
      }
    );
  });

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  eleventyConfig.addFilter("getAllTags", (collection) => {
    const tags = new Set();
    (collection || []).forEach(item => {
      (item.data.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  eleventyConfig.addCollection("posts", (api) =>
    api.getAll()
      .filter((i) => {
        const publish = String(i.data.publish).trim().toLowerCase() === "true";
        const type = String(i.data.Type || "").trim().toLowerCase() === "blog post";
        return publish && type;
      })
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  );

  eleventyConfig.addCollection("featuredPosts", (api) =>
    api.getAll()
      .filter((i) => {
        const publish = String(i.data.publish).trim().toLowerCase() === "true";
        const type = String(i.data.Type || "").trim().toLowerCase() === "blog post";
        return publish && type && i.data.featured === true;
      })
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  );

  eleventyConfig.addCollection("regularPosts", (api) =>
    api.getAll()
      .filter((i) => {
        const publish = String(i.data.publish).trim().toLowerCase() === "true";
        const type = String(i.data.Type || "").trim().toLowerCase() === "blog post";
        return publish && type && i.data.featured !== true;
      })
      .sort((a, b) => (b.date || 0) - (a.date || 0))
  );

  eleventyConfig.addCollection("projects", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Project")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  eleventyConfig.addCollection("galleries", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Gallery" && !i.data["home-gallery"])
      .sort((a, b) => (a.data.title || "").localeCompare(b.data.title || ""))
  );

  eleventyConfig.addCollection("featuredGalleries", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Gallery" && i.data.featured === true && !i.data["home-gallery"])
      .sort((a, b) => (a.data.title || "").localeCompare(b.data.title || ""))
  );

  eleventyConfig.addCollection("regularGalleries", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Gallery" && i.data.featured !== true && !i.data["home-gallery"])
      .sort((a, b) => (a.data.title || "").localeCompare(b.data.title || ""))
  );

  eleventyConfig.addCollection("homeGallery", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data["home-gallery"] === true)
  );

  eleventyConfig.addFilter("extractImages", (html) => {
    if (!html) return [];
    const re = /<img\s[^>]*>/g;
    const imgs = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      const tag = m[0];
      const src = (tag.match(/src="([^"]+)"/) || [])[1];
      const alt = (tag.match(/alt="([^"]*)"/) || [])[1] || "";
      if (src) imgs.push({ src, alt });
    }
    return imgs;
  });

  eleventyConfig.addFilter("parseGalleryBlocks", (html) => {
    if (!html) return [];
    
    const hasH2 = /<h2/i.test(html);
    const slides = [];

    if (hasH2) {
      const blocks = html.split(/(?=<h2)/i);
      for (let block of blocks) {
        if (!block.trim()) continue;
        
        let blockTitle = "";
        const titleMatch = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        if (titleMatch) {
          blockTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        }
        
        // Isolate everything that ISN'T the title and ISN'T the media tags to find the caption
        const contentWithoutTitle = block.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '');
        
        // Collect all iframes
        const iframeRegex = /<iframe[^>]+src="([^"]+)"[^>]*>.*?<\/iframe>/gi;
        const iframesFound = [];
        let im;
        while ((im = iframeRegex.exec(contentWithoutTitle)) !== null) {
          iframesFound.push(im[1]);
        }

        // Collect all images
        const imgRegex = /<img[^>]+src="([^"]+)"/gi;
        const imgsFound = [];
        let igm;
        while ((igm = imgRegex.exec(contentWithoutTitle)) !== null) {
          imgsFound.push(igm[1]);
        }

        // Extract "pure" caption by removing the media tags
        const pureCaption = contentWithoutTitle
          .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
          .replace(/<img[^>]+>/gi, '')
          .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
          .trim();

        // Add iframes as slides
        iframesFound.forEach((src, idx) => {
          slides.push({
            type: "iframe",
            src: src,
            title: iframesFound.length > 1 ? `${blockTitle} (${idx + 1})` : blockTitle,
            caption: idx === 0 ? pureCaption : ""
          });
        });

        // Add images as slides (if no iframes in this block, or in addition to iframes)
        imgsFound.forEach((src, idx) => {
          slides.push({
            type: "image",
            src: src,
            title: imgsFound.length > 1 ? `${blockTitle} (${idx + 1})` : blockTitle,
            caption: (idx === 0 && iframesFound.length === 0) ? pureCaption : ""
          });
        });

        // Check for raw URLs if nothing else found
        if (iframesFound.length === 0 && imgsFound.length === 0) {
          const urlRegex = /(https?:\/\/[^\s<"']+\.(?:jpg|jpeg|png|gif|webp|avif|JPG|JPEG|PNG|GIF|WEBP|AVIF))/gi;
          const urlsFound = [];
          let um;
          while ((um = urlRegex.exec(contentWithoutTitle)) !== null) {
            urlsFound.push(um[1]);
          }
          urlsFound.forEach((src, idx) => {
            slides.push({
              type: "image",
              src: src,
              title: urlsFound.length > 1 ? `${blockTitle} (${idx + 1})` : blockTitle,
              caption: idx === 0 ? pureCaption : ""
            });
          });
        }
      }
    }

    if (slides.length === 0) {
      const re = /<img\s[^>]*>/g;
      let m;
      while ((m = re.exec(html)) !== null) {
        const tag = m[0];
        const imgsrc = (tag.match(/src="([^"]+)"/) || [])[1];
        const imgalt = (tag.match(/alt="([^"]*)"/) || [])[1] || "";
        if (imgsrc) slides.push({ type: "image", src: imgsrc, title: imgalt, caption: "" });
      }
    }
    
    return slides;
  });

  eleventyConfig.addCollection("photoStories", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Photo Story")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("books", (api) =>
    api.getAll()
      .filter((i) => String(i.data.publish).trim().toLowerCase() === "true" && i.data.Type === "Bookshelf")
      .sort((a, b) => {
        const aDate = a.data.read ? new Date(a.data.read) : new Date(0);
        const bDate = b.data.read ? new Date(b.data.read) : new Date(0);
        return bDate - aDate;
      })
  );

  return {
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
    dir: {
      input: ".",
      output: "_site",
      includes: "templates",
      layouts: "templates",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
