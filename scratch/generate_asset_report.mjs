import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.resolve('assets_incoming/workstation');
const glbFiles = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.glb'));

const reportLines = [];
reportLines.push('# Workstation & Apartment 3D Asset Inspection Report (Stage B1)\n');
reportLines.push(`*Generated: ${new Date().toISOString()}*\n`);
reportLines.push('## 1. Summary of Assets Evaluated\n');
reportLines.push(
  '| Asset File | File Size | Triangles | Vertices | Materials | Textures | Usability Status |'
);
reportLines.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

const detailedSections = [];

for (const file of glbFiles) {
  const filePath = path.join(TARGET_DIR, file);
  const sizeMb = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
  console.log(`Inspecting ${file}...`);

  let inspectOut = '';
  try {
    inspectOut = execSync(`npx --yes @gltf-transform/cli inspect "${filePath}"`, {
      encoding: 'utf-8',
    });
  } catch (err) {
    console.error(`Error inspecting ${file}:`, err.message);
    continue;
  }

  // Parse gltf-transform inspect output
  let totalTris = 0;
  let totalVerts = 0;
  const meshLines = inspectOut.split('MESHES')[1]?.split('MATERIALS')[0] || '';
  for (const mLine of meshLines.split('\n')) {
    const parts = mLine.split('│').map(s => s.trim());
    if (parts.length >= 7 && !isNaN(parseInt(parts[1]))) {
      const tris = parseInt(parts[4]?.replace(/,/g, '') || '0');
      const verts = parseInt(parts[5]?.replace(/,/g, '') || '0');
      if (!isNaN(tris)) totalTris += tris;
      if (!isNaN(verts)) totalVerts += verts;
    }
  }

  const matSection = inspectOut.split('MATERIALS')[1]?.split('TEXTURES')[0] || '';
  const matCount = (matSection.match(/│\s*\d+\s*│/g) || []).length;

  const texSection = inspectOut.split('TEXTURES')[1]?.split('ANIMATIONS')[0] || '';
  const texCount = (texSection.match(/│\s*\d+\s*│/g) || []).length;

  const status = totalTris < 80000 ? '✅ Ready / Usable' : '⚠️ Heavy (Needs Simplification)';

  reportLines.push(
    `| \`${file}\` | ${sizeMb} MB | ${totalTris.toLocaleString()} | ${totalVerts.toLocaleString()} | ${matCount} | ${texCount} | ${status} |`
  );

  detailedSections.push(`### \`${file}\`
- **File Size:** ${sizeMb} MB
- **Geometry:** ${totalTris.toLocaleString()} triangles, ${totalVerts.toLocaleString()} vertices
- **Materials Count:** ${matCount}
- **Textures Count:** ${texCount}
\`\`\`text
${inspectOut.trim().slice(0, 1500)}
\`\`\`
`);
}

reportLines.push('\n---\n');
reportLines.push('## 2. Detailed Technical Inspection\n');
reportLines.push(detailedSections.join('\n'));

fs.writeFileSync('docs/graphics/workstation_asset_report.md', reportLines.join('\n'));
console.log('Successfully wrote docs/graphics/workstation_asset_report.md');
