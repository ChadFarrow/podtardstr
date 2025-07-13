// Icon generation script for Podtardstr PWA
// Creates SVG-based icons that can be converted to PNG

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an SVG icon for Podtardstr
function createPodtardstrIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#1a1a1a"/>
  
  <!-- Lightning bolt (V4V symbol) -->
  <path d="M${size*0.35} ${size*0.25} L${size*0.55} ${size*0.25} L${size*0.45} ${size*0.45} L${size*0.65} ${size*0.45} L${size*0.35} ${size*0.75} L${size*0.45} ${size*0.55} L${size*0.25} ${size*0.55} Z" 
        fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>
  
  <!-- Music note -->
  <circle cx="${size*0.7}" cy="${size*0.7}" r="${size*0.08}" fill="#ffffff"/>
  <rect x="${size*0.68}" y="${size*0.5}" width="${size*0.04}" height="${size*0.2}" fill="#ffffff"/>
  <path d="M${size*0.7} ${size*0.5} Q${size*0.8} ${size*0.45} ${size*0.8} ${size*0.55}" 
        stroke="#ffffff" stroke-width="${size*0.02}" fill="none"/>
  
  <!-- Podcast wave lines -->
  <circle cx="${size*0.3}" cy="${size*0.7}" r="${size*0.04}" fill="#ffffff"/>
  <circle cx="${size*0.3}" cy="${size*0.7}" r="${size*0.08}" fill="none" stroke="#ffffff" stroke-width="${size*0.01}" opacity="0.6"/>
  <circle cx="${size*0.3}" cy="${size*0.7}" r="${size*0.12}" fill="none" stroke="#ffffff" stroke-width="${size*0.01}" opacity="0.3"/>
</svg>`;
}

// Generate icons in different sizes
const iconSizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

console.log('Generating PWA icons for Podtardstr...');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG versions
iconSizes.forEach(({ size, name }) => {
  const svgContent = createPodtardstrIcon(size);
  const svgName = name.replace('.png', '.svg');
  const svgPath = path.join(publicDir, svgName);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Generated ${svgName}`);
});

console.log(`
📱 PWA Icons Generated!

To convert SVG to PNG (optional, for better compatibility):
1. Use an online SVG to PNG converter, or
2. Use ImageMagick: convert icon-192.svg icon-192.png
3. Use Node.js sharp library for batch conversion

The SVG icons will work in most modern browsers as PWA icons.
`);

// Also generate a simple HTML preview
const previewHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Podtardstr Icons Preview</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .icon-item { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .icon-item img { max-width: 100%; height: auto; }
    .dark { background: #1a1a1a; }
  </style>
</head>
<body>
  <h1>🎵 Podtardstr PWA Icons</h1>
  <div class="icon-grid">
    ${iconSizes.map(({ size, name }) => `
      <div class="icon-item">
        <h3>${size}x${size}</h3>
        <img src="${name.replace('.png', '.svg')}" alt="${name}" width="${Math.min(size, 128)}">
        <p><code>${name.replace('.png', '.svg')}</code></p>
      </div>
    `).join('')}
  </div>
  
  <h2>Dark Background Test</h2>
  <div class="icon-grid">
    ${iconSizes.slice(0, 2).map(({ size, name }) => `
      <div class="icon-item dark">
        <h3 style="color: white;">${size}x${size}</h3>
        <img src="${name.replace('.png', '.svg')}" alt="${name}" width="${Math.min(size, 128)}">
        <p style="color: #ccc;"><code>${name.replace('.png', '.svg')}</code></p>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'icons-preview.html'), previewHtml);
console.log('✅ Generated icons-preview.html for testing');