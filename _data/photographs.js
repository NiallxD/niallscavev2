import exifr from 'exifr';
import Image from '@11ty/eleventy-img';
import { readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';

export default async function() {
  const sourceDir = join(process.cwd(), 'photographs_source');
  const outputDir = join(process.cwd(), '_site', 'img', 'photographs');
  const photos = [];

  if (!existsSync(sourceDir)) {
    console.log("Source directory photographs_source does not exist.");
    return [];
  }

  const files = readdirSync(sourceDir).filter(f => 
    ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase())
  ).sort(); // Sort alphabetically to keep numbering consistent

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const num = (i + 1).toString().padStart(4, '0');
    const filePath = join(sourceDir, file);
    try {
      // 1. Get GPS Data from the source file
      const gps = await exifr.gps(filePath);
      if (!gps || !gps.latitude || !gps.longitude) {
        console.log(`Skipping ${file}: No GPS data found.`);
        continue;
      }

      // 2. Process Image (Compress and Resize)
      // We generate two sizes: 
      // - 'small' for map thumbnails (300px)
      // - 'large' for the explorer view (1600px)
      let stats = await Image(filePath, {
        widths: [300, 1600],
        formats: ["webp"],
        urlPath: "/img/photographs/",
        outputDir: "./_site/img/photographs/",
        filenameFormat: function (id, src, width, format, options) {
          return `nb-photo-${num}-${width}w.${format}`;
        }
      });

      photos.push({
        name: file,
        lat: gps.latitude,
        lng: gps.longitude,
        // Map data
        thumb: stats.webp.find(s => s.width === 300).url,
        // Full view data
        full: stats.webp.find(s => s.width === 1600).url
      });

      console.log(`Processed ${file}: [${gps.latitude}, ${gps.longitude}]`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  return photos;
}
