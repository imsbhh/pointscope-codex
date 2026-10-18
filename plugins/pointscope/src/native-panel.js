(() => {
  "use strict";
  const html=`<div data-pane="vision" hidden>
    <section class="section"><div class="section-title">选区与想法 <span class="count" id="vision-live-state">LIVE / 本地</span></div>
      <figure class="vision-figure" id="vision-figure"><img id="vision-preview" alt="选区与笔迹的本地动态预览" hidden><p class="vision-placeholder" id="vision-placeholder" role="status">选择区域后，自动生成预览。</p><figcaption id="vision-image-info"></figcaption></figure>
      <div class="preview-tools"><label class="check"><input id="vision-live" type="checkbox" checked>随页面变化更新预览</label><button class="btn mini" id="vision-refresh">刷新预览</button></div>
      <label class="field" style="margin-top:14px">你希望这里如何改变？<textarea id="intent" placeholder="例如：把按钮移到箭头终点，使用连入的图标；圈线是允许修改的边界。"></textarea></label>
      <div class="actions"><button class="btn" id="vision-workflow">节点与文件 ↗</button><button class="btn primary" id="native-send">交给 Codex</button></div>
      <p class="hint" id="native-flow-info">选区、笔迹、样式和输入响应一起打包。文件可拖入节点窗口，连线填写位置与用途。</p>
      <p class="hint" id="vision-status" role="status" aria-live="polite">图像只在此页本地准备；Codex 在当前对话中理解并实现。</p>
      <details class="source-options"><summary>替换预览图像</summary><label class="field">导入当前视口截图<input id="vision-file" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="hint">复杂媒体无法准确本地渲染时，可导入同尺寸视口截图。导入后暂停自动更新。</p><button class="btn" id="vision-clear" style="margin-top:10px">清空预览</button></details>
    </section>
    <details class="section source-options" id="advanced-export"><summary>高级导出 · JSON / CSS / 响应代码</summary><div class="export-options" style="margin-top:12px"><button class="btn mini" data-format="prompt" aria-pressed="true">AI 指令</button><button class="btn mini" data-format="json" aria-pressed="false">JSON</button><button class="btn mini" data-format="css" aria-pressed="false">CSS</button><button class="btn mini" data-format="js" aria-pressed="false">JS 响应</button><span class="sr-only" id="output-kind">PROMPT</span></div><textarea id="output" class="output" readonly spellcheck="false" aria-label="导出内容"></textarea><div class="actions"><button class="btn" id="copy">复制内容</button><button class="btn" id="download">下载文件 ↓</button></div></details>
  </div>`;
  const css=`
  .panel.vision-view .intro,.panel.vision-view .selection-basis,.panel.vision-view .pickers,.panel.vision-view #lasso,.panel.intent-view #lasso{display:none}.panel.vision-view .target{margin-top:16px}
  .work-controls .work-basis.lasso-switch{min-width:28px;width:28px;padding:3px;font-size:19px}.lasso-switch[aria-pressed=true]{background:var(--accent);color:var(--ink)}
  #lasso-visual.lasso-selecting{pointer-events:auto!important;touch-action:none;cursor:crosshair}#lasso-visual.lasso-selecting>rect{pointer-events:all!important}#lasso-visual path{pointer-events:none!important}
  .vision-figure{margin:0 0 10px;border:1px solid var(--line);border-radius:7px;overflow:hidden;background:#eef2f1}.vision-figure img{display:block;width:100%;max-height:220px;object-fit:contain}.vision-figure figcaption{padding:8px 10px;font-size:11px;line-height:1.7;background:var(--surface);color:var(--muted)}.vision-placeholder{min-height:100px;display:grid;place-items:center;padding:18px;margin:0;font-size:12px;line-height:1.8;color:#31525b;text-align:center}.preview-tools{display:flex;gap:8px;justify-content:space-between;align-items:center}.preview-tools .check{font-size:11px}.source-options{font-size:11px;color:var(--muted);margin-top:13px}.source-options summary{cursor:pointer}#intent{min-height:110px}#vision-live-state{font-size:10px}.panel .tabs{gap:17px}@media(max-width:440px){.panel .tabs{gap:14px}.panel .tab{font-size:11px}}
  `;
  function mount(env){
    const $=s=>env.shadow.querySelector(s);let prepared=null,disposed=false,working=false,epoch=0,failedFingerprint=null;
    const native=PointScopeNative.mount(env),matched=()=>prepared&&prepared.fingerprint===env.fingerprint();
    function message(s,error=false){$("#vision-status").textContent=s;$("#vision-status").classList.toggle("warn",error);}
    function render(){if(disposed)return;const saved=env.savedChanges?.()||0,current=!!matched();$("#native-send").textContent=saved?`交接 ${saved} 项修改`:"交给 Codex";$("#native-flow-info").textContent=saved?"交接使用已保存的修改节点。主面板的新改动，请在节点窗口更新对应节点，或打包为新修改。":"选区、笔迹、样式和输入响应一起打包。文件可拖入节点窗口，连线填写位置与用途。";$("#vision-preview").hidden=!current;$("#vision-placeholder").hidden=current;$("#native-send").disabled=!env.valid()||working;$("#vision-workflow").disabled=!env.valid();$("#vision-file").disabled=!env.valid();$("#vision-refresh").disabled=!env.valid()||working;if(prepared&&!current){$("#vision-image-info").textContent="选区已变化";$("#vision-placeholder").textContent="正在准备当前选区预览…";}if(env.valid()&&env.active()&&$("#vision-live").checked&&!working&&!current&&failedFingerprint!==env.fingerprint())queueMicrotask(()=>refresh());}
    async function refresh(force=false,source=null){
      if(disposed||working||!env.valid()||(!force&&(!env.active()||!$("#vision-live").checked)))return false;
      const fingerprint=env.fingerprint();if(!force&&failedFingerprint===fingerprint)return false;
      working=true;const token=epoch,geometry=structuredClone(env.geometry()),viewport=env.viewport(),actions=structuredClone(env.config().inputEvidence?.actions||[]);$("#vision-live-state").textContent="LIVE / 更新中";
      try{const image=source?await PointScopeVision.prepare(source,geometry,viewport,actions):await PointScopeLive.render(geometry,viewport,actions);if(disposed||token!==epoch||fingerprint!==env.fingerprint())return false;failedFingerprint=null;prepared={...image,geometry,actions,context:structuredClone(env.context()),fingerprint,preparedAt:new Date().toISOString()};$("#vision-preview").src=image.image;$("#vision-image-info").textContent=`${image.descriptor.width} × ${image.descriptor.height} · ${actions.length} 个动作 · 区域外及表单已遮盖${image.descriptor.clipped?" · 仅显示可见部分":""}${image.descriptor.fallback?" · 简化布局预览":""}`;$("#vision-live-state").textContent=source?"截图 / 已固定":image.descriptor.fallback?"本地 / 简化":"LIVE / 本地";message(image.descriptor.fallback?"已生成简化布局预览；复杂样式或媒体请用视口截图校对。":"预览已就绪。可连接文件，或直接交给当前 Codex 对话。");return true;
      }catch(e){if(!disposed&&token===epoch&&fingerprint===env.fingerprint()){failedFingerprint=fingerprint;prepared=null;$("#vision-preview").removeAttribute("src");$("#vision-placeholder").textContent=`预览未生成：${e.message} 可点击“刷新预览”重试，或导入视口截图。`;$("#vision-image-info").textContent="尚未生成图像";message(e.message,true);$("#vision-live-state").textContent="预览 / 暂不可用";}return false;}finally{working=false;render();}
    }
    const timer=setInterval(()=>refresh(),1200);
    env.on($("#vision-refresh"),"click",()=>{epoch++;failedFingerprint=null;refresh(true);});
    env.on($("#vision-live"),"change",()=>{epoch++;if($("#vision-live").checked)refresh(true);else $("#vision-live-state").textContent="预览 / 已暂停";});
    env.on($("#vision-file"),"change",async event=>{if(!event.isTrusted)return;const file=event.target.files[0];event.target.value="";if(!file)return;if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>12000000){message("请使用不超过 12MB 的视口截图。",true);return;}$("#vision-live").checked=false;epoch++;const reader=new FileReader();reader.onload=()=>refresh(true,reader.result);reader.onerror=()=>message("截图读取失败。",true);reader.readAsDataURL(file);});
    env.on($("#vision-clear"),"click",()=>{epoch++;prepared=null;failedFingerprint=null;$("#vision-preview").removeAttribute("src");$("#vision-placeholder").textContent="预览已清空。点击刷新预览，或导入视口截图。";$("#vision-image-info").textContent="自动更新已暂停";$("#vision-live").checked=false;render();message("预览已清空，自动更新已暂停。");});
    env.on($("#vision-workflow"),"click",()=>env.workflow());
    env.on($("#native-send"),"click",async event=>{if(!event.isTrusted)return;try{await env.send();message("交接预览已准备，请核对后加入 Codex 批注。");}catch(e){message(e.message,true);}});
    async function packet(){if(!env.valid())throw Error("请先选择修改范围。");while(working&&!disposed)await new Promise(r=>setTimeout(r,30));if(disposed)throw Error("编辑器已关闭。");if($("#vision-live").checked&&!await refresh(true))throw Error("请先核对当前预览。");if(!matched())throw Error("当前选区没有可用预览，请更新图像。");const config=structuredClone(env.config());delete config.workflow;return{createdAt:new Date().toISOString(),config,geometry:structuredClone(prepared.geometry),context:structuredClone(prepared.context),preview:{image:prepared.image,descriptor:structuredClone(prepared.descriptor),preparedAt:prepared.preparedAt},goal:$("#intent").value};}
    render();return {render,evidence:()=>null,packet,share:graph=>native.prepare(graph),destroy(){disposed=true;epoch++;clearInterval(timer);prepared=null;native.destroy();}};
  }
  globalThis.PointScopeVisionPanel={html,css,mount};
})();
