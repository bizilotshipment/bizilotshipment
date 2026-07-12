import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./lib', (filePath) => {
  if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !filePath.endsWith('db.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace `db.model.method(` with `await db.model.method(`
    // Make sure we don't add `await` if it's already there
    content = content.replace(/(?<!await\s+)(db\.[a-zA-Z]+\.[a-zA-Z]+)\(/g, 'await $1(');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Patched ${filePath}`);
    }
  }
});
