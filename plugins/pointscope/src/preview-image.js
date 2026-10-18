/* Local image preparation only. */
(() => {
"use strict";
  function viewportGeometry(g,v) {
    const dx=g.space==="document"?v.scrollX:0,dy=g.space==="document"?v.scrollY:0;
    return {...g,x:g.x-dx,y:g.y-dy,...(g.points?{points:g.points.map(p=>({x:p.x-dx,y:p.y-dy}))}:{})};
  }
  async function prepare(dataURL,geometry,viewport,actions=[],doc=document) {
    if(!/^data:image\/(png|jpeg|webp);base64,/.test(dataURL)||dataURL.length>18_000_000)throw Error("请提供小于 12MB 的 PNG / JPEG / WebP 视口截图。");
    const image=new Image();image.src=dataURL;
    try{await image.decode();}catch{throw Error("截图无法解码，请重新截取。");}
    const v=viewport,g=viewportGeometry(geometry,v),r=g.kind==="point"?g.radius:0;
    const originalBounds={x:g.x-r,y:g.y-r,width:r?r*2:g.width,height:r?r*2:g.height};
    const bounds={x:Math.max(0,originalBounds.x),y:Math.max(0,originalBounds.y)};bounds.width=Math.min(v.width,originalBounds.x+originalBounds.width)-bounds.x;bounds.height=Math.min(v.height,originalBounds.y+originalBounds.height)-bounds.y;
    const clipped=Math.abs(bounds.x-originalBounds.x)>.5||Math.abs(bounds.y-originalBounds.y)>.5||Math.abs(bounds.width-originalBounds.width)>.5||Math.abs(bounds.height-originalBounds.height)>.5;
    if(Math.abs(image.naturalWidth/image.naturalHeight-v.width/v.height)/(v.width/v.height)>.025)throw Error("截图宽高比与当前视口不符；请导入当前视口截图，勿使用整页长图。");
    if(!(bounds.width>0&&bounds.height>0))throw Error("选区不在当前可见视口内，请滚动到选区或重新圈选。");
    const scale=Math.min(2,1400/Math.max(bounds.width,bounds.height)),canvas=doc.createElement("canvas");
    canvas.width=Math.max(1,Math.ceil(bounds.width*scale));canvas.height=Math.max(1,Math.ceil(bounds.height*scale));
    const ctx=canvas.getContext("2d");ctx.fillStyle="#eef2f1";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.scale(scale,scale);ctx.translate(-bounds.x,-bounds.y);
    const region=()=>{ctx.beginPath();if(g.kind==="polygon"){g.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}else if(g.kind==="point")ctx.arc(g.x,g.y,r,0,Math.PI*2);else ctx.rect(g.x,g.y,g.width,g.height);};
    region();ctx.save();ctx.clip("evenodd");
    ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,v.width,v.height);
    let redactions=0;
    for(const el of doc.querySelectorAll("input,textarea,select,[contenteditable]:not([contenteditable=false]),[data-pointscope-private],iframe")) {
      if(el.closest("[data-pointscope-owned]"))continue;
      const rect=el.getBoundingClientRect();
      if(rect.width<=0||rect.height<=0||rect.right<bounds.x||rect.left>bounds.x+bounds.width||rect.bottom<bounds.y||rect.top>bounds.y+bounds.height)continue;
      ctx.fillStyle="#d6dfe0";ctx.fillRect(rect.x-3,rect.y-3,rect.width+6,rect.height+6);redactions++;
    }
    const project=p=>({x:geometry.space==="viewport"?p.x:p.pageX-v.scrollX,y:geometry.space==="viewport"?p.y:p.pageY-v.scrollY});
    for(const action of actions.slice(-100)) {
      if(!action.start)continue;
      ctx.strokeStyle=action.tool==="eraser"?"#b75a65":"#087f70";ctx.fillStyle=ctx.strokeStyle;ctx.lineCap="round";ctx.lineJoin="round";
      if(action.path?.length) {
        for(let i=1;i<action.path.length;i++) {const a=project(action.path[i-1]),b=project(action.path[i]);ctx.lineWidth=action.kind==="stroke"?2+6*(action.path[i].pressure??.5):3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }else{const p=project(action.start);ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.stroke();}
    }
    ctx.restore();region();ctx.strokeStyle="#087f70";ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.stroke();
    const imageURL=canvas.toDataURL("image/png");image.src="";
    if(imageURL.length>12_000_000)throw Error("图像过大，请缩小选区后重试。");
    return {image:imageURL,descriptor:{mimeType:"image/png",width:canvas.width,height:canvas.height,bounds,originalBounds,clipped,viewport:{...v},scale,redactedRegions:redactions,outsideRegion:"masked",source:"user-requested viewport screenshot"}};
  }
globalThis.PointScopeVision={prepare,viewportGeometry};
})();
