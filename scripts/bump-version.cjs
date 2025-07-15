const fs = require('fs');
const path = './src/lib/version.ts';

let content = fs.readFileSync(path, 'utf8');
const versionRegex = /export const APP_VERSION = '([0-9]+)\.([0-9]{2})';/;
const match = content.match(versionRegex);

if (match) {
  let major = parseInt(match[1], 10);
  let minor = parseInt(match[2], 10) + 1;
  if (minor > 99) { major++; minor = 0; }
  const newVersion = `${major}.${minor.toString().padStart(2, '0')}`;
  content = content.replace(versionRegex, `export const APP_VERSION = '${newVersion}';`);
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Version bumped to ${newVersion}`);
} else {
  console.error('Version not found!');
  process.exit(1);
} 