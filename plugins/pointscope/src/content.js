(() => {
  "use strict";
  if (globalThis.__pointscope) { globalThis.__pointscope.toggle(); return; }
  const C = globalThis.PointScopeCore;
  const I = globalThis.PointScopeInput;
  const VP = globalThis.PointScopeVisionPanel;
  const WF = globalThis.PointScopeWorkflow;
  const SP = globalThis.PointScopeShortcuts;
  if (!C || !document.body) return;
  const HOST_ID = "pointscope-inspector-root";
  // A page-owned collision must not be removed or reused.
  const host = document.createElement("div");
  host.id = document.getElementById(HOST_ID) ? `${HOST_ID}-${Date.now()}` : HOST_ID;
  host.setAttribute("data-pointscope-owned", "");
  host.style.cssText = "all:initial!important;position:fixed!important;inset:0 auto auto 0!important;width:0!important;height:0!important;z-index:2147483647!important;pointer-events:none!important;color-scheme:dark!important;";
  const shadow = host.attachShadow({mode: "open"});
  shadow.innerHTML = `
  <style>
    ${VP?.css || ""}
    ${WF?.css || ""}
    ${SP?.css || ""}
    :host{--ink:#102c35;--surface:#183b44;--raised:#20464f;--line:#31525b;--text:#e4eff0;--muted:#a4bec3;--accent:#a7ecd3;font-family:"Segoe UI","Microsoft YaHei",sans-serif;font-size:13px;color:var(--text);line-height:1.5}
    *{box-sizing:border-box} button,input,select,textarea{font:inherit;color:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}button,input,select,textarea{outline:none}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}[hidden]{display:none!important}
    .panel{position:fixed;right:22px;top:22px;width:364px;max-width:calc(100vw - 16px);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;pointer-events:auto;background:var(--ink);border:1px solid #42616a;border-radius:15px;box-shadow:0 20px 70px #0a22264d;overflow:hidden;text-align:left;color:var(--text);font-family:"Segoe UI","Microsoft YaHei",sans-serif}
    .head{padding:14px 16px;display:flex;gap:10px;align-items:center;touch-action:none;cursor:move;border-bottom:1px solid var(--line);user-select:none}.mark{width:30px;height:30px;display:grid;place-items:center;color:var(--ink);background:var(--accent);border-radius:8px;flex-shrink:0}.mark svg{width:22px;height:22px}.brand{font-size:16px;font-weight:650;letter-spacing:-.3px}.brand small{display:block;font-size:10px;color:var(--muted);letter-spacing:1.4px;font-weight:500}.head-actions{margin-left:auto;display:flex;gap:3px}.icon{border:0;background:transparent;border-radius:5px;color:var(--muted);min-width:30px;height:32px;display:grid;place-items:center;font-size:19px}.icon:hover{background:var(--raised);color:var(--text)}
    .body{overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#52737b transparent}.intro{padding:17px 17px 0}.intro h1{font-size:20px;line-height:1.4;letter-spacing:-.5px;margin:0 0 4px;font-weight:600}.intro p{margin:0;color:var(--muted);font-size:12px}.pickers{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 17px}.btn{display:flex;justify-content:center;align-items:center;gap:7px;min-height:37px;padding:8px 12px;border-radius:7px;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:12px;line-height:1.5;font-weight:550}.btn:hover{border-color:#71968f;background:var(--raised)}.btn svg{width:16px;height:16px}.btn.active{color:var(--accent);border-color:var(--accent)}.btn.primary{background:var(--accent);color:var(--ink);border-color:var(--accent)}.btn.primary:hover{background:#c3f5e2}.target{margin:0 17px 14px;border:1px solid var(--line);background:#0c252d;border-radius:8px;padding:11px 12px;min-height:68px}.target-top{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--muted)}.dot{width:6px;height:6px;border-radius:50%;background:var(--muted);flex-shrink:0}.dot.ready{background:var(--accent)}.target code{display:block;font:12px/1.6 "Cascadia Code",Consolas,monospace;overflow-wrap:anywhere;margin-top:5px;color:var(--accent)}.target-meta{font-size:10px;color:var(--muted);margin-top:4px;line-height:1.5}
    .tabs{display:flex;padding:0 17px;border-bottom:1px solid var(--line);gap:17px}.tab{padding:9px 0 11px;border:0;border-bottom:2px solid transparent;background:none;font-size:12px;color:var(--muted);white-space:nowrap}.tab[aria-selected=true]{color:var(--accent);border-color:var(--accent)}.section{padding:17px}.section+.section{border-top:1px solid var(--line)}.section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:12px;font-weight:600}.step{color:var(--muted);font:10px Consolas,monospace;margin-right:7px}.count{color:var(--accent);font:11px Consolas,monospace}.scopes{display:grid;grid-template-columns:1fr 1fr;gap:6px}.scope{justify-content:flex-start;font-size:11px;padding:7px 10px;min-height:34px;font-weight:400}.scope[aria-pressed=true]{background:#254d4d;border-color:#70b69f;color:var(--accent)}.hint{font-size:11px;line-height:1.6;color:var(--muted);margin:9px 0 0}.warn{color:#ffd2b0}.field{display:flex;flex-direction:column;gap:5px;font-size:11px;color:var(--muted)}.field input,.field select,.field textarea,.text-field{width:100%;min-width:0;border:1px solid var(--line);border-radius:6px;background:#0c252d;min-height:35px;padding:7px 9px;color:var(--text);font-size:12px;resize:vertical}.field textarea{min-height:94px;line-height:1.6}.field input::placeholder,.field textarea::placeholder{color:#8cabb3}.field select{cursor:pointer}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.row+.row{margin-top:10px}.unit{position:relative}.unit input{padding-right:27px}.unit span{position:absolute;right:9px;top:9px;font:11px Consolas,monospace;color:#8cabb3;pointer-events:none}.color-field input{font:12px Consolas,monospace}.toggle-row{display:flex;align-items:center;gap:10px;cursor:pointer}.toggle-row strong{display:block;font-size:13px;font-weight:550}.toggle-row small{display:block;color:var(--muted);font-size:11px;margin-top:2px}.switch{appearance:none;-webkit-appearance:none;width:34px;height:20px;background:#3c5b64;border-radius:20px;position:relative;flex-shrink:0;margin:0 0 0 auto;cursor:pointer}.switch:before{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;background:#d4e1e3;border-radius:50%;transition:transform .15s}.switch:checked{background:var(--accent)}.switch:checked:before{background:var(--ink);transform:translateX(14px)}.check{display:flex;align-items:flex-start;gap:8px;color:var(--muted);font-size:11px;cursor:pointer;margin-top:12px}.check input{accent-color:var(--accent);margin:2px 0;width:15px;height:15px;flex-shrink:0}.rule-box{padding:12px;background:#0c252d;border:1px solid var(--line);border-radius:7px;margin-top:12px;font-size:12px;color:var(--accent)}.key-row{display:grid;grid-template-columns:1fr 86px;gap:8px;margin-top:10px}.mods{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0}.mods .check{margin:0}.export-options{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}.mini{padding:5px 9px;min-height:29px;font:11px Consolas,monospace}.mini[aria-pressed=true]{background:#254d4d;color:var(--accent);border-color:#70b69f}.output{width:100%;background:#0c252d;border:1px solid var(--line);border-radius:7px;resize:vertical;height:196px;color:#cde4df;padding:10px;font:11px/1.7 "Cascadia Code",Consolas,monospace;white-space:pre;tab-size:2}.actions{display:flex;gap:8px;margin-top:10px}.actions>*{flex:1}.privacy{padding:10px 12px;border:1px solid var(--line);border-radius:7px;margin-top:13px;font-size:11px;color:var(--muted);line-height:1.7}.footer{border-top:1px solid var(--line);padding:12px 17px 13px;background:var(--ink)}.footer-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.status{font-size:11px;color:var(--muted);min-height:17px;margin:9px 0 0;line-height:1.5;overflow-wrap:anywhere}.status.error{color:#ffc5b3}.bottom-line{margin-top:9px;font:10px Consolas,monospace;display:flex;justify-content:space-between;color:#91acb3}.indicator{color:var(--accent)}
    .outline{position:fixed;pointer-events:none;border:2px solid #0a9e80;background:#6ae8be12;border-radius:3px;box-shadow:0 0 0 1px #ecfff880}.outline.hover{border-style:dashed;background:#6ae8be0a}.tag{position:absolute;left:-2px;top:-24px;background:#087f70;color:#fff;padding:2px 6px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:4px 4px 0 0;font:11px/18px Consolas,monospace}.selection-help{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:var(--ink);color:var(--text);border:1px solid #7ccfb1;border-radius:9px;padding:10px 17px;max-width:calc(100vw - 24px);width:max-content;font-size:12px;box-shadow:0 8px 30px #1235;pointer-events:none}.panel.picking .intro,.panel.picking .tabs,.panel.picking .panes,.panel.picking .footer,.panel.picking .target{display:none}.panel.picking .pickers{padding:12px 17px}.panel.minimized>:not(.head){display:none}.panel.minimized{width:245px}.panel.minimized .head{border-bottom:0}.restore{position:fixed;bottom:18px;right:18px;pointer-events:auto;border:1px solid var(--accent);border-radius:8px;box-shadow:0 5px 20px #1234}.select-input{margin-top:10px}.empty{color:var(--muted);font-size:12px;padding:3px 0 0}.event-fields{margin-top:16px;display:flex;flex-direction:column;gap:12px}
    @media(max-width:440px){.panel{top:8px;right:8px;max-height:calc(100dvh - 16px);width:364px}.intro h1{font-size:19px}.section{padding:14px 16px}.tabs{gap:19px}.head{padding:12px 14px}.head-actions{gap:0}.body{max-height:calc(100dvh - 180px)}}
    @media(prefers-reduced-motion:reduce){*,*:before{transition:none!important;animation:none!important}}
    .selection-basis{display:flex;align-items:center;gap:6px;padding:14px 17px 0}.selection-basis>span{margin-right:auto;color:var(--muted);font-size:11px}.basis{min-height:30px;padding:5px 13px;font-size:11px}.basis[aria-pressed=true]{background:#254d4d;border-color:#70b69f;color:var(--accent)}.coordinate-controls .row{margin-top:10px}.coordinate-ref{border-style:dashed}.coordinate-ref.point{border-radius:50%;display:grid;place-items:center;color:#087f70;font:22px/1 Consolas,monospace}.coordinate-ref .tag{font-size:10px}.coordinate-note{padding:13px 17px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;line-height:1.8}
    .panel{max-height:calc(100dvh - 104px)}.work-controls{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;pointer-events:auto;color:var(--text);font-family:"Segoe UI","Microsoft YaHei",sans-serif;font-size:12px;line-height:1.5;user-select:none}.work-pill{height:46px;background:var(--ink);border:1px solid #42616a;box-shadow:0 6px 24px #0a222626;border-radius:999px;display:flex;align-items:center;flex-shrink:0}.edit-control{padding:0 14px;gap:10px;cursor:pointer}.edit-control .switch{margin:0}.edit-control:has(input:checked){border-color:#70b69f}.mode-control{padding:4px;gap:2px}.work-basis{border:0;border-radius:999px;min-height:36px;min-width:59px;padding:7px 14px;color:var(--muted);background:transparent;font-size:12px;font-weight:550}.work-basis[aria-pressed=true]{background:var(--accent);color:var(--ink)}.work-basis:hover{color:var(--text);background:var(--raised)}.work-basis[aria-pressed=true]:hover{color:var(--ink);background:#c3f5e2}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
    @media(max-width:440px){.panel{max-height:calc(100dvh - 84px)}.work-controls{bottom:12px;gap:8px}.work-pill{height:44px}.edit-control{padding:0 12px;gap:8px}.work-basis{min-height:34px;min-width:54px;padding:6px 12px}}
    .head,.footer{flex-shrink:0}.body{min-height:0;flex:1 1 auto}.footer{padding-bottom:20px}.resize-handle{position:absolute;touch-action:none;z-index:3}.resize-handle.n{top:0;left:16px;right:16px;height:7px;cursor:ns-resize}.resize-handle.s{bottom:0;left:16px;right:16px;height:7px;cursor:ns-resize}.resize-handle.e{right:0;top:16px;bottom:16px;width:7px;cursor:ew-resize}.resize-handle.w{left:0;top:16px;bottom:16px;width:7px;cursor:ew-resize}.resize-handle.ne,.resize-handle.nw,.resize-handle.se,.resize-handle.sw{width:17px;height:17px}.resize-handle.ne{right:0;top:0;cursor:nesw-resize}.resize-handle.nw{left:0;top:0;cursor:nwse-resize}.resize-handle.se{right:0;bottom:0;cursor:nwse-resize;width:21px;height:21px;border-radius:0 0 13px 0}.resize-handle.sw{left:0;bottom:0;cursor:nesw-resize}.resize-handle.se:after{content:"";position:absolute;width:9px;height:9px;bottom:5px;right:5px;background:repeating-linear-gradient(135deg,transparent 0 2px,#91acb3 2px 3px,transparent 3px 5px);clip-path:polygon(100% 0,100% 100%,0 100%)}.resize-handle:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}.panel.resizing{user-select:none}
    .tabs{gap:12px}.capture-options{display:flex;flex-direction:column;gap:11px}.capture-observation{margin:10px 0;font-size:12px;line-height:1.7;color:var(--accent)}.capture-timeline{padding-left:23px;margin:10px 0;font:11px/1.8 "Cascadia Code",Consolas,monospace;color:var(--muted);max-height:150px;overflow:auto}.capture-timeline li{padding:3px 0}.capture-proposal{width:100%;min-height:140px}.capture-state{margin-top:10px;font-size:11px;color:var(--accent)}.capture-state.unconfirmed{color:#ffd2b0}.stop-capture{border:0;background:none;color:var(--text);font:12px/1.5 "Segoe UI","Microsoft YaHei",sans-serif;padding:0;min-height:34px;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:8px}.capture-dot{width:7px;height:7px;border-radius:50%;background:#ff9e86;flex-shrink:0}.edit-control.capturing{border-color:#d18c7d}.work-basis:disabled{opacity:.5;cursor:not-allowed}
    #edit-switch-label{min-height:42px}
    .panel.intent-view .intro,.panel.intent-view .selection-basis,.panel.intent-view .pickers{display:none}.panel.intent-view .target{margin-top:16px}
    .input-traces{position:fixed;inset:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none!important}.input-traces *{pointer-events:none!important}.trace-halo{fill:none;stroke:#fff;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;opacity:.9}.trace-line{fill:none;stroke:var(--trace-color);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.trace-point{fill:#fff;stroke:var(--trace-color);stroke-width:2.5}.trace-ring{fill:none;stroke:var(--trace-color);stroke-width:1.5;opacity:.55}.trace-arrow{fill:var(--trace-color);stroke:#fff;stroke-width:1;stroke-linejoin:round}.trace-label{fill:#102c35;stroke:#a7ecd3;stroke-width:1}.trace-text{fill:#e4eff0;font:11px "Segoe UI","Microsoft YaHei",sans-serif;dominant-baseline:middle}.trace-live .trace-line{stroke-dasharray:5 4}
  </style>
  <div id="outlines"></div><div id="hover" class="outline hover" hidden><span class="tag"></span></div>
  <div id="marquee" class="outline" hidden></div><div id="help" class="selection-help" hidden></div>
  <svg class="input-traces" id="input-traces" aria-hidden="true" hidden></svg>
  <svg class="input-traces" id="lasso-visual" aria-hidden="true" hidden><rect width="100%" height="100%" fill="transparent"/><path fill="#6ae8be22" fill-rule="evenodd" stroke="#078875" stroke-width="2" stroke-dasharray="6 4"/></svg>
  <div class="work-controls" id="work-controls" role="toolbar" aria-label="PointScope 工作开关">
    <div class="work-pill edit-control" id="edit-control"><label class="toggle-row" title="开启后点击点选、拖动框选；Esc 退出编辑" id="edit-switch-label"><span>编辑模式</span><input class="switch" id="edit-mode" type="checkbox" role="switch" aria-label="编辑模式"></label><button class="stop-capture" id="stop-capture" hidden aria-label="停止交互意图采集"><span class="capture-dot"></span><span id="capture-clock">采集中 · 停止</span></button></div>
    <div class="work-pill mode-control" role="group" aria-label="工作区选择依据"><button class="work-basis" data-work-basis="element" aria-pressed="true" title="按网页元素选择">元素</button><button class="work-basis" data-work-basis="coordinate" aria-pressed="false" title="按精确坐标选择">坐标</button><button class="work-basis lasso-switch" id="work-lasso" aria-label="画笔不规则圈选" aria-pressed="false" title="画笔圈选 · 松笔自动闭合">✎</button></div>
    <span class="sr-only" id="work-status" role="status" aria-live="polite">开启编辑模式，点击点选或拖动框选。</span>
  </div>
  ${SP?.html || ""}
  <aside class="panel" aria-label="PointScope 前端选择器" hidden>
    <header class="head" id="drag" title="拖动面板到任意位置">
      <div class="mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9V4h5m8 0h5v5m0 7v5h-5M8 21H3v-5" stroke="currentColor" stroke-width="2"/><path d="m9 8 7 5-4 1-2 4Z" fill="currentColor"/></svg></div>
      <div class="brand">PointScope<small>AI FRONTEND COMPANION</small></div>
      <div class="head-actions"><button class="icon" id="shortcuts-open" title="绑定快捷键 · Alt+Shift+K" aria-label="绑定快捷键">⌨</button><button class="icon" id="dock" title="停靠到右侧" aria-label="面板停靠右侧">⇥</button><button class="icon" id="minimize" title="回到页面并保留预览" aria-label="收起设置并保留预览">−</button><button class="icon" id="close" title="关闭窗口并继续编辑" aria-label="关闭设置并继续编辑">×</button></div>
    </header>
    <div class="body">
      <div class="intro"><h1>指向你想改变的地方。</h1><p>位置、范围、交互，由你定义。</p></div>
      <div class="selection-basis" role="group" aria-label="选择依据"><span>选择依据</span><button class="btn basis" data-basis="element" aria-pressed="true">按元素</button><button class="btn basis" data-basis="coordinate" aria-pressed="false">按坐标</button></div>
      <div class="pickers"><button class="btn" id="pick"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 3 11 7-6 1-2 6Z" stroke="currentColor" stroke-width="1.5"/></svg><span id="pick-label">点选元素</span></button><button class="btn" id="box"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m6 0h4v-4" stroke="currentColor" stroke-width="1.5"/></svg><span id="box-label">框选区域</span></button></div>
      <div class="target"><div class="target-top"><span class="dot" id="target-dot"></span><span id="target-title">等待选择目标</span><button class="icon" id="parent" aria-label="选择父级元素" title="选择父级元素" style="margin-left:auto;font-size:12px;height:22px;min-width:50px" disabled>↑ 父级</button></div><code id="target-selector">在网页上点一下，开始选择</code><div class="target-meta" id="target-meta">Esc 退出选择 · 拖动顶部可移动面板</div></div>
      <button class="btn" id="lasso" style="margin:0 17px 12px" title="松笔后自动闭合，Esc 取消">✎ 画笔圈选不规则区域</button>
      <nav class="tabs" aria-label="配置步骤"><button class="tab" data-tab="scope" aria-selected="true">范围与样式</button><button class="tab" data-tab="input" aria-selected="false">输入响应</button><button class="tab" data-tab="capture" aria-selected="false">演示笔迹</button><button class="tab" data-tab="vision" aria-selected="false">想法与素材</button></nav>
      <div class="panes">
        <div data-pane="scope">
          <section class="section"><div class="section-title"><span><span class="step">01</span><span id="scope-title">影响范围</span></span><span class="count" id="count">0 ELEMENTS</span></div>
            <div class="scopes" id="element-scopes"><button class="btn scope" data-scope="element" aria-pressed="true">仅选中元素</button><button class="btn scope" data-scope="subtree" aria-pressed="false">元素 + 子元素</button><button class="btn scope" data-scope="selector" aria-pressed="false">CSS 选择器</button><button class="btn scope" data-scope="page" aria-pressed="false">整个页面</button></div>
            <label class="field select-input" id="selector-field" hidden>目标选择器<input id="custom-selector" placeholder="例如 .feature-card" spellcheck="false" autocomplete="off"></label>
            <div class="coordinate-controls" id="coordinate-controls" hidden>
              <div class="row"><label class="field">坐标系<select id="coord-space"><option value="document">页面坐标 · 随页面滚动</option><option value="viewport">视口坐标 · 固定于视口</option></select></label><label class="field">选区形状<select id="coord-kind"><option value="point">坐标点 + 影响半径</option><option value="rectangle">坐标矩形</option><option value="polygon">画笔不规则区域</option></select></label></div>
              <div class="row"><label class="field"><span id="coord-x-label">X · 圆心</span><div class="unit"><input id="coord-x" type="number" step="any" min="-10000000" max="10000000" placeholder="点选或输入"><span>px</span></div></label><label class="field"><span id="coord-y-label">Y · 圆心</span><div class="unit"><input id="coord-y" type="number" step="any" min="-10000000" max="10000000" placeholder="点选或输入"><span>px</span></div></label></div>
              <div class="row" id="coord-size" hidden><label class="field">选区宽度<div class="unit"><input id="coord-width" type="number" step="any" min="0.01" max="10000000" value="160"><span>px</span></div></label><label class="field">选区高度<div class="unit"><input id="coord-height" type="number" step="any" min="0.01" max="10000000" value="100"><span>px</span></div></label></div>
              <label class="field" id="coord-radius-field" style="margin-top:10px">点选影响半径<div class="unit"><input id="coord-radius" type="number" step="any" min="0.01" max="10000" value="24"><span>px</span></div></label>
            </div>
            <p class="hint" id="scope-hint">只改变选中的目标，保留其他区域。</p>
          </section>
          <section class="section" id="element-styles"><div class="section-title"><span><span class="step">02</span>位置与外观</span><button class="icon" id="clear-styles" title="清空样式覆盖" aria-label="清空样式覆盖" style="font-size:15px;height:22px">↺</button></div>
            <div class="row"><label class="field">水平偏移<div class="unit"><input type="number" data-style="x" placeholder="不修改" min="-5000" max="5000"><span>px</span></div></label><label class="field">垂直偏移<div class="unit"><input type="number" data-style="y" placeholder="不修改" min="-5000" max="5000"><span>px</span></div></label></div>
            <div class="row"><label class="field">宽度<div class="unit"><input type="number" data-style="width" placeholder="自动" min="0" max="10000"><span>px</span></div></label><label class="field">高度<div class="unit"><input type="number" data-style="height" placeholder="自动" min="0" max="10000"><span>px</span></div></label></div>
            <div class="row"><label class="field">圆角<div class="unit"><input type="number" data-style="radius" placeholder="不修改" min="0" max="1000"><span>px</span></div></label><label class="field">内边距<div class="unit"><input type="number" data-style="padding" placeholder="不修改" min="0" max="1000"><span>px</span></div></label></div>
            <div class="row"><label class="field color-field">背景颜色<input data-style="background" placeholder="#RRGGBB" maxlength="7" spellcheck="false"></label><label class="field color-field">文字颜色<input data-style="color" placeholder="#RRGGBB" maxlength="7" spellcheck="false"></label></div>
            <p class="hint">留空保持原样。偏移以目标原位置为基准。</p>
          </section>
          <div class="coordinate-note" id="coordinate-note" hidden>坐标模式精确标记空间范围。预览显示参考选区，输入响应也作用于参考层；要新增或改变什么内容，请在「交给 AI」填写需求。</div>
        </div>
        <div data-pane="input" hidden>
          <section class="section"><label class="toggle-row"><span><strong>响应外设输入</strong><small id="interaction-target">可选 · 默认保留页面原有行为</small></span><input class="switch" id="interaction-enabled" type="checkbox" aria-label="启用输入响应"></label>
          <div id="interaction-fields" class="event-fields" hidden>
            <label class="field">触发输入<select id="event"><option value="click">鼠标 · 单击</option><option value="dblclick">鼠标 · 双击</option><option value="pointerenter">鼠标 / 触控笔 · 移入</option><option value="pointerdown">鼠标 / 触控笔 · 按下</option><option value="wheel">鼠标 · 滚轮</option><option value="keydown">键盘 · 快捷键</option><option value="touchstart">触屏 · 触摸</option></select></label>
            <div id="keyboard" hidden><div class="field">触发按键<div class="key-row"><input id="key" value="Enter" placeholder="例如 Enter、k、空格" autocomplete="off"><button class="btn" id="record-key">录入按键</button></div></div><div class="mods"><label class="check"><input type="checkbox" data-mod="ctrl">Ctrl</label><label class="check"><input type="checkbox" data-mod="alt">Alt</label><label class="check"><input type="checkbox" data-mod="shift">Shift</label><label class="check"><input type="checkbox" data-mod="meta">Meta</label></div></div>
            <label class="field">目标响应<select id="effect"><option value="highlight">描边强调</option><option value="lift">向上浮起</option><option value="dim">降低透明度</option><option value="hide">隐藏元素</option></select></label>
            <label class="check"><input type="checkbox" id="prevent-default"><span>阻止此输入的浏览器默认行为<br>仅在确有需要时启用</span></label>
            <div class="rule-box" id="rule-summary">鼠标单击 → 描边强调</div><p class="hint" id="event-hint">每次触发切换效果，再次触发恢复。点击预览后生效。</p>
          </div><p class="hint" id="interaction-off">只调整位置和样式也可以。需要交互时再打开。</p></section>
          <section class="section"><div class="section-title">更多行为，用语言描述</div><p class="hint">如“拖动后吸附网格”“滚轮控制缩放”。把这些写进「交给 AI」的需求框，由开发助手在项目中实现。</p></section>
        </div>
        <div data-pane="capture" hidden>
          <section class="section"><div class="section-title">演示操作，说明你想要的结果</div><p class="hint">主动开始后读取当前网页的操作，把点击、拖动、滚轮和控制键整理成候选意图。候选说明可编辑，确认后才作为需求交接。</p>
            <div class="capture-options" style="margin-top:13px"><label class="field">采集范围<select id="capture-scope"><option value="selection">仅当前选区</option><option value="page">当前页面（可跨区域演示）</option></select></label><label class="field">演示方式<select id="capture-mode"><option value="demonstrate">手势演示 · 拦截网页动作</option><option value="observe">真实操作 · 保留网页行为</option></select></label></div>
            <label class="field" style="margin-top:11px">指针用途<select id="capture-pointer-mode"><option value="auto">自动 · 触控笔记为笔迹</option><option value="draw">画笔 · 鼠标 / 触屏也绘制笔迹</option><option value="drag">拖拽 · 触控笔也记为拖动</option></select></label><p class="hint">笔迹随压力改变粗细，侧键和橡皮端分别记录。压力、倾斜由浏览器提供，缺少参数时固定笔宽；橡皮端只记录擦除演示。</p><p class="hint warn" id="capture-touch-hint" hidden>坐标范围的触屏笔迹可能被网页滚动中断；可改用元素范围，或主动将采集范围设为「当前页面」。中断的笔迹会标记为取消。</p>
            <label class="check"><input type="checkbox" id="capture-show-traces" checked>显示操作轨迹</label><p class="hint">点击、拖动、笔迹和滚轮实时显示，编号对应操作列表。结束后可查看最近 20 个动作的轨迹；显示层不会挡住网页操作。</p>
            <div class="actions"><button class="btn primary" id="capture-start">开始采集</button><button class="btn" id="capture-clear" disabled>清空记录</button></div><p class="hint">最多 60 秒 / 100 个动作。开始后窗口收起，点击底部「停止」或按 Esc 结束；切出页面自动停止。采集期间暂停选区编辑。</p>
          </section>
          <section class="section" id="capture-results" hidden><div class="section-title"><span>操作证据</span><span class="count" id="capture-count"></span></div><p class="capture-observation" id="capture-observation"></p><ol class="capture-timeline" id="capture-timeline" aria-label="采集的操作序列"></ol><p class="hint" id="capture-stop-reason"></p>
            <label class="field" style="margin-top:13px">候选意图 · 请校对<textarea class="capture-proposal" id="capture-proposal" placeholder="补充：完成这些操作后，你希望页面具体如何变化？"></textarea></label><p class="hint">本地规则只整理操作线索，无法唯一判断目标。请修改成你希望实现的行为，再确认加入上下文。</p><p class="capture-state unconfirmed" id="capture-confirmation">尚未确认，导出时只作为操作证据。</p>
            <div class="actions"><button class="btn primary" id="capture-confirm">确认并加入 AI 上下文</button><button class="btn" id="capture-export">查看交接</button></div><label class="check"><input type="checkbox" id="capture-include" checked>随当前选区导出操作证据和候选说明</label>
          </section>
          <section class="section"><p class="hint">仅在此网页内主动采集，不读取其他应用、输入框文字、密码、剪贴板或页面正文。只保留导航 / 控制键与 Ctrl / Meta 快捷键；普通文字按键不记录。内容仅存于当前页面内存，不会自动发送。</p></section>
        </div>
        ${VP?.html || ""}

      </div>
    </div>
    <footer class="footer"><div class="footer-actions"><button class="btn primary" id="preview">预览修改</button><button class="btn" id="undo" disabled>撤销预览</button></div><p class="status" id="status" role="status" aria-live="polite">先选择一个目标，然后定义改动。</p><div class="bottom-line"><span id="preview-state">LOCAL / 本地预览</span><span>Codex 1.0.2 · <span class="indicator">●</span> READY</span></div></footer>
    <div class="resize-handle n" data-resize="n" aria-hidden="true"></div><div class="resize-handle e" data-resize="e" aria-hidden="true"></div><div class="resize-handle s" data-resize="s" aria-hidden="true"></div><div class="resize-handle w" data-resize="w" aria-hidden="true"></div><div class="resize-handle ne" data-resize="ne" aria-hidden="true"></div><div class="resize-handle nw" data-resize="nw" aria-hidden="true"></div><div class="resize-handle sw" data-resize="sw" aria-hidden="true"></div><div class="resize-handle se" data-resize="se" role="button" tabindex="0" aria-label="调整设置窗口大小" title="拖动边缘或角落调整大小；方向键微调；双击恢复默认大小"></div>
  </aside>${WF?.html || ""}`;
  document.documentElement.appendChild(host);
  const $ = selector => shadow.querySelector(selector);
  const $$ = selector => [...shadow.querySelectorAll(selector)];
  const panel = $(".panel");
  const baseStyle = document.createElement("style");
  baseStyle.setAttribute("data-pointscope-owned", "");
  document.documentElement.appendChild(baseStyle);
  const token = `data-pointscope-${Math.random().toString(36).slice(2, 10)}`;
  const listeners = [];
  const state = {editing: false, capture: null, captureController: null, captureTicker: null, captureReturnEditing: false, captureShowOnStop: true, panelSize: null, panelPosition: null, basis: "element", coordinate: null, coordinateLayer: null, roots: [], targets: [], snapshots: [], snapshotViewport: null, selectionViewport: null, scope: "element", mode: "point", rectangle: null, picker: null, styles: {}, preview: false, format: "prompt", error: "", stopInteraction: null, marked: [], recording: false};
  state.elementPolygon = null; state.pickShape = "auto";
  let lassoPoints = null, lassoViewport = null, visionUI = null, workflowUI = null, shortcutsUI = null;
  const isLassoEvent = event => event.composedPath().includes($("#lasso-visual"));
  let captureLive = null, captureLiveContext = null, traceFrame = 0;
  let dragStart = null, resizeStart = null, boxStart = null, boxPointer = null, gestureBox = false, swallowClick = false, swallowTimer = null, frame = 0, destroyed = false;
  const ignored = el => !el || !(el instanceof Element) || el === host || el.closest?.("[data-pointscope-owned]") || el.matches("script,style,link,meta,title,head,noscript,iframe");
  const ownEvent = event => event.composedPath().includes(host);
  const viewport = () => ({width: innerWidth, height: innerHeight, scrollX, scrollY, devicePixelRatio});
  const byCoordinate = () => state.basis === "coordinate";
  const hasTarget = () => !state.error && (byCoordinate() ? !!state.coordinate : state.targets.length > 0);
  const rounded = value => Math.round(value * 100) / 100;
  function on(target, type, callback, options) { target.addEventListener(type, callback, options); listeners.push(() => target.removeEventListener(type, callback, options)); }
  function status(message, error = false) { $("#status").textContent = message; $("#work-status").textContent = message; $("#status").classList.toggle("error", error); }
  function setEditing(enabled) {
    workflowUI?.hide();
    if (state.captureController) finishCapture("interrupted", false);
    state.editing = enabled; $("#edit-mode").checked = enabled;
    state.recording = false; $("#record-key").textContent = "录入按键";
    panel.hidden = true;
    if (enabled) startPicker(state.pickShape);
    else { stopPicker(); status("编辑已关闭，网页可正常操作。开启后点击点选、拖动框选。"); }
    scheduleOutline();
  }
  function dismissInspector(discard = false, keepEditing = false) {
    const resume = keepEditing && state.editing;
    if (discard && !resume) undo(false);
    setEditing(resume);
    if (resume) status("窗口已关闭，编辑模式保持开启；可继续点击或拖动选择范围。");
  }
  function selectionComplete() {
    if (!hasTarget()) { if (state.editing) startPicker(state.pickShape); return; }
    stopPicker(); panel.hidden = false;
    tab("scope"); clampPanel(); scheduleOutline();
  }
  function selectorFor(el) {
    if (el.id && document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) return `#${CSS.escape(el.id)}`;
    const parts = [];
    for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
      if (node.id && document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) { parts.unshift(`#${CSS.escape(node.id)}`); break; }
      let part = node.localName;
      const siblings = node.parentElement ? [...node.parentElement.children].filter(x => x.localName === node.localName) : [];
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
      parts.unshift(part);
    }
    return parts.join(" > ") || "html";
  }
  function effectiveSelector() {
    if (byCoordinate()) return "";
    if (state.scope === "selector") return $("#custom-selector").value.trim();
    if (state.scope === "page") return "body, body *:not([data-pointscope-owned])";
    const roots = state.roots.map(selectorFor);
    return (state.scope === "subtree" ? roots.flatMap(sel => [sel, `${sel} *:not([data-pointscope-owned])`]) : roots).join(", ");
  }
  function snapshot(el) {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return {selector: selectorFor(el), tag: el.localName, rect: {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)}, computed: {display: s.display, position: s.position, color: s.color, backgroundColor: s.backgroundColor, fontSize: s.fontSize, padding: s.padding, borderRadius: s.borderRadius, translate: s.translate}};
  }
  function undo(announce = true) {
    baseStyle.textContent = "";
    state.stopInteraction?.(); state.stopInteraction = null;
    state.coordinateLayer?.cleanup(); state.coordinateLayer = null;
    state.marked.forEach(el => el.removeAttribute(token)); state.marked = [];
    state.preview = false;
    $("#undo").disabled = true;
    $("#preview").textContent = byCoordinate() ? "预览坐标范围" : "预览修改";
    $("#preview-state").textContent = "LOCAL / 本地预览";
    if (announce) status("预览已撤销，页面恢复原样。");
    scheduleOutline();
  }
  function collect() {
    if (byCoordinate()) { undo(false); updateTarget(); updateOutput(); scheduleOutline(); return; }
    undo(false); state.error = "";
    try {
      state.roots = state.roots.filter(el => el.isConnected);
      const sel = effectiveSelector();
      if (state.scope === "selector" && !sel) throw Error("请输入 CSS 选择器。");
      state.targets = sel ? [...document.querySelectorAll(sel)].filter(el => !ignored(el)) : [];
      if (state.targets.length > 1500) throw Error("匹配超过 1500 个元素，请缩小影响范围。");
      if ((state.roots.length || state.scope === "page" || sel) && !state.targets.length) throw Error("没有找到匹配元素，请检查选择器或重新选择。");
      state.snapshotViewport = viewport();
      state.snapshots = state.targets.slice(0, 40).map(snapshot);
    } catch (error) {
      state.targets = []; state.snapshots = [];
      state.error = error.name === "SyntaxError" ? "CSS 选择器无效，请检查语法。" : error.message;
      status(state.error, true);
    }
    updateTarget(); updateOutput(); scheduleOutline();
  }
  function updateTarget() {
    if (byCoordinate()) {
      const g = state.coordinate, ready = hasTarget();
      $("#count").textContent = ready ? (g.kind === "point" ? "COORDINATE POINT" : g.kind === "polygon" ? `${g.points.length} BOUNDARY POINTS` : `${g.width} × ${g.height} px`) : "COORDINATES";
      $("#target-dot").classList.toggle("ready", ready);
      $("#target-title").textContent = ready ? (g.kind === "point" ? "已标记坐标点" : g.kind === "polygon" ? "已圈选不规则区域" : "已框选坐标区域") : "等待选择坐标";
      $("#parent").hidden = true;
      $("#target-selector").textContent = ready ? `X ${g.x} / Y ${g.y}${g.kind !== "point" ? ` / W ${g.width} / H ${g.height}` : ` / R ${g.radius}`}` : "点选、框选或手动输入坐标";
      $("#target-meta").textContent = ready ? `${g.space === "document" ? "页面坐标 · 随页面滚动" : "视口坐标 · 固定于视口"} / CSS px · 不吸附元素` : "支持空白区域 · 精确保留你的坐标边界";
      ["#preview", "#copy", "#download"].forEach(id => $(id).disabled = !ready);
      return;
    }
    $("#parent").hidden = false;
    const count = state.targets.length;
    $("#count").textContent = `${count} ELEMENT${count === 1 ? "" : "S"}`;
    $("#target-dot").classList.toggle("ready", !!count);
    $("#target-title").textContent = count ? `${state.mode === "rectangle" ? "已框选" : "已定位"} · ${count} 个元素` : "等待选择目标";
    $("#parent").disabled = state.roots.length !== 1 || !state.roots[0]?.parentElement || state.roots[0] === document.body;
    $("#target-selector").textContent = effectiveSelector() || "在网页上点一下，开始选择";
    const r = state.roots[0]?.getBoundingClientRect();
    $("#target-meta").textContent = r ? `X ${Math.round(r.x)}  Y ${Math.round(r.y)}  /  ${Math.round(r.width)} × ${Math.round(r.height)} px${count > 40 ? " · 结构采样 40 项" : ""}` : "Esc 退出选择 · 拖动顶部可移动面板";
    ["#preview", "#copy", "#download"].forEach(id => $(id).disabled = !count || !!state.error);
  }
  function interaction() {
    return {enabled: $("#interaction-enabled").checked, event: $("#event").value, effect: $("#effect").value, key: $("#key").value || "Enter", modifiers: Object.fromEntries($$("[data-mod]").map(el => [el.dataset.mod, el.checked])), preventDefault: $("#prevent-default").checked};
  }
  function baseConfig() {
    const coordinate = byCoordinate();
    return {schemaVersion: "1.4", tool: "PointScope", generatedAt: new Date().toISOString(), page: {origin: location.origin, pathname: location.pathname}, viewport: (coordinate ? state.coordinateViewport : state.snapshotViewport) || viewport(), currentViewport: viewport(), selection: {basis: state.basis, mode: coordinate ? state.coordinate.kind : state.mode, geometry: coordinate ? {...state.coordinate} : null, rectangle: coordinate ? null : state.rectangle, capturedViewport: coordinate ? state.coordinateViewport : state.selectionViewport, roots: coordinate ? [] : state.roots.filter(el => el.isConnected).map(selectorFor), polygon: coordinate ? null : state.elementPolygon}, selector: coordinate ? null : effectiveSelector(), scope: coordinate ? "coordinate" : state.scope, targetCount: coordinate ? 0 : state.targets.length, targets: coordinate ? [] : state.snapshots, targetsSampled: !coordinate && state.targets.length > 40, styles: coordinate ? {} : {...state.styles}, interaction: interaction(), inputEvidence: captureEvidence(), visionEvidence: visionUI?.evidence() || null, intent: $("#intent").value};
  }
  function config() {return {...baseConfig(),workflow:workflowUI?.summary()||null};}
  function output() {
    const data = config();
    return state.format === "json" ? JSON.stringify(data, null, 2) : state.format === "css" ? C.css(data) : state.format === "js" ? C.interactionJS(data) : C.prompt(data);
  }
  function updateOutput() {
    $("#output").value = hasTarget() ? output() : "";
    $("#output-kind").textContent = state.format.toUpperCase();
    renderCapture(); visionUI?.render();
  }
  function captureContext() {
    return {basis: state.basis, scope: byCoordinate() ? "coordinate" : state.scope, selector: effectiveSelector() || null, geometry: byCoordinate() && state.coordinate ? {...state.coordinate} : null, ...(state.elementPolygon && !byCoordinate() ? {polygon: state.elementPolygon} : {})};
  }
  function captureMatches() { return !!state.capture && JSON.stringify(state.capture.context) === JSON.stringify(captureContext()); }
  function scheduleTraces() {if (!traceFrame && !destroyed) traceFrame = requestAnimationFrame(drawTraces);}
  function drawTraces() {
    traceFrame = 0;
    if (destroyed) return;
    const layer = $("#input-traces"), live = !!state.captureController;
    const visible = $("#capture-show-traces").checked && !state.picker && (live || (!panel.hidden && panel.classList.contains("intent-view") && captureMatches()));
    layer.toggleAttribute("hidden", !visible); layer.replaceChildren();
    if (!visible) return;
    const context = live ? captureLiveContext : state.capture.context;
    // Viewport selections stay fixed; other evidence follows page scrolling.
    const fixed = context?.geometry?.space === "viewport";
    layer.dataset.space = fixed ? "viewport" : "document";
    layer.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
    const project = p => ({x: fixed ? p.x : p.pageX - scrollX, y: fixed ? p.y : p.pageY - scrollY});
    const make = (tag, attrs, parent) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      parent.append(node); return node;
    };
    const arrow = (group, from, end) => {
      const distance = Math.hypot(end.x - from.x, end.y - from.y);
      if (distance < 1) return;
      const dx = (end.x - from.x) / distance, dy = (end.y - from.y) / distance;
      make("polygon", {class: "trace-arrow", points: `${end.x},${end.y} ${end.x - 10 * dx + 5 * dy},${end.y - 10 * dy - 5 * dx} ${end.x - 10 * dx - 5 * dy},${end.y - 10 * dy + 5 * dx}`}, group);
    };
    const draw = (action, index, pending = false) => {
      if (!action.start) return; // Keyboard actions have no spatial location.
      const p = project(action.start), end = project(action.end || action.start);
      const ink = action.kind === "stroke" || action.cancelledKind === "stroke", eraser = ink && action.tool === "eraser";
      const pendingLabel = ink ? eraser ? "擦除演示" : "绘制中" : Math.hypot(end.x - p.x, end.y - p.y) >= 6 ? "拖动中" : "按下";
      const group = make("g", {"data-kind": action.kind, "data-step": index + 1, "data-device": action.device || "", "data-tool": action.tool || "", class: pending ? "trace-live" : "trace-complete", style: `--trace-color:${eraser ? "#b75a65" : action.kind === "wheel" ? "#b66a23" : "#078875"}`}, layer);
      const title = make("title", {}, group); title.textContent = pending ? pendingLabel : I.actionLabel(action);
      if (ink) {
        const samples = action.path || [action.start, action.end || action.start];
        const points = samples.map(sample => ({...project(sample), radius: .9 + 4.1 * (Number.isFinite(sample.pressure) ? sample.pressure : .5)}));
        const coords = points.map(v => `${v.x},${v.y}`).join(" ");
        if (eraser) {
          make("polyline", {class: "trace-halo", points: coords, style: "stroke-width:11"}, group);
          make("polyline", {class: "trace-line trace-eraser", points: coords, style: "stroke-width:7;stroke-dasharray:5 5"}, group);
        } else {
          const left = [], right = [];
          points.forEach((point, i) => {
            const previous = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
            const distance = Math.hypot(next.x - previous.x, next.y - previous.y) || 1;
            const nx = -(next.y - previous.y) / distance * point.radius, ny = (next.x - previous.x) / distance * point.radius;
            left.push(`${point.x + nx},${point.y + ny}`); right.push(`${point.x - nx},${point.y - ny}`);
          });
          const d = `M ${left.join(" L ")} L ${right.reverse().join(" L ")} Z`;
          make("path", {class: "trace-ink-halo", d, fill: "#fff", stroke: "#fff", "stroke-width": 2.5, "stroke-linejoin": "round"}, group);
          make("path", {class: "trace-ink", d, fill: "var(--trace-color)"}, group);
          [points[0], points.at(-1)].forEach(point => make("circle", {class: "trace-ink-cap", cx: point.x, cy: point.y, r: point.radius, fill: "var(--trace-color)"}, group));
        }
      } else if (action.kind === "drag") {
        const points = (action.path || [action.start, action.end]).map(project);
        const coords = points.map(v => `${v.x},${v.y}`).join(" ");
        make("polyline", {class: "trace-halo", points: coords}, group);
        make("polyline", {class: "trace-line", points: coords}, group);
        const previous = points.slice(0, -1).reverse().find(v => Math.hypot(v.x - end.x, v.y - end.y) >= 1);
        if (previous) arrow(group, previous, end);
        make("circle", {class: "trace-point", cx: end.x, cy: end.y, r: 4}, group);
      } else if (action.kind === "wheel") {
        const amount = Math.hypot(action.delta.x, action.delta.y);
        if (amount) {
          const tip = {x: p.x + action.delta.x / amount * 40, y: p.y + action.delta.y / amount * 40};
          const coords = `${p.x},${p.y} ${tip.x},${tip.y}`;
          make("polyline", {class: "trace-halo", points: coords}, group);
          make("polyline", {class: "trace-line", points: coords}, group); arrow(group, p, tip);
        }
      } else {
        make("circle", {class: "trace-ring", cx: p.x, cy: p.y, r: action.kind === "doubleClick" ? 21 : 16}, group);
        if (action.kind === "doubleClick") make("circle", {class: "trace-ring", cx: p.x, cy: p.y, r: 15}, group);
      }
      if (!ink) make("circle", {class: "trace-point", cx: p.x, cy: p.y, r: action.kind === "drag" ? 4 : 7}, group);
      const pressure = pending ? action.end.pressure : action.pen?.pressure?.max;
      const labelName = pending ? pendingLabel : ink ? action.kind === "cancel" ? "笔迹取消" : eraser ? "擦除演示" : "笔迹" : I.names[action.kind] || action.kind;
      const label = `${String(index + 1).padStart(2, "0")} ${labelName}${ink && Number.isFinite(pressure) ? ` · P ${pressure.toFixed(2)}` : ""}`;
      const width = 14 + [...label].reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 11 : 6.2), 0);
      const x = p.x + 13, y = p.y < 34 ? p.y + 17 : p.y - 30;
      make("rect", {class: "trace-label", x, y, width, height: 22, rx: 6}, group);
      make("text", {class: "trace-text", x: x + 7, y: y + 11}, group).textContent = label;
    };
    const data = live ? captureLive : {actions: state.capture.result.actions.slice(-20), offset: Math.max(0, state.capture.result.actions.length - 20)};
    if (!data) return;
    data.actions.forEach((action, index) => draw(action, data.offset + index));
    if (data.wheel) draw(data.wheel, data.offset + data.actions.length);
    if (data.pointer) draw(data.pointer, data.offset + data.actions.length + (data.wheel ? 1 : 0), true);
  }
  function captureEvidence() {
    if (!state.capture || !captureMatches() || !$("#capture-include").checked || !state.capture.result.actions.length) return null;
    return {context: state.capture.context, collectionScope: state.capture.scope, ...state.capture.result, interpretation: {method: "local-rules", observation: state.capture.report.observation, candidates: state.capture.report.proposals, candidateText: $("#capture-proposal").value, confirmed: state.capture.confirmed, confirmedText: state.capture.confirmed ? $("#capture-proposal").value.trim() : null}};
  }
  function renderCapture() {
    scheduleTraces();
    const capture = state.capture, valid = hasTarget();
    $("#capture-touch-hint").hidden = !byCoordinate() || $("#capture-scope").value === "page" || $("#capture-pointer-mode").value !== "draw";
    $("#capture-start").disabled = !valid || !I || !!state.captureController;
    $("#capture-clear").disabled = !capture || !!state.captureController;
    $("#capture-results").hidden = !capture;
    if (!capture) return;
    const matched = captureMatches(), actions = capture.result.actions;
    $("#capture-count").textContent = `${actions.length} ACTIONS`;
    $("#capture-observation").textContent = capture.report.observation;
    const list = $("#capture-timeline"); list.replaceChildren();
    list.start = Math.max(1, actions.length - 19);
    actions.slice(-20).forEach(action => {const item = document.createElement("li"); item.textContent = `${(action.atMs / 1000).toFixed(1)}s · ${I.actionLabel(action)}`; list.append(item);});
    const reasons = {user: "使用者主动结束", escape: "按 Esc 结束", timeout: "达到 60 秒，已自动停止", "action-limit": "达到 100 个动作，已自动停止", hidden: "页面切到后台，已自动停止", blur: "页面失去焦点，已自动停止", interrupted: "采集已中断", pagehide: "页面离开，已停止", destroyed: "插件退出，已停止"};
    $("#capture-stop-reason").textContent = `${reasons[capture.result.stopReason] || "采集已结束"} · ${(capture.result.durationMs / 1000).toFixed(1)} 秒${actions.length > 20 ? " · 列表显示最近 20 个动作，导出包含全部记录" : ""}`;
    $("#capture-confirm").disabled = !matched || !actions.length || !$("#capture-proposal").value.trim();
    $("#capture-export").disabled = !matched || !valid;
    $("#capture-confirmation").classList.toggle("unconfirmed", !capture.confirmed || !matched);
    $("#capture-confirmation").textContent = !matched ? "选区已变化，旧记录保留供查看。请为当前选区重新采集；旧记录不会导出。" : capture.confirmed ? "意图已确认，将随当前选区交给 AI。" : "尚未确认，导出时只作为操作证据，不能当作确定需求。";
  }
  function captureControls(active) {
    $("#edit-switch-label").hidden = active; $("#stop-capture").hidden = !active;
    $("#edit-control").classList.toggle("capturing", active);
    $("#work-lasso").disabled = active;
    $$("[data-work-basis]").forEach(el => el.disabled = active);
  }
  function finishCapture(reason = "user", show = true) {
    if (!state.captureController) return;
    state.captureShowOnStop = show;
    state.captureController.stop(reason);
  }
  function startCapture() {
    if (!hasTarget() || !I || state.captureController) return;
    const context = captureContext(), scope = $("#capture-scope").value, targets = [...state.targets];
    const geometry = byCoordinate() ? {...state.coordinate} : null, resumeEditing = state.editing;
    $("#capture-start").blur(); undo(false); setEditing(false);
    state.captureReturnEditing = resumeEditing; state.captureShowOnStop = true; state.capture = null;
    captureLive = null; captureLiveContext = context;
    $("#capture-proposal").value = "";
    const contains = event => {
      if (scope === "page") return true;
      if (event.type === "keydown" && (event.target === document.body || event.target === document.documentElement)) return true;
      if (!geometry) return targets.some(el => el.isConnected && (el === event.target || el.contains(event.target)));
      if (event.type === "keydown") return false;
      const x = event.clientX + (geometry.space === "document" ? scrollX : 0) - geometry.x;
      const y = event.clientY + (geometry.space === "document" ? scrollY : 0) - geometry.y;
      return C.containsPoint(geometry, x + geometry.x, y + geometry.y);
    };
    let count = 0;
    const update = () => {
      const seconds = Math.floor((state.captureController?.elapsedMs || 0) / 1000);
      $("#capture-clock").textContent = `停止 · ${seconds}s`;
      $("#stop-capture").setAttribute("aria-label", `停止交互意图采集，已采集 ${count} 个动作`);
    };
    state.captureController = I.record({contains, ignore: ownEvent, viewport: viewport(), pointerMode: $("#capture-pointer-mode").value, touchActionTargets: scope === "page" ? [document.documentElement, document.body] : geometry ? [] : targets, suppressDefault: $("#capture-mode").value === "demonstrate", describeTarget: el => ({tag: el?.localName || "document", selector: el instanceof Element && !ignored(el) ? selectorFor(el) : ""}), onVisual: data => {captureLive = data; scheduleTraces();}, onUpdate: data => {count = data.count; update();}, onStop: result => {
      state.captureController = null;
      captureLive = null; captureLiveContext = null;
      if (state.captureTicker) clearInterval(state.captureTicker); state.captureTicker = null;
      captureControls(false);
      const report = I.summarize(result.actions);
      state.capture = {context, scope, result, report, confirmed: false};
      $("#capture-proposal").value = report.draft;
      if (!destroyed && state.captureShowOnStop) {
        state.editing = state.captureReturnEditing; $("#edit-mode").checked = state.editing;
        stopPicker(); panel.hidden = false; tab("capture"); clampPanel();
      }
      updateOutput(); scheduleOutline(); status(`已整理 ${result.actions.length} 个动作，请校对候选意图。`);
    }});
    captureControls(true); state.captureTicker = setInterval(update, 500); update();
    scheduleOutline(); status("交互意图采集中：演示你的操作，点击底部停止或按 Esc 结束。");
  }
  function updateInteraction() {
    const r = interaction();
    $("#interaction-fields").hidden = !r.enabled;
    $("#interaction-off").hidden = r.enabled;
    $("#keyboard").hidden = r.event !== "keydown";
    $("#rule-summary").textContent = `${C.eventNames[r.event]}${r.event === "keydown" ? ` (${Object.entries(r.modifiers).filter(([,v]) => v).map(([k]) => k + "+").join("")}${r.key === " " ? "Space" : r.key})` : ""} → ${C.effects[r.effect].label}`;
    $("#event-hint").textContent = r.event === "pointerenter" ? "移入生效，移出恢复。点击预览后生效。" : "每次触发切换效果，再次触发恢复。键盘响应忽略正在编辑的区域。";
    if (r.effect === "hide" && r.event !== "keydown") $("#event-hint").textContent += " 隐藏后请用「撤销预览」恢复。";
    if (byCoordinate()) $("#event-hint").textContent += r.event === "keydown" ? " 坐标参考层响应全局快捷键。" : " 在坐标选区内触发，效果作用于参考层。";
    undo(false); updateOutput();
    status("输入响应配置已更新，点击预览使其生效。");
  }
  function tab(name) {
    state.recording = false; $("#record-key").textContent = "录入按键";
    panel.classList.toggle("intent-view", name === "capture");
    panel.classList.toggle("vision-view", name === "vision");
    $$("[data-pane]").forEach(el => el.hidden = el.dataset.pane !== name);
    $$("[data-tab]").forEach(el => el.setAttribute("aria-selected", String(el.dataset.tab === name)));
    if (name === "vision") updateOutput();
    if (name === "capture") $(".body").scrollTop = 0;
    scheduleTraces();
    visionUI?.render();
  }
  function chooseScope(scope) {
    state.scope = scope;
    $$("[data-scope]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.scope === scope)));
    $("#selector-field").hidden = scope !== "selector";
    const hints = {element: "只改变选中的目标，保留其他区域。", subtree: "覆盖会分别应用到目标及后代，请仔细检查预览。", selector: "匹配当前页面的所有目标；选择器不跨 iframe 或 Shadow DOM。", page: "覆盖将应用到整个页面的可选元素，请仔细检查预览。"};
    $("#scope-hint").textContent = hints[scope];
    $("#scope-hint").classList.toggle("warn", scope === "page" || scope === "subtree");
    collect();
    if (!state.error) status(`影响范围已设为「${C.scopeNames[scope]}」。`);
  }
  function syncCoordinateControls() {
    const g = state.coordinate, point = (g?.kind || $("#coord-kind").value) === "point";
    if (g) {
      $("#coord-kind").value = g.kind; $("#coord-space").value = g.space;
      $("#coord-x").value = g.x; $("#coord-y").value = g.y;
      if (point) $("#coord-radius").value = g.radius;
      else { $("#coord-width").value = g.width; $("#coord-height").value = g.height; }
    }
    coordinateShapeUI(point);
  }
  function coordinateShapeUI(point = $("#coord-kind").value === "point") {
    $("#coord-size").hidden = point; $("#coord-radius-field").hidden = !point;
    $("#coord-x-label").textContent = point ? "X · 圆心" : "X · 左上角";
    $("#coord-y-label").textContent = point ? "Y · 圆心" : "Y · 左上角";
  }
  function coordinateChanged() {
    undo(false); coordinateShapeUI(); state.error = "";
    const kind = $("#coord-kind").value;
    if(kind==="polygon"&&state.coordinate?.kind!=="polygon"){startPicker("lasso");return;}
    const keys = ["x", "y", ...(kind === "point" ? ["radius"] : ["width", "height"])];
    const invalid = keys.some(key => {const input = $(`#coord-${key}`); return input.value === "" || !input.validity.valid || !Number.isFinite(Number(input.value));});
    if (invalid) state.error = "请输入有效的 X/Y 和正数范围尺寸，或重新点选、框选。";
    else {
      const values = Object.fromEntries(keys.map(key => [key, Number($(`#coord-${key}`).value)]));
      if (kind === "polygon") {
        const previous = state.coordinate;
        if (!previous || previous.kind !== "polygon") {startPicker("lasso"); return;}
        const points = previous.points.map(p => ({x: values.x + (p.x-previous.x)*values.width/previous.width, y: values.y + (p.y-previous.y)*values.height/previous.height}));
        try {state.coordinate = C.polygonGeometry(points, $("#coord-space").value);} catch(error) {state.error=error.message;}
      } else state.coordinate = {kind, space: $("#coord-space").value, ...values};
      state.coordinateViewport = viewport();
    }
    updateTarget(); updateOutput(); scheduleOutline();
    status(state.error || "坐标范围已更新，可预览或交给 AI。", !!state.error);
  }
  function setCoordinate(rectangle, kind) {
    const space = $("#coord-space").value;
    state.coordinate = {kind, space, x: rounded(rectangle.x + (space === "document" ? scrollX : 0)), y: rounded(rectangle.y + (space === "document" ? scrollY : 0)), ...(kind === "point" ? {radius: Number($("#coord-radius").value) > 0 && $("#coord-radius").validity.valid ? Number($("#coord-radius").value) : 24} : {width: rounded(rectangle.width), height: rounded(rectangle.height)})};
    syncCoordinateControls(); coordinateChanged(); selectionComplete();
  }
  function chooseBasis(basis, fromToolbar = false) {
    const resume = state.editing && (panel.hidden || fromToolbar);
    stopPicker(); undo(false); state.basis = basis; state.error = "";
    $$("[data-basis]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.basis === basis)));
    $$("[data-work-basis]").forEach(el => el.setAttribute("aria-pressed", String(el.dataset.workBasis === basis)));
    const coordinate = byCoordinate();
    $("#element-scopes").hidden = coordinate; $("#element-styles").hidden = coordinate;
    $("#coordinate-controls").hidden = !coordinate; $("#coordinate-note").hidden = !coordinate;
    $("#selector-field").hidden = coordinate || state.scope !== "selector";
    $("#scope-title").textContent = coordinate ? "坐标与范围" : "影响范围";
    $("#pick-label").textContent = coordinate ? "点选坐标" : "点选元素";
    $("#box-label").textContent = coordinate ? "框选坐标" : "框选区域";
    $("#interaction-target").textContent = coordinate ? "可选 · 测试坐标参考层的输入响应" : "可选 · 默认保留页面原有行为";
    $("#preview").textContent = coordinate ? "预览坐标范围" : "预览修改";
    if (coordinate) {
      state.targets = []; state.snapshots = [];
      $("#scope-hint").textContent = "按 CSS 像素记录位置与范围，不依赖元素边界。";
      $("#scope-hint").classList.remove("warn"); syncCoordinateControls();
      if (state.coordinate) coordinateChanged();
      else { updateTarget(); updateOutput(); scheduleOutline(); }
    } else chooseScope(state.scope);
    status(coordinate ? "已切换按坐标：可在空白处点选、跨元素框选或输入数值。" : "已切换按元素，点选或框选网页元素。");
    if (resume) startPicker(state.pickShape);
  }
  function setRoots(roots, mode, rectangle = null, polygon = null) {
    state.roots = [...new Set(roots)].filter(el => !ignored(el) && el.isConnected);
    state.mode = mode; state.rectangle = rectangle;
    state.elementPolygon = polygon;
    state.selectionViewport = viewport();
    $("#custom-selector").value = state.roots.map(selectorFor).join(", ");
    chooseScope("element");
    status(state.targets.length ? `已选择 ${state.targets.length} 个目标，可设置范围和样式。` : "区域内没有完整包含的元素，请换一个区域。", !state.targets.length);
    selectionComplete();
  }
  function visionGeometry() {
    if (byCoordinate()) return state.coordinate;
    if (state.elementPolygon && ["element", "subtree"].includes(state.scope)) return state.elementPolygon;
    if (!state.targets.length) return null;
    if (state.scope === "page") return {kind:"rectangle",space:"document",x:scrollX,y:scrollY,width:innerWidth,height:innerHeight};
    const rects=state.targets.filter(el=>el.isConnected).map(el=>el.getBoundingClientRect());
    const x=Math.min(...rects.map(r=>r.left)),y=Math.min(...rects.map(r=>r.top));
    return {kind:"rectangle",space:"document",x:x+scrollX,y:y+scrollY,width:Math.max(...rects.map(r=>r.right))-x,height:Math.max(...rects.map(r=>r.bottom))-y};
  }
  function addLassoPoint(event) {
    let samples=[];try{samples=event.getCoalescedEvents?.()||[];}catch{}
    for(const sample of samples.length?samples:[event]) {
      if (!sample.isTrusted || sample.pointerId !== event.pointerId) continue;
      const p={x:sample.clientX,y:sample.clientY},last=lassoPoints.at(-1);
      if(last&&Math.hypot(last.x-p.x,last.y-p.y)<1)continue;
      if(lassoPoints.length>=512)lassoPoints=lassoPoints.filter((_,i)=>i%2===0);
      lassoPoints.push(p);
    }
  }
  function drawLasso() {
    const layer=$("#lasso-visual"),picking=state.picker==="lasso";
    const selected=byCoordinate()?state.coordinate?.kind==="polygon"&&!state.coordinateLayer?state.coordinate:null:["element","subtree"].includes(state.scope)?state.elementPolygon:null;
    const visible=picking||!!(selected&&(!panel.hidden||state.captureController));
    layer.toggleAttribute("hidden",!visible);layer.setAttribute("viewBox",`0 0 ${innerWidth} ${innerHeight}`);
    layer.classList.toggle("lasso-selecting",picking);
    const points=picking?lassoPoints||[]:selected?.points.map(p=>({x:p.x-(selected.space==="document"?scrollX:0),y:p.y-(selected.space==="document"?scrollY:0)}))||[];
    layer.querySelector("path").setAttribute("d",points.length?`M ${points.map(p=>`${p.x},${p.y}`).join(" L ")}${points.length>2?" Z":""}`:"");
    layer.dataset.points=String(points.length);
  }
  function finishLasso(event) {
    addLassoPoint(event);
    const points=lassoPoints.map(p=>({...p})),v=lassoViewport;
    swallowClick=true;if(swallowTimer)clearTimeout(swallowTimer);swallowTimer=setTimeout(()=>{swallowClick=false;swallowTimer=null;},0);
    stopPicker();
    try {
      if(v.width!==innerWidth||v.height!==innerHeight||v.scrollX!==scrollX||v.scrollY!==scrollY)throw Error("圈选时视口发生变化，请重新圈选。");
      const g=C.polygonGeometry(points,"viewport");
      if(byCoordinate()) {
        const page=$("#coord-space").value==="document";
        state.coordinate=C.polygonGeometry(g.points.map(p=>({x:p.x+(page?scrollX:0),y:p.y+(page?scrollY:0)})),page?"document":"viewport");
        state.coordinateViewport=viewport();state.error="";syncCoordinateControls();updateTarget();updateOutput();selectionComplete();
        status(`已圈选不规则坐标区域，保留 ${state.coordinate.points.length} 个边界点。`);
      } else {
        const candidates=[...document.body.querySelectorAll("*")].filter(el=>{if(ignored(el))return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=="hidden"&&C.containsRect(g,r);});
        const set=new Set(candidates),roots=candidates.filter(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(set.has(p))return false;return true;});
        const page=C.polygonGeometry(g.points.map(p=>({x:p.x+scrollX,y:p.y+scrollY})),"document");
        if(roots.length)setRoots(roots,"polygon",null,page);
        else {
          chooseBasis("coordinate");state.coordinate=page;state.coordinateViewport=viewport();state.error="";syncCoordinateControls();updateTarget();updateOutput();selectionComplete();
          status("圈线内没有完整元素，已按实际轮廓保留为坐标区域，可直接预览并交接。");
        }
      }
    } catch(error) {if(state.editing)startPicker("lasso");status(error.message,true);}
    scheduleOutline();
  }
  function rectStyle(node, rect) {
    node.style.left = `${rect.left ?? rect.x}px`; node.style.top = `${rect.top ?? rect.y}px`;
    node.style.width = `${Math.max(0, rect.width)}px`; node.style.height = `${Math.max(0, rect.height)}px`;
    const tag = node.querySelector(".tag");
    if (tag) tag.style.top = (rect.top ?? rect.y) < 26 ? "1px" : "-24px";
  }
  function drawOutlines() {
    frame = 0;
    if (destroyed) return;
    updateTarget();
    drawLasso();
    $("#outlines").replaceChildren();
    if (state.picker || (panel.hidden && !state.captureController)) return;
    if (byCoordinate()) {
      if (!hasTarget() || state.coordinateLayer) return;
      const g = state.coordinate, radius = g.kind === "point" ? g.radius : 0;
      if (g.kind === "polygon") return;
      const outline = document.createElement("div"); outline.className = `outline coordinate-ref${radius ? " point" : ""}`;
      if (radius) outline.textContent = "+";
      const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = `X ${g.x} / Y ${g.y}${radius ? ` / R ${radius}` : ` / ${g.width} × ${g.height}`} · ${g.space === "document" ? "PAGE" : "VIEWPORT"}`; outline.append(tag);
      rectStyle(outline, {x: g.x - radius - (g.space === "document" ? scrollX : 0), y: g.y - radius - (g.space === "document" ? scrollY : 0), width: radius ? radius * 2 : g.width, height: radius ? radius * 2 : g.height});
      $("#outlines").append(outline); return;
    }
    const outlineTargets = state.scope === "element" || state.scope === "subtree" ? state.roots : state.targets;
    outlineTargets.filter(el => el.isConnected).slice(0, 60).forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) return;
      const outline = document.createElement("div"); outline.className = "outline";
      if (index === 0) { const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = `${el.localName}${el.id ? "#" + el.id : ""} · ${state.targets.length} ELEMENTS`; outline.append(tag); }
      rectStyle(outline, rect); $("#outlines").append(outline);
    });
  }
  function scheduleOutline() { scheduleTraces(); if (!frame && !destroyed) frame = requestAnimationFrame(drawOutlines); }
  function stopPicker() {
    if (boxPointer != null) { try { document.documentElement.releasePointerCapture(boxPointer); } catch {} try {$("#lasso-visual").releasePointerCapture(boxPointer);} catch {} }
    boxStart = null; boxPointer = null; gestureBox = false; state.picker = null;
    lassoPoints = null; lassoViewport = null;
    $("#lasso-visual").classList.remove("lasso-selecting");
    panel.classList.remove("picking");
    ["#hover", "#marquee", "#help"].forEach(id => $(id).hidden = true);
    ["#pick", "#box"].forEach(id => $(id).classList.remove("active"));
    scheduleOutline();
  }
  function startPicker(mode) {
    workflowUI?.hide();
    if (state.captureController) finishCapture("interrupted", false);
    state.recording = false; $("#record-key").textContent = "录入按键";
    undo(false); stopPicker(); state.picker = mode;
    if (mode !== "auto") state.pickShape = mode === "lasso" ? "lasso" : "auto";
    $("#work-lasso").setAttribute("aria-pressed", String(state.pickShape === "lasso"));
    $("#lasso-visual").classList.toggle("lasso-selecting", mode === "lasso");
    state.editing = true; $("#edit-mode").checked = true; panel.hidden = true;
    $("#outlines").replaceChildren();
    $("#hover").classList.toggle("coordinate-ref", byCoordinate());
    $("#hover").style.borderRadius = byCoordinate() ? "50%" : "";
    $("#help").textContent = byCoordinate() ? (mode === "point" ? "点击任意位置记录坐标 · 不吸附元素 · Esc 取消" : "拖出任意矩形记录坐标 · 不吸附元素 · Esc 取消") : (mode === "point" ? "点击网页元素以选择 · Esc 取消" : "拖动框住目标元素 · 选择完全位于框内的元素 · Esc 取消");
    $("#help").hidden = true;
    if (mode === "lasso") status("沿区域边缘画一圈，松笔自动闭合；Esc 取消。可使用鼠标、触控笔或触屏。");
    scheduleOutline();
  }
  function finishBox(event) {
    if (!boxStart) return;
    const rectangle = {x: Math.min(boxStart.x, event.clientX), y: Math.min(boxStart.y, event.clientY), width: Math.abs(event.clientX - boxStart.x), height: Math.abs(event.clientY - boxStart.y)};
    if (byCoordinate()) {
      stopPicker();
      if (rectangle.width < .01 || rectangle.height < .01) { status("请拖出有宽度和高度的坐标矩形。", true); if (state.editing) startPicker("auto"); return; }
      setCoordinate(rectangle, "rectangle"); return;
    }
    const candidates = [...document.body.querySelectorAll("*")].filter(el => {
      if (ignored(el)) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" && r.left >= rectangle.x && r.top >= rectangle.y && r.right <= rectangle.x + rectangle.width && r.bottom <= rectangle.y + rectangle.height;
    });
    const set = new Set(candidates);
    const roots = candidates.filter(el => { for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });
    stopPicker();
    if (rectangle.width < 4 || rectangle.height < 4) { status("框选区域过小，请拖动形成一个矩形。", true); if (state.editing) startPicker("auto"); return; }
    setRoots(roots, "rectangle", Object.fromEntries(Object.entries(rectangle).map(([k,v]) => [k, Math.round(v)])));
  }
  function applyPreview() {
    // Refresh matching targets and baseline before each application.
    collect();
    if (byCoordinate()) {
      if (!hasTarget()) { status(state.error || "请先选择或输入坐标。", true); return; }
      const r = interaction();
      state.coordinateLayer = C.mountCoordinate({...state.coordinate}, {parent: shadow});
      if (r.enabled) state.stopInteraction = C.installInteraction([state.coordinateLayer.element], r, C.effects[r.effect].declarations, {styleRoot: shadow, eventRoot: document, hitTest: state.coordinateLayer.contains, ignore: ownEvent});
      state.preview = true; $("#undo").disabled = false; $("#preview").textContent = "更新坐标预览";
      $("#preview-state").textContent = "LIVE / 坐标参考层";
      status(`坐标参考层已启用。${r.enabled ? "范围内输入触发参考层响应。" : "可查看选区位置；实际改动请交给 AI。"}`);
      scheduleOutline(); return;
    }
    if (state.error || !state.targets.length) { status(state.error || "请先选择目标。", true); return; }
    const bad = $$("[data-style]").find(el => el.value && (el.type === "number" ? !el.validity.valid : !/^#[0-9a-f]{6}$/i.test(el.value)));
    if (bad) { status(bad.type === "number" ? "数值超出允许范围，请检查位置与尺寸。" : "颜色请填写完整的 #RRGGBB 格式。", true); bad.focus(); return; }
    const r = interaction();
    if (!C.declarations(state.styles) && !r.enabled) { status("还没有设置样式或输入响应，请先定义改动。", true); return; }
    state.marked = [...state.targets];
    state.marked.forEach(el => el.setAttribute(token, ""));
    baseStyle.textContent = C.declarations(state.styles) ? `[${token}] { ${C.declarations(state.styles)} }` : "";
    if (r.enabled) state.stopInteraction = C.installInteraction(state.targets, r, C.effects[r.effect].declarations, {ignore: ownEvent, onChange: scheduleOutline});
    state.preview = true;
    $("#undo").disabled = false; $("#preview").textContent = "更新预览";
    $("#preview-state").textContent = "LIVE / 预览已启用";
    status(`预览作用于 ${state.targets.length} 个元素。${r.enabled ? "现在可在网页上测试输入响应。" : "点击撤销即可恢复。"}`);
    scheduleOutline();
  }
  async function copy() {
    const text = $("#output").value;
    try {
      // Selecting the explicit output remains a reliable fallback on HTTP pages.
      if (!navigator.clipboard?.writeText) throw Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      status("已复制，可以粘贴给你的 AI 开发助手。");
    } catch {
      tab("vision"); $("#output").value = text; $("#output").focus(); $("#output").select();
      status("已选中全部内容，请按 Ctrl+C（Mac 用 ⌘C）复制。", true);
    }
  }
  function download() {
    const extensions = {prompt: "md", json: "json", css: "css", js: "js"};
    const blob = new Blob([$("#output").value], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = `pointscope.${extensions[state.format]}`;
    // Attach to the shadow tree so host-page CSS cannot affect the link.
    shadow.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    status("文件已导出，可作为 AI 开发上下文或实现参考。");
  }
  const bounded = (value, low, high) => Math.max(low, Math.min(value, Math.max(low, high)));
  function panelBounds() {
    return {left: 8, top: 8, right: innerWidth - 8, bottom: Math.max(80, $("#work-controls").getBoundingClientRect().top - 16)};
  }
  function clampPanel() {
    if (panel.hidden) return;
    const b = panelBounds(), maxWidth = Math.max(1, b.right - b.left), maxHeight = Math.max(1, b.bottom - b.top);
    panel.style.width = `${bounded(state.panelSize?.width || 364, Math.min(320, maxWidth), maxWidth)}px`;
    panel.style.maxHeight = `${maxHeight}px`;
    panel.style.height = state.panelSize ? `${bounded(state.panelSize.height, Math.min(340, maxHeight), maxHeight)}px` : "";
    if (state.panelPosition) {
      const r = panel.getBoundingClientRect();
      panel.style.right = "auto";
      panel.style.left = `${bounded(state.panelPosition.x, b.left, b.right - r.width)}px`;
      panel.style.top = `${bounded(state.panelPosition.y, b.top, b.bottom - r.height)}px`;
    } else {
      panel.style.left = ""; panel.style.right = ""; panel.style.top = "";
      panel.style.maxHeight = `${Math.max(1, b.bottom - panel.getBoundingClientRect().top)}px`;
    }
  }
  function resizePanel(event) {
    if (!resizeStart || event.pointerId !== resizeStart.pointerId) return;
    const s = resizeStart, b = panelBounds(), dx = event.clientX - s.x, dy = event.clientY - s.y;
    const minWidth = Math.min(320, b.right - b.left), minHeight = Math.min(340, b.bottom - b.top);
    let left = s.rect.left, right = s.rect.right, top = s.rect.top, bottom = s.rect.bottom;
    if (s.edge.includes("w")) left = bounded(s.rect.left + dx, b.left, right - minWidth);
    if (s.edge.includes("e")) right = bounded(s.rect.right + dx, left + minWidth, b.right);
    if (s.edge.includes("n")) top = bounded(s.rect.top + dy, b.top, bottom - minHeight);
    if (s.edge.includes("s")) bottom = bounded(s.rect.bottom + dy, top + minHeight, b.bottom);
    state.panelPosition = {x: left, y: top};
    state.panelSize = {width: right - left, height: bottom - top};
    clampPanel();
  }
  function destroy() {
    if (destroyed) return;
    finishCapture("destroyed", false);
    shortcutsUI?.destroy();
    visionUI?.destroy();
    workflowUI?.destroy();
    stopPicker(); undo(false); destroyed = true;
    listeners.forEach(fn => fn());
    if (frame) cancelAnimationFrame(frame);
    if (traceFrame) cancelAnimationFrame(traceFrame);
    if (swallowTimer) clearTimeout(swallowTimer);
    observer.disconnect(); baseStyle.remove(); host.remove(); delete globalThis.__pointscope;
  }
  on($("#pick"), "click", () => startPicker("point"));
  on($("#box"), "click", () => startPicker("rectangle"));
  on($("#lasso"), "click", () => startPicker("lasso"));
  on($("#work-lasso"), "click", () => {
    state.pickShape = state.pickShape === "lasso" ? "auto" : "lasso";
    $("#work-lasso").setAttribute("aria-pressed", String(state.pickShape === "lasso"));
    setEditing(true);
  });
  on($("#edit-mode"), "change", event => setEditing(event.target.checked));
  on($("#close"), "click", () => dismissInspector(true, true));
  on($("#parent"), "click", () => { const parent = state.roots[0]?.parentElement; if (parent && !ignored(parent)) setRoots([parent], "point"); });
  on($("#minimize"), "click", () => dismissInspector(false));
  on($("#dock"), "click", () => { state.panelPosition = null; clampPanel(); });
  on($("#preview"), "click", applyPreview); on($("#undo"), "click", () => undo());
  on($("#copy"), "click", copy); on($("#download"), "click", download);
  on($("#capture-start"), "click", startCapture);
  on($("#capture-show-traces"), "change", scheduleTraces);
  ["#capture-pointer-mode", "#capture-scope", "#capture-mode"].forEach(id => on($(id), "change", renderCapture));
  on($("#stop-capture"), "click", () => finishCapture("user"));
  on($("#capture-clear"), "click", () => {state.capture = null; $("#capture-proposal").value = ""; updateOutput(); status("已清空交互操作记录。");});
  on($("#capture-proposal"), "input", () => {if (state.capture) state.capture.confirmed = false; updateOutput();});
  on($("#capture-confirm"), "click", () => {
    if (!state.capture || !captureMatches() || !$("#capture-proposal").value.trim()) return;
    state.capture.confirmed = true; $("#capture-include").checked = true; updateOutput(); status("意图已确认，将随当前选区的 AI 上下文导出。");
  });
  on($("#capture-include"), "change", updateOutput);
  on($("#capture-export"), "click", () => {state.format = "prompt"; $$("[data-format]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.format === "prompt"))); tab("vision");});
  $$("[data-tab]").forEach(el => on(el, "click", () => tab(el.dataset.tab)));
  $$("[data-basis]").forEach(el => on(el, "click", () => chooseBasis(el.dataset.basis)));
  $$("[data-work-basis]").forEach(el => on(el, "click", () => { if (state.basis !== el.dataset.workBasis) chooseBasis(el.dataset.workBasis, true); }));
  ["x", "y", "width", "height", "radius"].forEach(key => on($(`#coord-${key}`), "input", coordinateChanged));
  on($("#coord-kind"), "change", coordinateChanged);
  on($("#coord-space"), "change", () => {
    const g = state.coordinate, next = $("#coord-space").value;
    if (g && g.space !== next) {
      const sign = next === "document" ? 1 : -1;
      state.coordinate = {...g, space: next, x: rounded(g.x + sign * scrollX), y: rounded(g.y + sign * scrollY)};
      if(g.kind==="polygon")state.coordinate.points=g.points.map(p=>({x:rounded(p.x+sign*scrollX),y:rounded(p.y+sign*scrollY)}));
      syncCoordinateControls(); coordinateChanged();
    }
  });
  $$("[data-scope]").forEach(el => on(el, "click", () => chooseScope(el.dataset.scope)));
  $$("[data-format]").forEach(el => on(el, "click", () => { state.format = el.dataset.format; $$("[data-format]").forEach(btn => btn.setAttribute("aria-pressed", String(btn === el))); updateOutput(); }));
  on($("#custom-selector"), "input", collect);
  on($("#intent"), "input", updateOutput);
  $$("[data-style]").forEach(el => on(el, "input", () => { state.styles[el.dataset.style] = el.value; undo(false); updateOutput(); status("样式已更新，点击预览查看效果。"); }));
  on($("#clear-styles"), "click", () => { state.styles = {}; $$("[data-style]").forEach(el => el.value = ""); undo(false); updateOutput(); status("已清空样式覆盖。"); });
  ["#interaction-enabled", "#event", "#effect", "#prevent-default", ...$$("[data-mod]")].forEach(item => on(typeof item === "string" ? $(item) : item, "change", updateInteraction));
  on($("#key"), "input", updateInteraction);
  on($("#record-key"), "click", () => { state.recording = !state.recording; $("#record-key").textContent = state.recording ? "请按键…" : "录入按键"; });
  on(document, "keydown", event => {
    if (shortcutsUI?.handle(event)) return;
    if (state.captureController) {
      if (event.key === "Escape") {event.preventDefault(); event.stopImmediatePropagation(); finishCapture("escape");}
      return;
    }
    if (state.recording) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (["Control", "Alt", "Shift", "Meta"].includes(event.key)) return;
      state.recording = false; $("#record-key").textContent = "录入按键";
      if (event.key === "Escape") { status("已取消按键录入。"); return; }
      $("#key").value = event.key;
      $$("[data-mod]").forEach(el => el.checked = event[`${el.dataset.mod}Key`]);
      updateInteraction(); return;
    }
    if (event.key === "Escape" && (state.picker || !panel.hidden)) { event.preventDefault(); event.stopImmediatePropagation(); dismissInspector(false); status("已回到工作区，保留之前的目标。开启编辑可重新选择。"); }
  }, true);
  on(document, "pointermove", event => {
    if (state.picker === "lasso") {
      if(!event.isTrusted)return;
      if (lassoPoints && boxPointer === event.pointerId) {event.preventDefault(); event.stopImmediatePropagation(); addLassoPoint(event); scheduleOutline();}
      return;
    }
    if (!state.picker || ownEvent(event)) return;
    if (boxStart && (state.picker === "rectangle" || state.picker === "auto")) {
      if (state.picker === "rectangle" || Math.hypot(event.clientX - boxStart.x, event.clientY - boxStart.y) >= 6) gestureBox = true;
      if (gestureBox) {
        $("#hover").hidden = true; $("#marquee").hidden = false;
        event.preventDefault(); rectStyle($("#marquee"), {x: Math.min(boxStart.x, event.clientX), y: Math.min(boxStart.y, event.clientY), width: Math.abs(event.clientX - boxStart.x), height: Math.abs(event.clientY - boxStart.y)}); return;
      }
    }
    if (byCoordinate()) {
      const page = $("#coord-space").value === "document";
      $("#hover").hidden = false;
      $("#hover .tag").textContent = `X ${rounded(event.clientX + (page ? scrollX : 0))} / Y ${rounded(event.clientY + (page ? scrollY : 0))} · ${page ? "PAGE" : "VIEWPORT"}`;
      rectStyle($("#hover"), {x: event.clientX - 5, y: event.clientY - 5, width: 10, height: 10}); return;
    }
    const el = document.elementFromPoint(event.clientX, event.clientY);
    if (ignored(el)) { $("#hover").hidden = true; return; }
    $("#hover").hidden = false; $("#hover .tag").textContent = selectorFor(el);
    rectStyle($("#hover"), el.getBoundingClientRect());
  }, {capture: true, passive: false});
  on(document, "pointerdown", event => {
    if(state.picker==="lasso"&&!event.isTrusted)return;
    if (!state.picker || (ownEvent(event) && !isLassoEvent(event))) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.button !== 0) return;
    if (state.picker === "lasso") {
      lassoPoints = []; lassoViewport = viewport(); boxPointer = event.pointerId;
      addLassoPoint(event);
      try {$("#lasso-visual").setPointerCapture(event.pointerId);} catch {}
      scheduleOutline(); return;
    }
    if (state.picker === "rectangle" || state.picker === "auto") {
      boxStart = {x: event.clientX, y: event.clientY}; boxPointer = event.pointerId;
      try { document.documentElement.setPointerCapture(event.pointerId); } catch {}
      $("#hover").hidden = true; $("#marquee").hidden = state.picker === "auto";
      rectStyle($("#marquee"), {x: event.clientX, y: event.clientY, width: 0, height: 0});
    }
  }, true);
  on(document, "pointerup", event => {
    if(state.picker==="lasso"&&!event.isTrusted)return;
    if (!state.picker || (ownEvent(event) && !isLassoEvent(event))) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.button !== 0) return;
    if (state.picker === "lasso") {if (boxPointer === event.pointerId && lassoPoints) finishLasso(event); return;}
    if (state.picker === "auto" && !boxStart) return;
    swallowClick = true;
    if (swallowTimer) clearTimeout(swallowTimer);
    swallowTimer = setTimeout(() => {swallowClick = false; swallowTimer = null;}, 0);
    const rectangle = state.picker === "rectangle" || (state.picker === "auto" && (gestureBox || Math.hypot(event.clientX - boxStart.x, event.clientY - boxStart.y) >= 6));
    if (rectangle) finishBox(event);
    else if (byCoordinate()) { stopPicker(); setCoordinate({x: event.clientX, y: event.clientY}, "point"); }
    else {
      const el = document.elementFromPoint(event.clientX, event.clientY); stopPicker();
      if (!ignored(el)) setRoots([el], "point");
      else if (state.editing) { startPicker("auto"); status("此处没有可选元素，请换个位置或切换坐标。", true); }
    }
  }, true);
  on(document, "pointercancel", () => { if (state.picker) setEditing(false); }, true);
  on(document,"wheel",event=>{if(state.picker==="lasso"&&(!ownEvent(event)||isLassoEvent(event))){event.preventDefault();event.stopImmediatePropagation();}}, {capture:true,passive:false});
  on(document, "click", event => {
    if (ownEvent(event)) return;
    if (state.picker || swallowClick) { event.preventDefault(); event.stopImmediatePropagation(); swallowClick = false; }
  }, true);
  // During selection, suppress legacy mouse events too (drag/select handlers).
  ["mousedown", "mouseup", "dragstart", "contextmenu"].forEach(type => on(document, type, event => { if (state.picker && !ownEvent(event)) { event.preventDefault(); event.stopImmediatePropagation(); } }, true));
  on($("#drag"), "pointerdown", event => {
    if (event.target.closest("button") || event.button !== 0) return;
    const r = panel.getBoundingClientRect(); dragStart = {x: event.clientX - r.left, y: event.clientY - r.top};
    $("#drag").setPointerCapture(event.pointerId); event.preventDefault();
  });
  on($("#drag"), "pointermove", event => {
    if (!dragStart) return;
    state.panelPosition = {x: event.clientX - dragStart.x, y: event.clientY - dragStart.y};
    clampPanel();
  });
  on($("#drag"), "pointerup", () => { dragStart = null; clampPanel(); });
  on($("#drag"), "pointercancel", () => dragStart = null);
  $$("[data-resize]").forEach(handle => {
    on(handle, "pointerdown", event => {
      if (event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      resizeStart = {pointerId: event.pointerId, edge: handle.dataset.resize, x: event.clientX, y: event.clientY, rect: panel.getBoundingClientRect()};
      handle.setPointerCapture(event.pointerId); panel.classList.add("resizing");
    });
    on(handle, "pointermove", resizePanel);
    const finish = event => {
      if (!resizeStart || resizeStart.pointerId !== event.pointerId) return;
      if (event.type === "pointerup") resizePanel(event);
      resizeStart = null; panel.classList.remove("resizing");
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    };
    on(handle, "pointerup", finish); on(handle, "pointercancel", finish); on(handle, "lostpointercapture", finish);
  });
  on($("[data-resize=se]"), "keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (event.key === "Home") state.panelSize = null;
    else {
      const r = panel.getBoundingClientRect(), step = event.shiftKey ? 32 : 10;
      state.panelPosition = {x: r.left, y: r.top};
      state.panelSize = {width: r.width + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0), height: r.height + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0)};
    }
    clampPanel();
  });
  on($("[data-resize=se]"), "dblclick", () => {state.panelSize = null; clampPanel();});
  on(window, "scroll", () => {scheduleOutline(); visionUI?.render();}, {capture: true, passive: true});
  on(window, "resize", () => { clampPanel(); scheduleOutline(); updateOutput(); });
  on(window, "pagehide", destroy, {once: true});
  // Detect target removal by frameworks; never keep modifying a detached target.
  const observer = new MutationObserver(() => {
    if (state.targets.some(el => !el.isConnected)) { collect(); status("页面结构发生变化，已刷新目标；必要时重新点选。", true); }
  });
  observer.observe(document.body, {childList: true, subtree: true});
  globalThis.__pointscope = {show() { setEditing(false); }, toggle: destroy, destroy};
  visionUI = VP?.mount({shadow, host, on, valid: hasTarget, viewport, context: captureContext, config, status, update: updateOutput,
    active:()=>!document.hidden&&!panel.hidden&&panel.classList.contains("vision-view"),savedChanges:()=>workflowUI?.summary()?.nodes.filter(n=>n.type==="change").length||0,workflow:async()=>{workflowUI?.open();if(!workflowUI?.hasChanges())await workflowUI?.addCurrent();},send:async()=>{if(!workflowUI?.hasChanges())await workflowUI?.addCurrent();return workflowUI?.send();},
    geometry: visionGeometry,
    fingerprint: () => JSON.stringify([captureContext(), viewport()])});
  workflowUI = WF?.mount({shadow,on,valid:hasTarget,geometry:visionGeometry,config:baseConfig,update:updateOutput,packet:()=>visionUI.packet(),share:graph=>visionUI.share(graph),
    open:()=>{stopPicker();panel.hidden=true;scheduleOutline();},close:()=>{panel.hidden=false;tab("vision");clampPanel();scheduleOutline();}});
  shortcutsUI=SP?.mount({shadow,on,status,recordingKey:()=>state.recording,capturing:()=>!!state.captureController,
    enterSettings:()=>{if(state.captureController)finishCapture("settings");state.recording=false;$("#record-key").textContent="录入按键";},
    actions:{edit:()=>setEditing(!state.editing),point:()=>startPicker("point"),box:()=>startPicker("rectangle"),lasso:()=>startPicker("lasso"),
      panel:()=>{if(!panel.hidden)dismissInspector(false,true);else{workflowUI?.hide();stopPicker();panel.hidden=false;clampPanel();scheduleOutline();}},
      preview:()=>{if(state.preview)undo();else if(hasTarget())applyPreview();else status("请先选择修改范围。",true);},
      capture:()=>{if(state.captureController)finishCapture("shortcut");else if(hasTarget()){tab("capture");startCapture();}else status("请先选择采集范围。",true);},
      nodes:async()=>{if(!hasTarget()){status("请先选择修改范围。",true);return;}workflowUI?.open();if(!workflowUI?.hasChanges())await workflowUI?.addCurrent();}}});
  updateTarget();
})();
