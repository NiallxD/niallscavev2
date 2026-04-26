export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("robots.txt");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toISOString().split("T")[0];
  });

  // All published notes
  eleventyConfig.addCollection("published", (api) =>
    api
      .getAll()
      .filter((item) => item.data["dg-publish"] === true)
      .sort((a, b) => b.date - a.date)
  );

  // Blog posts (Type: Blog Post or Photo Story)
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getAll()
      .filter(
        (item) =>
          item.data["dg-publish"] === true &&
          ["Blog Post", "Photo Story", "Photo Analysis"].includes(
            item.data.Type
          )
      )
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
