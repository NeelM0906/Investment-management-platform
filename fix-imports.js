const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'server', 'routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace dist imports with direct source imports
    content = content.replace(/require\('\.\.\/\.\.\/dist\/src\//g, "require('../../src/");
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${file}`);
  }
});

console.log('All route files updated!');