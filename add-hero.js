const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      files = files.concat(walkDir(filepath));
    } else if (file.endsWith('.md')) {
      files.push(filepath);
    }
  }
  return files;
}

const targetDirs = ["2.0 - Blog Posts", "3.0 - 📷 Photography", "95 - Bookshelf"];
let files = [];
targetDirs.forEach(d => {
  if (fs.existsSync(d)) files = files.concat(walkDir(d));
});

let updatedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('---')) return;
  
  const endFrontmatter = content.indexOf('---', 3);
  if (endFrontmatter === -1) return;
  
  const frontmatter = content.slice(0, endFrontmatter);
  
  if (frontmatter.includes('dg-publish: true') && frontmatter.includes('header-image:')) {
    if (!frontmatter.includes('heroImage:')) {
      const match = frontmatter.match(/header-image:\s*(.+)/);
      if (match && match[1]) {
        const heroLine = `\nheroImage: ${match[1].trim()}`;
        content = content.slice(0, endFrontmatter) + heroLine + content.slice(endFrontmatter);
        fs.writeFileSync(file, content);
        updatedCount++;
        console.log(`Updated: ${file}`);
      }
    }
  }
});

console.log(`\nSuccessfully added heroImage to ${updatedCount} files.`);
