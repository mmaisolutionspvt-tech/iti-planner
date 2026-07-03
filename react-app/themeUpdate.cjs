const fs = require('fs');
const path = require('path');

const replacements = {
  '#154a4a': '#121619',
  '#0d2f2f': '#1e2429', // hover state for teal
  '#fc0050': '#FFAA00',
  '#ff4d80': '#FFBC1A', // hover/gradient state for pink
  // also handle rgba or variants if any, but let's stick to hex strings first.
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [oldVal, newVal] of Object.entries(replacements)) {
    // Global case-insensitive replacement
    const regex = new RegExp(oldVal, 'gi');
    content = content.replace(regex, newVal);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated theme colors in ${file}`);
  }
});

console.log(`\nComplete! Updated ${changedCount} files.`);
