export default class Sitemap {
  data() {
    return {
      permalink: "/sitemap.xml",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ collections }) {
    const pages = (collections.all || []).filter(
      (p) => p.url && String(p.data.publish).trim().toLowerCase() === "true"
    );

    const urls = pages.map((p) => {
      const lastmod = p.date instanceof Date
        ? p.date.toISOString().split("T")[0]
        : "";
      return [
        "  <url>",
        `    <loc>https://niallbell.com${p.url}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
        "  </url>",
      ].filter(Boolean).join("\n");
    });

    return [
      `<?xml version="1.0" encoding="utf-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls,
      `</urlset>`,
    ].join("\n");
  }
}
