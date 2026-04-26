export default {
  // Assign layouts and control publishing for markdown files
  layout: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return undefined;
    if (data["dg-home"] === true) return "home.njk";
    return data.layout || "post.njk";
  },

  // Map dg-permalink → Eleventy permalink; exclude unpublished md files
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
};
