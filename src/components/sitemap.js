const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream } = require("fs");
const path = require("path");

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: "https://suicityp2e.com" });

  const urls = [
    { url: "/", changefreq: "weekly", priority: 1.0 },
    { url: "/faq", changefreq: "monthly", priority: 0.8 },
    { url: "/contact", changefreq: "monthly", priority: 0.6 },
    // Add more routes as needed
  ];

  // Pipe the sitemap to a file
  const writeStream = createWriteStream(
    path.join(__dirname, "public/sitemap.xml")
  );
  sitemap.pipe(writeStream);

  urls.forEach((url) => sitemap.write(url));
  sitemap.end();

  await streamToPromise(sitemap);
  console.log("Sitemap generated successfully!");
}

generateSitemap().catch(console.error);
