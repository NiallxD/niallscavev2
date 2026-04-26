export default {
  layout: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return data.layout;
    if (data.Type === "Gallery") return "gallery.njk";
    if (["Blog Post", "Photo Story", "Photo Analysis"].includes(data.Type)) return "post.njk";
    return data.layout || "standard.njk";
  },

  permalink: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return undefined;
    const publish = String(data.publish).trim().toLowerCase() === "true";
    if (!publish || data.Type === "Project") return false;
    if (data.permalink) {
      const p = data.permalink.replace(/\/$/, "");
      return p + "/index.html";
    }
    return undefined;
  },

  eleventyExcludeFromCollections: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return false;
    const publish = String(data.publish).trim().toLowerCase() === "true";
    return !publish;
  },

  // Ensure we have a coverImage property from any of the standard sources
  coverImage: (data) => data.coverImage || data["header-image"] || data.heroImage || null,
};
