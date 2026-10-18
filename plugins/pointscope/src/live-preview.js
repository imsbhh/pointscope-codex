/* A local, inert DOM rendering. No remote service or page script is run. */
(() => {
  "use strict";
  const OMIT=new Set(["SCRIPT","STYLE","LINK","META","BASE","NOSCRIPT","TEMPLATE","OBJECT","EMBED","SOURCE","TRACK"]);
  const PRIVATE="input,textarea,select,[contenteditable]:not([contenteditable=false]),[data-pointscope-private],iframe";
  const dataImage=/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  const svgNamespace="http://www.w3.org/2000/svg";
  const definitions=new Set(["defs","symbol","clipPath","mask","pattern","linearGradient","radialGradient","filter","marker"]);
  function localReferences(value){return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_match,_quote,url)=>{if(url.startsWith("#"))return `url(${url})`;try{const target=new URL(url,document.baseURI),page=new URL(document.URL);if(target.origin===page.origin&&target.pathname===page.pathname&&target.search===page.search&&target.hash)return `url(${target.hash})`;}catch{}return "none";});}
  const props=["display","position","top","right","bottom","left","z-index","float","clear","box-sizing","width","height","min-width","min-height","max-width","max-height","margin-top","margin-right","margin-bottom","margin-left","padding-top","padding-right","padding-bottom","padding-left","border-top","border-right","border-bottom","border-left","border-radius","border-collapse","border-spacing","outline","box-shadow","overflow","overflow-x","overflow-y","opacity","visibility","background-color","background-image","background-size","background-position","background-repeat","background-clip","color","font-family","font-size","font-weight","font-style","font-variant","line-height","letter-spacing","word-spacing","text-align","text-decoration","text-transform","text-indent","text-shadow","white-space","word-break","overflow-wrap","vertical-align","list-style-type","list-style-position","flex","flex-direction","flex-wrap","flex-grow","flex-shrink","flex-basis","align-items","align-self","align-content","justify-content","gap","row-gap","column-gap","grid-template-columns","grid-template-rows","grid-column","grid-row","grid-auto-flow","order","transform","transform-origin","translate","rotate","scale","clip-path","object-fit","object-position","aspect-ratio","fill","stroke","stroke-width"];
  function styleFor(el) {
    const s=getComputedStyle(el);let css="";
    for(const p of props){let v=s.getPropertyValue(p);if(!v)continue;if(p==="background-image"&&/url\(/i.test(v))v="none";if(p==="position"&&v==="sticky")v="relative";css+=`${p}:${v};`;}
    for(const p of ["mask","mask-type","clip-rule","fill-rule","fill-opacity","stroke-opacity","stroke-linejoin","stroke-linecap","stroke-dasharray","stroke-dashoffset","vector-effect","stop-color","stop-opacity","flood-color","flood-opacity","color-interpolation-filters","filter","paint-order","transform-box"]){const v=s.getPropertyValue(p);if(v)css+=`${p}:${v};`;}
    return localReferences(css)+"animation:none!important;transition:none!important;caret-color:transparent;";
  }
  async function renderDOM(geometry,viewport,actions=[]) {
    const V=globalThis.PointScopeVision,doc=document;let count=0,omitted=0;
    function clone(node,inDefinition=false) {
      if(node.nodeType===3)return doc.createTextNode(node.nodeValue);
      if(node.nodeType!==1||OMIT.has(node.tagName)||node.hasAttribute("data-pointscope-owned"))return null;
      const rect=node.getBoundingClientRect(),s=getComputedStyle(node),svg=node.namespaceURI===svgNamespace,definition=svg&&(inDefinition||definitions.has(node.localName));
      if(!definition&&(s.display==="none"||s.visibility==="hidden"))return null;
      if(!svg&&![doc.documentElement,doc.body].includes(node)&&(rect.bottom<0||rect.right<0||rect.top>viewport.height||rect.left>viewport.width)&&![...node.querySelectorAll("*")].some(child=>{const r=child.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.right>0&&r.top<viewport.height&&r.left<viewport.width;})){
        const spacer=doc.createElement("div");spacer.style.cssText=styleFor(node)+"visibility:hidden!important;";return spacer;
      }
      if(++count>2200)throw Error("可见页面内容较复杂。");
      if(node.matches(PRIVATE)){
        const masked=doc.createElement("div");masked.style.cssText=styleFor(node)+"background:#d6dfe0!important;color:transparent!important;";masked.textContent="";return masked;
      }
      let el;
      if(["IMG","CANVAS","VIDEO"].includes(node.tagName)) {
        el=doc.createElement("img");let src="";
        try{
          if(node.tagName==="IMG"&&dataImage.test(node.currentSrc||node.src))src=node.currentSrc||node.src;
          else {const c=doc.createElement("canvas");c.width=Math.max(1,Math.min(1800,node.naturalWidth||node.videoWidth||node.width||rect.width));c.height=Math.max(1,Math.min(1800,node.naturalHeight||node.videoHeight||node.height||rect.height));c.getContext("2d").drawImage(node,0,0,c.width,c.height);src=c.toDataURL("image/png");}
        }catch{omitted++;}
        if(src)el.setAttribute("src",src);else{el=doc.createElement("div");el.textContent=node.tagName==="VIDEO"?"视频区域":"图像区域";el.style.background="#d6dfe0";}
      }else if(svg) {
        el=doc.createElementNS(node.namespaceURI,node.localName);
        for(const a of node.attributes){if(/^on/i.test(a.localName)||["style","src"].includes(a.localName))continue;
          if(a.localName==="href"){let href=a.value;try{const target=new URL(href,doc.baseURI),page=new URL(doc.URL);if(target.origin===page.origin&&target.pathname===page.pathname&&target.search===page.search&&target.hash)href=target.hash;}catch{}if(!href.startsWith("#")&&!dataImage.test(href)){omitted++;continue;}el.setAttributeNS(a.namespaceURI,a.name,href);}
          else el.setAttributeNS(a.namespaceURI,a.name,localReferences(a.value));
        }
      }else el=doc.createElement(["A","BUTTON","FORM"].includes(node.tagName)?"div":node.localName.includes("-")?"div":node.localName);
      el.setAttribute("style",styleFor(node)+(el.style.background?`background:${el.style.background};`:""));
      if(s.position==="fixed"){
        el.style.position="absolute";el.style.left=`${rect.x+viewport.scrollX}px`;el.style.top=`${rect.y+viewport.scrollY}px`;el.style.right="auto";el.style.bottom="auto";
      }
      if(!["IMG","CANVAS","VIDEO"].includes(node.tagName)){
        for(const child of node.childNodes){const c=clone(child,definition);if(c)el.append(c);}
        for(const pseudo of ["::before","::after"]){const p=getComputedStyle(node,pseudo),content=p.content;if(content&&content!=="none"&&content!=="normal"&&/^['"]/.test(content)){const span=doc.createElement("span");span.textContent=content.slice(1,-1);span.style.cssText=`display:${p.display};color:${p.color};background:${p.backgroundColor};font:${p.font};`;pseudo==="::before"?el.prepend(span):el.append(span);}}
      }
      return el;
    }
    const root=clone(doc.documentElement);
    root.setAttribute("xmlns","http://www.w3.org/1999/xhtml");root.style.margin="0";root.style.width=`${viewport.width}px`;root.style.height="auto";
    const scale=Math.min(1,1600/Math.max(viewport.width,viewport.height));
    const markup=new XMLSerializer().serializeToString(root);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(viewport.width*scale)}" height="${Math.ceil(viewport.height*scale)}" viewBox="0 0 ${viewport.width} ${viewport.height}"><rect width="100%" height="100%" fill="${getComputedStyle(doc.body).backgroundColor||"white"}"/><foreignObject x="${-viewport.scrollX}" y="${-viewport.scrollY}" width="${viewport.width}" height="${Math.max(doc.documentElement.scrollHeight,viewport.height)}">${markup}</foreignObject></svg>`;
    const image=new Image();image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
    try{await image.decode();}catch{throw Error("此页面无法生成本地动态预览，请使用原生截图。");}
    const canvas=doc.createElement("canvas");canvas.width=Math.ceil(viewport.width*scale);canvas.height=Math.ceil(viewport.height*scale);const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0);
    const g=V.viewportGeometry(geometry,viewport),radius=g.radius||0,x=Math.max(0,Math.floor((g.x-radius)*scale)),y=Math.max(0,Math.floor((g.y-radius)*scale)),w=Math.min(canvas.width-x,Math.ceil((g.width||radius*2)*scale)),h=Math.min(canvas.height-y,Math.ceil((g.height||radius*2)*scale));
    if(w>0&&h>0){const pixels=ctx.getImageData(x,y,w,h).data,first=pixels.slice(0,4);let varied=false;for(let i=0;i<pixels.length;i+=4)if(first.some((v,k)=>Math.abs(v-pixels[i+k])>8)){varied=true;break;}
      if(!varied&&[...doc.body.querySelectorAll("*")].some(el=>{if(el.closest("[data-pointscope-owned],"+PRIVATE))return false;return [...el.childNodes].some(n=>{if(n.nodeType!==3||!n.textContent.trim())return false;const range=doc.createRange();range.selectNodeContents(n);return [...range.getClientRects()].some(r=>r.width>0&&r.height>0&&r.right>g.x-radius&&r.bottom>g.y-radius&&r.left<g.x+(g.width||radius)&&r.top<g.y+(g.height||radius));});}))throw Error("浏览器没有绘制选区文字。");
    }
    let source;try{source=canvas.toDataURL("image/png");}catch{throw Error("此页面限制了本地渲染，请使用原生截图。");}
    const prepared=await V.prepare(source,geometry,viewport,actions);
    prepared.descriptor.source="local live DOM preview";prepared.descriptor.omittedMedia=omitted;
    return prepared;
  }
  async function simplified(geometry,viewport,actions,reason){
    const doc=document,g=PointScopeVision.viewportGeometry(geometry,viewport),radius=g.radius||0,b={x:g.x-radius,y:g.y-radius,width:g.width||radius*2,height:g.height||radius*2};
    const visible=r=>r.width>0&&r.height>0&&r.right>b.x&&r.bottom>b.y&&r.left<b.x+b.width&&r.top<b.y+b.height;
    const scale=Math.min(1,1600/Math.max(viewport.width,viewport.height)),canvas=doc.createElement("canvas");canvas.width=Math.ceil(viewport.width*scale);canvas.height=Math.ceil(viewport.height*scale);const ctx=canvas.getContext("2d");ctx.scale(scale,scale);ctx.fillStyle=getComputedStyle(doc.documentElement).backgroundColor;ctx.fillRect(0,0,viewport.width,viewport.height);
    let elements=0,characters=0,omitted=0;
    function paint(el,alpha=1){
      if(elements++>5000||OMIT.has(el.tagName)||el.closest("[data-pointscope-owned]"))return;
      const s=getComputedStyle(el);if(s.display==="none"||s.visibility==="hidden")return;
      const r=el.getBoundingClientRect();ctx.save();ctx.globalAlpha=alpha*(Number(s.opacity)||0);ctx.fillStyle=s.backgroundColor;if(visible(r))ctx.fillRect(r.x,r.y,r.width,r.height);
      if(el.matches(PRIVATE)){if(visible(r)){ctx.fillStyle="#d6dfe0";ctx.fillRect(r.x,r.y,r.width,r.height);}ctx.restore();return;}
      if(el.namespaceURI===svgNamespace&&el.localName==="svg"&&visible(r))throw Error("此页 SVG 无法完成本地渲染，请导入当前视口截图校对；未生成空白替代图。");
      if(["IMG","CANVAS","VIDEO"].includes(el.tagName)){
        if(visible(r))try{const probe=doc.createElement("canvas");probe.width=Math.max(1,Math.ceil(r.width));probe.height=Math.max(1,Math.ceil(r.height));probe.getContext("2d").drawImage(el,0,0,probe.width,probe.height);probe.toDataURL();ctx.drawImage(probe,r.x,r.y,r.width,r.height);}catch{omitted++;ctx.fillStyle="#d6dfe0";ctx.fillRect(r.x,r.y,r.width,r.height);}
      }else for(const node of el.childNodes){
        if(node.nodeType===1){paint(node,ctx.globalAlpha);continue;}
        if(node.nodeType!==3||!node.textContent.trim()||characters>=8000)continue;
        const range=doc.createRange();range.selectNodeContents(node);if(![...range.getClientRects()].some(visible))continue;
        ctx.font=`${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;ctx.fillStyle=s.color;ctx.textBaseline="top";let offset=0;
        for(const ch of node.textContent){if(characters++>=8000)break;range.setStart(node,offset);offset+=ch.length;range.setEnd(node,offset);const rr=range.getBoundingClientRect();if(visible(rr)&&ch.trim())ctx.fillText(ch,rr.x,rr.y+Math.max(0,(rr.height-parseFloat(s.fontSize))/2));}
      }
      ctx.restore();
    }
    paint(doc.body);const prepared=await PointScopeVision.prepare(canvas.toDataURL("image/png"),geometry,viewport,actions);prepared.descriptor.source="local simplified DOM preview";prepared.descriptor.fallback=true;prepared.descriptor.fallbackReason=reason;prepared.descriptor.omittedMedia=omitted;return prepared;
  }
  async function render(geometry,viewport,actions=[]){try{return await renderDOM(geometry,viewport,actions);}catch(error){return simplified(geometry,viewport,actions,error.message);}}
  globalThis.PointScopeLive={render};
})();
