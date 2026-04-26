export default {
  layout: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return data.layout;
    if (data.Type === "Gallery") return "gallery.njk";
    if (["Blog Post", "Photo Story", "Photo Analysis"].includes(data.Type)) return "post.njk";
    return data.layout || "standard.njk";
  },

  permalink: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return undefined;
    if (data["dg-publish"] !== true) return false;
    if (data["dg-permalink"]) {
      const p = data["dg-permalink"].replace(/\/$/, "");
      return p + "/index.html";
    }
    return undefined;
  },

  eleventyExcludeFromCollections: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return false;
    return data["dg-publish"] !== true;
  },

  // Expose header-image under a hyphen-safe name for Nunjucks templates
  coverImage: (data) => data["header-image"] || null,
};
