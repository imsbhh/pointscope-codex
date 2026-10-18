import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export const root=fileURLToPath(new URL('../',import.meta.url));
export const plugin=resolve(root,'plugins/pointscope');
export const modules=['core.js','input-intent.js','preview-image.js','live-preview.js','workflow.js','native-bridge.js','native-panel.js','shortcuts.js','content.js'];
export async function bundleSource(){
  const {version}=JSON.parse(await readFile(resolve(plugin,'plugin.json'),'utf8'));
  const parts=await Promise.all(modules.map(async name=>(await readFile(resolve(plugin,'src',name),'utf8')).replace(/\r\n/g,'\n')));
  return `/* PointScope Codex ${version} · client-only · no external runtime / server / model key */\n`+parts.join('\n;\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const source=await bundleSource();
  await writeFile(resolve(plugin,'assets/pointscope.js'),source,'utf8');
  console.log(`Built ${modules.length} modules (${Buffer.byteLength(source)} bytes).`);
}
