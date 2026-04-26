export default {
  layout: (data) => {
    if (!data.page?.inputPath?.endsWith(".md")) return data.layout;
    if (data["dg-home"] === true) return "home.njk";
    if (data.Type === "Gallery") return "gallery.njk";
    return data.layout || "post.njk";
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
};
