export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("robots.txt");

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
      .filter((i) =>
        i.data["dg-publish"] === true &&
        ["Blog Post", "Photo Story", "Photo Analysis"].includes(i.data.Type)
      )
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("galleries", (api) =>
    api.getAll()
      .filter((i) => i.data["dg-publish"] === true && i.data.Type === "Gallery")
      .sort((a, b) => (a.data.title || "").localeCompare(b.data.title || ""))
  );

  eleventyConfig.addCollection("photoStories", (api) =>
    api.getAll()
      .filter((i) => i.data["dg-publish"] === true && i.data.Type === "Photo Story")
      .sort((a, b) => b.date - a.date)
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
