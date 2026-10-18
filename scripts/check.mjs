import {readFile,access,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import {root,plugin,bundleSource} from './build.mjs';

const readJSON=async path=>JSON.parse(await readFile(path,'utf8'));
const manifest=await readJSON(resolve(plugin,'plugin.json'));
const compatibility=await readJSON(resolve(plugin,'.codex-plugin/plugin.json'));
assert.equal(manifest.name,'pointscope');
assert.equal(manifest.version,compatibility.version);
for(const asset of [manifest.extensions['com.openai'].onboardingSkill,manifest.extensions['com.openai'].interface.logo]){
  assert.ok(asset.startsWith('./')&&!asset.split('/').includes('..'));
  await access(resolve(plugin,asset));
}
const catalog=await readJSON(resolve(root,'.agents/plugins/marketplace.json'));
assert.equal(resolve(root,catalog.plugins[0].source.path),plugin);
const source=await readFile(resolve(plugin,'assets/pointscope.js'),'utf8');
assert.equal(source.replace(/\r\n/g,'\n'),await bundleSource(),'Committed browser bundle must match its sources');
new Script(source,{filename:'pointscope.js'});
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|api\.deepseek|vision-gateway/.test(source));
const archiveName=`PointScope-Codex-v${manifest.version}.zip`;
const archive=await readFile(resolve(root,'dist',archiveName));
const expected=(await readFile(resolve(root,'dist',archiveName.replace(/\.zip$/,'.sha256')),'utf8')).split(/\s/)[0];
assert.equal(createHash('sha256').update(archive).digest('hex'),expected);
async function inspect(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.name==='.git')continue;
  const path=resolve(dir,entry.name);
  if(entry.isDirectory()){await inspect(path);continue;}
  assert.ok(!/^\.env(?:\.|$)|\.(?:pem|key)$/i.test(entry.name),`Unexpected private file: ${relative(root,path)}`);
  if(/\.(?:js|mjs|json|md|yaml|ps1)$/.test(path)){
    const text=await readFile(path,'utf8');
    assert.ok(!/\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text),`Unexpected credential: ${relative(root,path)}`);
    assert.ok(!/C:[/\\]Users[/\\]ASUS/i.test(text),`Unexpected local user path: ${relative(root,path)}`);
  }
}}
await inspect(root);
console.log(`PointScope ${manifest.version}: sources, bundle syntax, manifest paths, marketplace and archive checksum verified.`);
