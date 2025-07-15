const fs = require('fs');
const path = './src/lib/version.ts';

let content = fs.readFileSync(path, 'utf8');
const versionRegex = /export const APP_VERSION = '([0-9]+)\.([0-9]+)';/;
const match = content.match(versionRegex);

if (match) {
  let major = parseInt(match[1], 10);
  let minor = parseInt(match[2], 10) + 1;
  
  // Allow 3-digit minor versions (1.100, 1.101, etc.) until ready for 2.0
  if (major === 1 && minor > 999) { 
    major = 2; 
    minor = 0; 
  }
  
  const newVersion = `${major}.${minor}`;
  content = content.replace(versionRegex, `export const APP_VERSION = '${newVersion}';`);
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Version bumped to ${newVersion}`);
} else {
  console.error('Version not found!');
  process.exit(1);
} 