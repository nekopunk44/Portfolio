(()=>{const y=`
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;height:22px;
    border-radius:6px;cursor:default;padding:0}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`,v="portfolio.tweaks";function R(a){const e={...a};typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(e.motion="low"),typeof navigator<"u"&&!String(navigator.language||"").toLowerCase().startsWith("ru")&&(e.lang="en");try{const t=JSON.parse(window.localStorage.getItem(v)||"{}");for(const o of Object.keys(a))o in t&&(e[o]=t[o])}catch{}return e}function N(a){const[e,t]=React.useState(()=>R(a)),o=React.useCallback((n,i)=>{t(d=>{const c={...d,[n]:i};try{window.localStorage.setItem(v,JSON.stringify(c))}catch{}return c});try{window.parent.postMessage({type:"__edit_mode_set_keys",edits:{[n]:i}},"*")}catch{}},[]);return[e,o]}function T({title:a="Tweaks",children:e}){const[t,o]=React.useState(!1),n=React.useRef(null),i=React.useRef({x:16,y:16}),d=16,c=React.useCallback(()=>{const r=n.current;if(!r)return;const l=r.offsetWidth,p=r.offsetHeight,s=Math.max(d,window.innerWidth-l-d),u=Math.max(d,window.innerHeight-p-d);i.current={x:Math.min(s,Math.max(d,i.current.x)),y:Math.min(u,Math.max(d,i.current.y))},r.style.right=i.current.x+"px",r.style.bottom=i.current.y+"px"},[]);React.useEffect(()=>{if(!t)return;if(c(),typeof ResizeObserver>"u")return window.addEventListener("resize",c),()=>window.removeEventListener("resize",c);const r=new ResizeObserver(c);return r.observe(document.documentElement),()=>r.disconnect()},[t,c]),React.useEffect(()=>{const r=l=>{const p=l?.data?.type;p==="__activate_edit_mode"?o(!0):p==="__deactivate_edit_mode"&&o(!1)};return window.addEventListener("message",r),window.parent.postMessage({type:"__edit_mode_available"},"*"),()=>window.removeEventListener("message",r)},[]);const w=()=>{o(!1),window.parent.postMessage({type:"__edit_mode_dismissed"},"*")},k=r=>{const l=n.current;if(!l)return;const p=l.getBoundingClientRect(),s=r.clientX,u=r.clientY,b=window.innerWidth-p.right,g=window.innerHeight-p.bottom,x=m=>{i.current={x:b-(m.clientX-s),y:g-(m.clientY-u)},c()},f=()=>{window.removeEventListener("mousemove",x),window.removeEventListener("mouseup",f)};window.addEventListener("mousemove",x),window.addEventListener("mouseup",f)};return t?React.createElement(React.Fragment,null,React.createElement("style",null,y),React.createElement("div",{ref:n,className:"twk-panel",style:{right:i.current.x,bottom:i.current.y}},React.createElement("div",{className:"twk-hd",onMouseDown:k},React.createElement("b",null,a),React.createElement("button",{className:"twk-x","aria-label":"Close tweaks",onMouseDown:r=>r.stopPropagation(),onClick:w},"\u2715")),React.createElement("div",{className:"twk-body"},e))):null}function _({label:a,children:e}){return React.createElement(React.Fragment,null,React.createElement("div",{className:"twk-sect"},a),e)}function h({label:a,value:e,children:t,inline:o=!1}){return React.createElement("div",{className:o?"twk-row twk-row-h":"twk-row"},React.createElement("div",{className:"twk-lbl"},React.createElement("span",null,a),e!=null&&React.createElement("span",{className:"twk-val"},e)),t)}function E({label:a,value:e,min:t=0,max:o=100,step:n=1,unit:i="",onChange:d}){return React.createElement(h,{label:a,value:`${e}${i}`},React.createElement("input",{type:"range",className:"twk-slider",min:t,max:o,step:n,value:e,onChange:c=>d(Number(c.target.value))}))}function S({label:a,value:e,onChange:t}){return React.createElement("div",{className:"twk-row twk-row-h"},React.createElement("div",{className:"twk-lbl"},React.createElement("span",null,a)),React.createElement("button",{type:"button",className:"twk-toggle","data-on":e?"1":"0",role:"switch","aria-checked":!!e,onClick:()=>t(!e)},React.createElement("i",null)))}function M({label:a,value:e,options:t,onChange:o}){const n=React.useRef(null),[i,d]=React.useState(!1),c=t.map(s=>typeof s=="object"?s:{value:s,label:s}),w=Math.max(0,c.findIndex(s=>s.value===e)),k=c.length,r=React.useRef(e);r.current=e;const l=s=>{const u=n.current.getBoundingClientRect(),b=u.width-4,g=Math.floor((s-u.left-2)/b*k);return c[Math.max(0,Math.min(k-1,g))].value};return React.createElement(h,{label:a},React.createElement("div",{ref:n,role:"radiogroup",onPointerDown:s=>{d(!0);const u=l(s.clientX);u!==r.current&&o(u);const b=x=>{if(!n.current)return;const f=l(x.clientX);f!==r.current&&o(f)},g=()=>{d(!1),window.removeEventListener("pointermove",b),window.removeEventListener("pointerup",g)};window.addEventListener("pointermove",b),window.addEventListener("pointerup",g)},className:i?"twk-seg dragging":"twk-seg"},React.createElement("div",{className:"twk-seg-thumb",style:{left:`calc(2px + ${w} * (100% - 4px) / ${k})`,width:`calc((100% - 4px) / ${k})`}}),c.map(s=>React.createElement("button",{key:s.value,type:"button",role:"radio","aria-checked":s.value===e},s.label))))}function L({label:a,value:e,options:t,onChange:o}){return React.createElement(h,{label:a},React.createElement("select",{className:"twk-field",value:e,onChange:n=>o(n.target.value)},t.map(n=>{const i=typeof n=="object"?n.value:n,d=typeof n=="object"?n.label:n;return React.createElement("option",{key:i,value:i},d)})))}function z({label:a,value:e,placeholder:t,onChange:o}){return React.createElement(h,{label:a},React.createElement("input",{className:"twk-field",type:"text",value:e,placeholder:t,onChange:n=>o(n.target.value)}))}function C({label:a,value:e,min:t,max:o,step:n=1,unit:i="",onChange:d}){const c=r=>t!=null&&r<t?t:o!=null&&r>o?o:r,w=React.useRef({x:0,val:0});return React.createElement("div",{className:"twk-num"},React.createElement("span",{className:"twk-num-lbl",onPointerDown:r=>{r.preventDefault(),w.current={x:r.clientX,val:e};const l=(String(n).split(".")[1]||"").length,p=u=>{const b=u.clientX-w.current.x,g=w.current.val+b*n,x=Math.round(g/n)*n;d(c(Number(x.toFixed(l))))},s=()=>{window.removeEventListener("pointermove",p),window.removeEventListener("pointerup",s)};window.addEventListener("pointermove",p),window.addEventListener("pointerup",s)}},a),React.createElement("input",{type:"number",value:e,min:t,max:o,step:n,onChange:r=>d(c(Number(r.target.value)))}),i&&React.createElement("span",{className:"twk-num-unit"},i))}function D({label:a,value:e,onChange:t}){return React.createElement("div",{className:"twk-row twk-row-h"},React.createElement("div",{className:"twk-lbl"},React.createElement("span",null,a)),React.createElement("input",{type:"color",className:"twk-swatch",value:e,onChange:o=>t(o.target.value)}))}function j({label:a,onClick:e,secondary:t=!1}){return React.createElement("button",{type:"button",className:t?"twk-btn secondary":"twk-btn",onClick:e},a)}Object.assign(window,{useTweaks:N,TweaksPanel:T,TweakSection:_,TweakRow:h,TweakSlider:E,TweakToggle:S,TweakRadio:M,TweakSelect:L,TweakText:z,TweakNumber:C,TweakColor:D,TweakButton:j});})();
