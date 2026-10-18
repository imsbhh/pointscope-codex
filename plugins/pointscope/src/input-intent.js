/* Explicit, page-local interaction evidence. No text input, clipboard or network. */
(() => {
  "use strict";
  const names = {click: "点击", doubleClick: "双击", longPress: "长按", drag: "拖动", stroke: "笔迹", wheel: "滚轮", shortcut: "快捷键", key: "控制键", cancel: "手势取消"};
  const penTools = {tip: "笔尖", barrel: "侧键", eraser: "橡皮端"};
  function actionLabel(action) {
    const p = value => `(${value.x}, ${value.y})`;
    const device = action.device === "touch" ? "触屏" : action.device === "pen" ? `触控笔${penTools[action.pen?.tool || action.tool] || ""}` : "鼠标";
    if (action.kind === "stroke") return `${device}${action.tool === "eraser" ? "擦除演示" : "笔迹"} ${p(action.start)} → ${p(action.end)}，${action.path.length} 个采样点${action.pen?.pressure ? `，压力 ${action.pen.pressure.min}–${action.pen.pressure.max}（浏览器值）` : ""}`;
    if (action.kind === "drag") return `${device}拖动 ${p(action.start)} → ${p(action.end)}，偏移 ${action.delta.x}, ${action.delta.y}px`;
    if (action.kind === "wheel") return `${action.modifiers.ctrl || action.modifiers.meta ? "Ctrl / Meta + " : ""}滚轮：${Math.abs(action.delta.y) >= Math.abs(action.delta.x) ? (action.delta.y > 0 ? "向下" : "向上") : (action.delta.x > 0 ? "向右" : "向左")} ${Math.max(Math.abs(action.delta.x), Math.abs(action.delta.y))}px（${action.samples} 次输入合并）`;
    if (action.kind === "key" || action.kind === "shortcut") return `${names[action.kind]} ${action.chord}`;
    return `${names[action.kind] || action.kind}${action.start ? " " + p(action.start) : ""}${action.kind === "longPress" ? `，${action.durationMs}ms` : ""}`;
  }
  function summarize(actions) {
    const proposals = [], counts = {};
    for (const a of actions) counts[a.kind] = (counts[a.kind] || 0) + 1;
    const strokes = actions.filter(a => a.kind === "stroke" && a.tool !== "eraser"), erasures = actions.filter(a => a.kind === "stroke" && a.tool === "eraser");
    if (strokes.length) proposals.push({type: "drawing", title: "画笔笔迹", evidence: `观察到 ${strokes.length} 段自由笔迹，保留路径和可用的触控笔参数。`, text: "可能希望在选定范围内支持自由绘制、圈注或手写。请确认笔迹是用于说明修改位置，还是希望页面实现绘画功能；还需说明颜色、笔宽、保存方式及是否响应压力。轨迹不进行文字识别，也不能唯一确定意图。"});
    if (erasures.length) proposals.push({type: "erasing", title: "橡皮端操作", evidence: `观察到 ${erasures.length} 段橡皮端轨迹。`, text: "可能希望橡皮端擦除笔迹。请确认擦除对象、范围和撤销方式；本次只记录擦除演示路径，没有删除网页内容或先前的证据轨迹。"});
    const drags = actions.filter(a => a.kind === "drag");
    if (drags.length) {
      const a = drags[0];
      proposals.push({type: "drag", title: "拖拽操作", evidence: `观察到 ${drags.length} 次拖动，首次偏移 ${a.delta.x}, ${a.delta.y}px。`, text: `可能希望在选定范围内支持拖拽操作；演示了从 (${a.start.x}, ${a.start.y}) 到 (${a.end.x}, ${a.end.y}) 的移动。请确认拖动应移动目标、框选范围、调整尺寸，还是绘制轨迹。`});
    }
    if (actions.some(a => a.kind === "wheel" && (a.modifiers.ctrl || a.modifiers.meta))) proposals.push({type: "zoom", title: "缩放操作", evidence: "观察到 Ctrl / Meta 与滚轮的组合。", text: "可能希望使用 Ctrl / Meta + 滚轮缩放选定区域的内容；缩放中心、方向和边界需要确认。"});
    if (actions.some(a => a.kind === "wheel" && !a.modifiers.ctrl && !a.modifiers.meta)) proposals.push({type: "scroll", title: "滚轮操作", evidence: "观察到普通滚轮输入。", text: "可能希望选定区域响应滚轮，进行滚动、平移或切换；具体响应方式需要确认。"});
    if (counts.doubleClick) proposals.push({type: "doubleClick", title: "双击操作", evidence: `观察到 ${counts.doubleClick} 次双击。`, text: "可能希望双击目标触发快捷操作或进入编辑；触发后的结果需要确认。"});
    if (counts.click) proposals.push({type: "click", title: "点击操作", evidence: `观察到 ${counts.click} 次点击。`, text: "可能希望点击目标触发操作、选择目标或切换状态；点击后的结果需要确认。"});
    if (counts.longPress) proposals.push({type: "longPress", title: "长按操作", evidence: `观察到 ${counts.longPress} 次长按。`, text: "可能希望长按目标唤出更多操作或进入拖拽；具体行为需要确认。"});
    const keys = [...new Set(actions.filter(a => a.kind === "key" || a.kind === "shortcut").map(a => a.chord))];
    if (keys.length) proposals.push({type: "keyboard", title: "键盘操作", evidence: `观察到 ${keys.join("、")}。`, text: `可能希望选定范围响应 ${keys.join("、")}；需要指定每个按键对应的动作，并避开输入框编辑。`});
    const observation = actions.length ? `共 ${actions.length} 个动作：${Object.entries(counts).map(([key, count]) => `${names[key] || key} ${count} 次`).join("，")}。` : "未采集到可用动作；普通文字按键和输入框按键不会记录。";
    return {observation, proposals, draft: proposals.map(p => p.text).join("\n"), limitation: "操作只能提供证据，不能唯一确定使用者希望的结果；以下说明是本地规则整理的候选意图，需要使用者校对确认。"};
  }
  function record(options = {}) {
    const doc = options.document || document, win = doc.defaultView;
    const maxActions = Math.min(100, Math.max(1, options.maxActions || 100));
    const maxDuration = Math.min(60000, Math.max(100, options.maxDurationMs || 60000));
    const pointerMode = ["auto", "draw", "drag"].includes(options.pointerMode) ? options.pointerMode : "auto";
    const started = performance.now(), startedAt = new Date().toISOString(), actions = [], cleanups = [];
    let active = true, pointer = null, wheel = null, wheelTimer = null, limitTimer = null;
    const round = n => Math.round(n * 100) / 100;
    const now = () => Math.max(0, Math.round(performance.now() - started));
    const modifiers = e => ({ctrl: !!e.ctrlKey, alt: !!e.altKey, shift: !!e.shiftKey, meta: !!e.metaKey});
    const sensor = (value, min, max) => Number.isFinite(value) ? round(Math.min(max, Math.max(min, value))) : null;
    const tool = e => e.button === 5 || (e.buttons & 32) ? "eraser" : e.button === 2 || (e.buttons & 2) ? "barrel" : "tip";
    const point = (e, pen = e.pointerType === "pen") => ({x: round(e.clientX), y: round(e.clientY), pageX: round(e.clientX + win.scrollX), pageY: round(e.clientY + win.scrollY), ...(pen ? {pressure: sensor(e.pressure, 0, 1), tangentialPressure: sensor(e.tangentialPressure, -1, 1), tiltX: sensor(e.tiltX, -90, 90), tiltY: sensor(e.tiltY, -90, 90), twist: sensor(e.twist, 0, 359), buttons: e.buttons & 63} : {})});
    const timedPoint = (e, p) => ({...point(e, p.device === "pen"), tMs: round(Math.max(0, Math.min(now() - p.atMs, e.timeStamp - started - p.atMs)))});
    function trackPen(p, e, sample) {
      if (p.device !== "pen") return;
      p.tools.add(tool(e)); p.buttonStates.add(e.buttons & 63);
      // Exclude lift/hover pressure from contact statistics. A constant browser
      // default (often 0.5) is never presented as proof of pressure hardware.
      if (e.buttons && sample.pressure !== null) {
        p.pressure.count++; p.pressure.sum += sample.pressure;
        p.pressure.min = Math.min(p.pressure.min, sample.pressure); p.pressure.max = Math.max(p.pressure.max, sample.pressure);
      }
    }
    function penEvidence(p) {
      if (p.device !== "pen") return null;
      const stats = p.pressure;
      return {tool: p.tool, toolsUsed: [...p.tools], buttonStates: [...p.buttonStates], pressure: stats.count ? {min: stats.min, max: stats.max, mean: round(stats.sum / stats.count), variationObserved: stats.max - stats.min > .01} : null, source: "browser-pointer-events; sensor availability is not inferred from default values"};
    }
    function moveSample(p, e) {
      const sample = timedPoint(e, p), previous = p.end;
      p.end = sample; p.distance += Math.hypot(sample.pageX - previous.pageX, sample.pageY - previous.pageY);
      trackPen(p, e, sample);
      const last = p.path.at(-1), elapsed = sample.tMs - (last.tMs || 0);
      const changed = Math.hypot(sample.pageX - last.pageX, sample.pageY - last.pageY) >= .4 || (sample.pressure !== undefined && Math.abs(sample.pressure - last.pressure) >= .02);
      if (p.drawing ? changed || elapsed >= 8 : elapsed >= 50) {
        // Thin the whole path rather than keeping only its first second.
        const limit = p.drawing ? 239 : 23;
        if (p.path.length >= limit) p.path = p.path.filter((_, i) => i % 2 === 0);
        p.path.push(sample);
      }
    }
    const own = e => options.ignore?.(e) || false;
    const editable = e => (e.composedPath?.() || [e.target]).some(el => el?.matches?.("input,textarea,select,[contenteditable]:not([contenteditable='false'])") || el?.isContentEditable);
    const protectedField = e => (e.composedPath?.() || [e.target]).some(el => el?.matches?.("input[type=password], [data-pointscope-private]"));
    const trusted = e => e.isTrusted || options.allowUntrusted === true;
    const allowed = e => trusted(e) && !own(e) && !protectedField(e) && (!options.contains || options.contains(e));
    const target = e => {
      const info = options.describeTarget?.(e.target) || {};
      // Only these explicit fields may leave the recorder; never serialize nodes.
      return {tag: String(info.tag || e.target?.localName || "document").slice(0, 40), selector: String(info.selector || "").slice(0, 500)};
    };
    const suppress = e => {
      if (!options.suppressDefault) return;
      if (e.cancelable) e.preventDefault();
      e.stopImmediatePropagation();
    };
    // Visual feedback uses the same filtered evidence; no idle cursor tracking.
    const visual = () => {
      if (!options.onVisual) return;
      const recent = actions.slice(-20);
      options.onVisual({offset: actions.length - recent.length, actions: recent, wheel: wheel ? {...wheel, delta: {...wheel.delta}} : null, pointer: pointer ? {kind: pointer.drawing ? "stroke" : "drag", device: pointer.device, tool: pointer.tool, start: pointer.start, end: pointer.end, path: [...pointer.path, pointer.end]} : null});
    };
    const emit = () => {options.onUpdate?.({count: actions.length + (wheel ? 1 : 0), elapsedMs: now()}); visual();};
    function add(action) {
      if (!active) return;
      actions.push(action); emit();
      if (actions.length >= maxActions) stop("action-limit");
    }
    function flushWheel() {
      if (wheelTimer) clearTimeout(wheelTimer); wheelTimer = null;
      if (!wheel) return;
      const action = wheel; wheel = null;
      action.delta.x = round(action.delta.x); action.delta.y = round(action.delta.y);
      add(action);
    }
    function listen(el, type, fn, settings = {capture: true, passive: false}) {
      el.addEventListener(type, fn, settings); cleanups.push(() => el.removeEventListener(type, fn, settings));
    }
    if (options.suppressDefault) {
      // touch-action must be set before contact. Limit this to the caller's
      // explicit DOM scope; arbitrary coordinate regions cannot express it.
      [...new Set(options.touchActionTargets || [])].forEach(el => {
        if (!el?.style) return;
        const hadStyle = el.hasAttribute("style"), value = el.style.getPropertyValue("touch-action"), priority = el.style.getPropertyPriority("touch-action");
        el.style.setProperty("touch-action", "none", "important");
        cleanups.push(() => {
          if (el.style.getPropertyValue("touch-action") !== "none" || el.style.getPropertyPriority("touch-action") !== "important") return;
          if (value) el.style.setProperty("touch-action", value, priority); else el.style.removeProperty("touch-action");
          if (!hadStyle && !el.style.length) el.removeAttribute("style");
        });
      });
    }
    function stop(reason = "user") {
      if (!active) return null;
      // Stop before finalizing, so the final wheel cannot reenter the limit path.
      active = false;
      if (wheel) {wheel.delta.x = round(wheel.delta.x); wheel.delta.y = round(wheel.delta.y); if (actions.length < maxActions) actions.push(wheel); wheel = null;}
      if (wheelTimer) clearTimeout(wheelTimer); if (limitTimer) clearTimeout(limitTimer);
      cleanups.forEach(fn => fn()); pointer = null;
      // The limit may be reached on pointerup, before the native click follows.
      // Keep that final demonstration click from activating the underlying page.
      if (reason === "action-limit" && options.suppressDefault) {
        const guard = e => {if (allowed(e)) suppress(e);};
        doc.addEventListener("click", guard, true);
        setTimeout(() => doc.removeEventListener("click", guard, true), 0);
      }
      const result = {schemaVersion: "1.1", startedAt, stoppedAt: new Date().toISOString(), durationMs: now(), stopReason: reason, mode: options.suppressDefault ? "demonstrate" : "observe", pointerMode, coordinateUnit: "CSS px", viewport: options.viewport || {width: win.innerWidth, height: win.innerHeight, scrollX: win.scrollX, scrollY: win.scrollY}, actions: actions.slice(0, maxActions)};
      options.onStop?.(result); return result;
    }
    listen(doc, "pointerdown", e => {
      if (!active || !allowed(e)) return;
      flushWheel();
      if (!active) return;
      // One gesture at a time; do not infer multi-touch or retain a second pointer.
      if (pointer && pointer.id !== e.pointerId) return;
      const device = ["mouse", "pen", "touch"].includes(e.pointerType) ? e.pointerType : "mouse", penTool = tool(e);
      const drawing = pointerMode !== "drag" && (pointerMode === "draw" || device === "pen") && (device === "pen" ? penTool !== "barrel" : e.button === 0);
      pointer = {id: e.pointerId, start: {...point(e), tMs: 0}, end: point(e), atMs: now(), device, button: e.button, modifiers: modifiers(e), target: target(e), path: [], drawing, distance: 0, tool: device === "pen" ? penTool : "tip", tools: new Set(), buttonStates: new Set(), pressure: {count: 0, sum: 0, min: Infinity, max: -Infinity}};
      pointer.end = pointer.start; pointer.path.push(pointer.start); trackPen(pointer, e, pointer.start);
      visual(); suppress(e);
    });
    listen(doc, "pointermove", e => {
      if (!active || !trusted(e) || !pointer || pointer.id !== e.pointerId || own(e) || protectedField(e)) return;
      let samples = [];
      if (pointer.drawing) {try {samples = e.getCoalescedEvents?.() || [];} catch {}}
      // Trust the parent first; never treat redispatched coalesced events as
      // user input. Predicted points are not operation evidence.
      (samples.length ? samples.slice(-512) : [e]).forEach(sample => {
        if (sample.pointerId === pointer.id && trusted(sample)) moveSample(pointer, sample);
      });
      visual(); suppress(e);
    });
    const finishPointer = (e, cancelled = false) => {
      if (!active || !trusted(e) || !pointer || pointer.id !== e.pointerId) return;
      if (own(e) || protectedField(e)) {pointer = null; visual(); return;}
      const p = pointer; pointer = null;
      const end = timedPoint(e, p), dx = round(end.pageX - p.start.pageX), dy = round(end.pageY - p.start.pageY), durationMs = now() - p.atMs;
      trackPen(p, e, end);
      const kind = cancelled ? "cancel" : p.drawing ? "stroke" : Math.hypot(dx, dy) >= 6 || p.distance >= 6 ? "drag" : durationMs >= 600 ? "longPress" : "click";
      const action = {kind, atMs: p.atMs, durationMs, device: p.device, button: p.button, modifiers: p.modifiers, target: p.target, start: p.start, end};
      if (kind === "drag" || kind === "stroke" || (cancelled && p.drawing)) {action.delta = {x: dx, y: dy}; action.path = [...p.path, end].slice(0, p.drawing ? 240 : 24);}
      if (p.drawing) {action.tool = p.tool; if (cancelled) action.cancelledKind = "stroke";}
      if (p.device === "pen") action.pen = penEvidence(p);
      add(action); suppress(e);
    };
    listen(doc, "pointerup", e => finishPointer(e));
    listen(doc, "pointercancel", e => finishPointer(e, true));
    listen(doc, "lostpointercapture", e => finishPointer(e, true));
    listen(doc, "click", e => {if (active && allowed(e)) suppress(e);});
    listen(doc, "contextmenu", e => {if (active && allowed(e)) suppress(e);});
    listen(doc, "dblclick", e => {
      if (!active || !allowed(e)) return;
      const last = actions.at(-1), previous = actions.at(-2);
      if (last?.kind === "click" && previous?.kind === "click" && last.atMs - previous.atMs < 600 && Math.hypot(last.start.x - previous.start.x, last.start.y - previous.start.y) <= 8 && last.button === previous.button) {
        actions.splice(-2, 2, {...previous, kind: "doubleClick", durationMs: last.atMs + last.durationMs - previous.atMs}); emit();
      }
      suppress(e);
    });
    listen(doc, "wheel", e => {
      if (!active || !allowed(e)) return;
      const mods = modifiers(e), info = target(e), atMs = now();
      if (wheel && (wheel.sourceDeltaMode !== e.deltaMode || JSON.stringify(wheel.modifiers) !== JSON.stringify(mods) || wheel.target.selector !== info.selector || atMs - wheel.lastAtMs > 250)) flushWheel();
      if (!active) return;
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? win.innerHeight : 1;
      if (!wheel) wheel = {kind: "wheel", atMs, lastAtMs: atMs, durationMs: 0, device: "wheel-or-trackpad", modifiers: mods, target: info, start: point(e), delta: {x: 0, y: 0}, sourceDeltaMode: e.deltaMode, normalization: "pixel:1,line:16,page:viewport-height; input amount, not observed scrolling", samples: 0};
      wheel.delta.x += e.deltaX * scale; wheel.delta.y += e.deltaY * scale; wheel.samples++; wheel.lastAtMs = atMs; wheel.durationMs = atMs - wheel.atMs;
      if (wheelTimer) clearTimeout(wheelTimer); wheelTimer = setTimeout(flushWheel, 250);
      emit(); suppress(e);
    });
    listen(doc, "keydown", e => {
      if (!active || !trusted(e)) return;
      if (e.key === "Escape") {e.preventDefault(); e.stopImmediatePropagation(); stop("escape"); return;}
      if (own(e)) return;
      if (!allowed(e) || editable(e) || e.repeat || e.isComposing) return;
      const controls = new Set(["Enter", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", " "]);
      const combo = (e.ctrlKey || e.metaKey) && /^[a-z0-9+\-=]$/i.test(e.key);
      // Plain printable characters and modifier-only events are never recorded.
      if (!controls.has(e.key) && !combo) return;
      flushWheel(); if (!active) return;
      const mods = modifiers(e), key = e.key === " " ? "Space" : e.key;
      const chord = [...Object.entries(mods).filter(([,v]) => v).map(([key]) => ({ctrl:"Ctrl",alt:"Alt",shift:"Shift",meta:"Meta"}[key])),key].join("+");
      add({kind: combo ? "shortcut" : "key", atMs: now(), device: "keyboard", key, chord, modifiers: mods, target: target(e)}); suppress(e);
    });
    listen(doc, "visibilitychange", () => {if (doc.hidden) stop("hidden");}, true);
    listen(win, "blur", e => {if (e.target === win && trusted(e)) stop("blur");}, true);
    listen(win, "pagehide", () => stop("pagehide"), true);
    limitTimer = setTimeout(() => stop("timeout"), maxDuration);
    emit();
    return {stop, get active() {return active;}, get elapsedMs() {return now();}};
  }
  const api = {names, actionLabel, summarize, record};
  globalThis.PointScopeInput = api;
  if (typeof module !== "undefined") module.exports = api;
})();
