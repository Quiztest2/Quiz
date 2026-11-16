/* =====================================================================
   محرك تقارير PDF — منصة عيون للقدرات
   - ينشئ ملف PDF حقيقياً (A4) ويحفظه مباشرة، بدون نافذة الطباعة
   - تقسيم ذكي للصفحات: لا تُقطع البطاقات، ولا يُفصل العنوان عن محتواه
   - الجداول الطويلة تعيد رأسها تلقائياً في كل صفحة
   - ترقيم الصفحات وتذييل ثابت في كل صفحة
   - يُعرض داخل iframe معزول، فلا تتأثر تقاريرك بتنسيقات الموقع
   - إن تعذر تحميل المكتبات يعود تلقائياً إلى الطباعة القديمة (لا يتوقف شيء)
   ===================================================================== */
(function(){
'use strict';

const SRC=[
 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];
const W=703;          /* عرض الصفحة بالبكسل = 210mm - الهوامش */
const LIM=950;        /* أقصى ارتفاع لمحتوى الصفحة الواحدة بالبكسل (بدون التذييل) */
const MAXC=2000;      /* أقصى ارتفاع للصورة لكل صفحة PDF (بدقة 2×) */
const FOOTER='<div class="pf">منصة عيون للقدرات · مدرسة ثانوية العيون - مسارات</div>';

const CSS=`
@page{size:A4;margin:10mm}
html,body{margin:0;padding:0;background:#fff}
.pdfr tr,.pdfr .bx,.pdfr .lv{break-inside:avoid}
.pdfr h2,.pdfr h1{break-after:avoid}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body.pdfr{width:${W}px;direction:rtl;font-family:Cairo,Tahoma,"Segoe UI",sans-serif;color:#1d1a14;font-size:13px;line-height:1.7;padding:0;margin:0}
.pdfr a{color:inherit;text-decoration:none}
.pdfr .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #b8860b;padding-bottom:8px;margin:0 0 14px}
.pdfr .hd b{display:block;font-size:20px;color:#8a6508;line-height:1.4}
.pdfr .hd span{display:block;font-size:11.5px;color:#555}
.pdfr h1{font-size:22px;color:#6b4506;margin:6px 0 4px;line-height:1.4;font-weight:800}
.pdfr h2{font-size:15px;color:#8a6508;margin:16px 0 8px;padding-right:9px;border-right:4px solid #b8860b;line-height:1.5;font-weight:800}
.pdfr b{color:inherit;font-weight:800}
.pdfr p{margin:4px 0}
.pdfr .mu{color:#5b5548;font-size:12px;line-height:1.6}
.pdfr .sm{color:#555;font-size:11.5px}
.pdfr .kp{display:flex;gap:8px;margin:8px 0}
.pdfr .kp>div{flex:1;border:1px solid #e3d5a8;background:#fbf6e6;border-radius:10px;padding:8px 6px;text-align:center}
.pdfr .kp b{display:block;font-size:19px;color:#6b4506;line-height:1.4}
.pdfr .kp span{display:block;font-size:11px;color:#555;line-height:1.4}
.pdfr .bx{border:1px solid #e3d5a8;border-radius:10px;padding:8px 12px;margin:8px 0;background:#fffdf7}
.pdfr .hi{background:#eaf6ec;border-color:#9fd3a8}
.pdfr .lo{background:#fdecec;border-color:#e3a3a3}
.pdfr .md{background:#fffaf0}
.pdfr .bar,.pdfr .bar2{height:8px;background:#ececec;border-radius:5px;overflow:hidden;margin:4px 0}
.pdfr .bar i,.pdfr .bar2 i{display:block;height:100%;background:#b8860b}
.pdfr .bar i{background:#c0392b}
.pdfr ul{margin:3px 0;padding-right:20px}
.pdfr li{margin:2px 0}
.pdfr .ch{display:inline-block;border:1px solid;border-radius:99px;padding:1px 10px;margin:3px 0 3px 6px;font-size:12px;font-weight:800;background:#fff}
.pdfr .lv{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed #e3d5a8;font-size:12.5px}
.pdfr table{width:100%;border-collapse:collapse;margin:6px 0;font-size:12px}
.pdfr th{background:#6b4506;color:#fff;font-weight:800}
.pdfr th,.pdfr td{border:1px solid #d9c98f;padding:5px 6px;text-align:center;line-height:1.5}
.pdfr tr:nth-child(even) td{background:#fbf7ea}
.pdfr td.n{text-align:right}
.pdfr tr{break-inside:avoid}
.pdfr .ft,.pdfr .pf{margin-top:12px;font-size:10px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:4px;max-width:none;padding-bottom:0}
`;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const withT=(p,ms)=>Promise.race([p,sleep(ms).then(()=>{throw new Error('timeout')})]);

/* ---------- تحميل المكتبات مرة واحدة ---------- */
function loadScript(src){
  return new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=src;s.async=true;
    s.onload=()=>res();
    s.onerror=()=>rej(new Error('تعذر تحميل '+src));
    document.head.appendChild(s);
  });
}
let libsP=null;
function loadLibs(){
  if(window.html2canvas&&window.jspdf)return Promise.resolve();
  if(!libsP){
    libsP=(async()=>{for(const s of SRC)await loadScript(s)})().catch(e=>{libsP=null;throw e});
  }
  return libsP;
}

/* ---------- إطار معزول لعرض التقرير ---------- */
function makeFrame(){
  const f=document.createElement('iframe');
  f.setAttribute('aria-hidden','true');
  f.tabIndex=-1;
  f.style.cssText='position:fixed;left:0;top:0;width:'+W+'px;height:1200px;border:0;background:#fff;opacity:.01;pointer-events:none;z-index:2147483000';
  document.body.appendChild(f);
  const d=f.contentDocument;
  d.open();
  d.write('<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap">'+
    '<style>'+CSS+'</style></head><body class="pdfr"></body></html>');
  d.close();
  return f;
}
async function waitFrame(f){
  const d=f.contentDocument,link=d.querySelector('link');
  await Promise.race([new Promise(r=>{if(!link)return r();link.onload=link.onerror=r}),sleep(4000)]);
  try{await Promise.race([d.fonts.ready,sleep(2500)])}catch(e){}
  await sleep(40);
}

/* ---------- تفكيك التقرير إلى كتل قابلة للتقسيم ---------- */
function flatten(root){
  const out=[];
  const walk=el=>{[...el.children].forEach(c=>{
    if(c.classList.contains('pg')){out.push({brk:true});walk(c);return}
    if(c.tagName==='DIV'&&!c.className){walk(c);return}           /* حاوية بلا تنسيق */
    if(c.tagName==='TABLE'){
      const rows=[...c.rows];
      if(rows.length>2){
        out.push({html:c.outerHTML,units:rows.slice(1).map(r=>r.outerHTML),
          open:c.cloneNode(false).outerHTML.replace(/<\/table>$/,'')+'<tbody>',pre:rows[0].outerHTML,close:'</tbody></table>',tbl:true});
      }else out.push({html:c.outerHTML});
      return;
    }
    if(c.classList.contains('bx')&&c.children.length>1){
      out.push({html:c.outerHTML,units:[...c.children].map(x=>x.outerHTML),open:'<div class="'+c.className+'">',pre:'',close:'</div>'});
      return;
    }
    out.push({html:c.outerHTML,head:c.tagName==='H1'||c.tagName==='H2'});
  })};
  walk(root);
  return out;
}

/* ---------- قياس ارتفاع كل كتلة ---------- */
function measureAll(f,items){
  const d=f.contentDocument,body=d.body;
  body.innerHTML=items.filter(i=>!i.brk).map(i=>i.html).join('');
  const kids=[...body.children];
  let k=0;
  items.forEach(it=>{
    if(it.brk)return;
    const el=kids[k++],cs=d.defaultView.getComputedStyle(el);
    it.h=el.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0)+4;
  });
  items.forEach(it=>{
    if(!it.units)return;
    body.innerHTML=it.open+it.pre+it.units.join('')+it.close;
    const kids=it.tbl?[...body.querySelectorAll('tr')].slice(1):[...body.firstElementChild.children];
    it.uh=kids.map(x=>{const cs=d.defaultView.getComputedStyle(x);return x.getBoundingClientRect().height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0)});
    it.pad=Math.max(0,it.h-it.uh.reduce((a,b)=>a+b,0));
  });
}

/* ---------- تقسيم الكتل على الصفحات ---------- */
function pack(items){
  const pages=[];let cur=[],h=0;
  const flush=()=>{if(cur.length)pages.push(cur);cur=[];h=0};
  for(let i=0;i<items.length;i++){
    const it=items[i];
    /* فاصل القسم يبدأ صفحة جديدة فقط إذا كانت الصفحة الحالية ممتلئة 60٪ على الأقل */
    if(it.brk){if(h>LIM*0.6)flush();continue}
    if(it.units){
      let units=it.units.slice(),uh=it.uh.slice();
      const wrap=arr=>it.open+it.pre+arr.join('')+it.close;
      while(units.length){
        const total=it.pad+uh.reduce((a,b)=>a+b,0);
        if(h+total<=LIM){cur.push({html:wrap(units)});h+=total;break}
        let n=0,acc=it.pad;
        while(n<units.length&&h+acc+uh[n]<=LIM){acc+=uh[n];n++}
        if(n===0){if(cur.length){flush();continue}n=1;acc=it.pad+uh[0]}
        cur.push({html:wrap(units.slice(0,n))});h+=acc;flush();
        units=units.slice(n);uh=uh.slice(n);
      }
      continue;
    }
    /* العنوان يسبق أول جزء من الجدول/البطاقة، ولا يُترك وحيداً في آخر الصفحة */
    if(it.head&&items[i+1]&&items[i+1].units){
      const nx=items[i+1];
      if(cur.length&&h+it.h+nx.pad+(nx.uh[0]||0)>LIM)flush();
      cur.push({html:it.html});h+=it.h;
      continue;
    }
    const grp=[it];
    /* العنوان لا يُترك وحيداً في آخر الصفحة */
    if(it.head&&items[i+1]&&!items[i+1].brk){grp.push(items[i+1]);i++}
    const gh=grp.reduce((s,g)=>s+g.h,0);
    if(cur.length&&h+gh>LIM)flush();
    cur.push(...grp);h+=gh;
  }
  flush();
  return pages.map(p=>p.map(x=>x.html));
}

/* ---------- كشف الصفحة الفارغة: يفحص المساحة فوق التذييل فقط ---------- */
function isBlank(cv){
  const tw=120,th=Math.max(1,Math.round(cv.height*tw/cv.width));
  const c=document.createElement('canvas');c.width=tw;c.height=th;
  const g=c.getContext('2d');g.drawImage(cv,0,0,tw,th);
  const cut=Math.max(1,Math.round(th*0.09));     /* تجاهل التذييل في أسفل الصفحة */
  const d=g.getImageData(0,0,tw,th-cut).data;
  for(let i=0;i<d.length;i+=4){if(d[i]<235||d[i+1]<235||d[i+2]<235)return false}
  return true;
}

/* ---------- رسم الصفحات وتجميعها في PDF ---------- */
async function render(f,pages,setT){
  const d=f.contentDocument,body=d.body;
  const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
  let first=true,rendered=0;
  for(let p=0;p<pages.length;p++){
    setT('⏳ جارٍ رسم الصفحة '+(p+1)+' من '+pages.length+'…');
    body.innerHTML=pages[p].join('')+FOOTER;
    await sleep(60);
    const hgt=Math.max(1,Math.ceil(body.getBoundingClientRect().height));   /* ارتفاع المحتوى الفعلي فقط */
    f.style.height=Math.max(hgt,300)+'px';
    const cv=await window.html2canvas(body,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,width:W,height:hgt,windowWidth:W,windowHeight:hgt});
    if(isBlank(cv))continue;          /* صفحة فارغة: لا تُضاف للملف */
    rendered++;
    for(let y=0;y<cv.height;y+=MAXC){
      const sh=Math.min(MAXC,cv.height-y),c=document.createElement('canvas');
      c.width=cv.width;c.height=sh;
      c.getContext('2d').drawImage(cv,0,y,cv.width,sh,0,0,cv.width,sh);
      if(!first)pdf.addPage();
      first=false;
      const mmH=sh/cv.width*190;
      pdf.addImage(c.toDataURL('image/jpeg',0.92),'JPEG',10,10,190,mmH);
    }
  }
  if(!rendered)throw new Error('كل الصفحات فارغة');
  /* ترقيم الصفحات: أرقام لاتينية لتجنّب مشاكل خطوط PDF الافتراضية */
  const n=pdf.internal.getNumberOfPages();
  pdf.setFontSize(8);pdf.setTextColor(120);
  for(let i=1;i<=n;i++){pdf.setPage(i);pdf.text(i+' / '+n,105,291,{align:'center'})}
  return pdf;
}

/* ---------- الواجهة العامة ----------
   make(html, fileName, button) ← تُرجع true عند النجاح، false عند التعذّر (فيعود الموقع للطباعة) */
async function make(html,fn,btn){
  const old=btn?btn.textContent:'';
  const setT=t=>{if(btn)btn.textContent=t};
  if(btn)btn.disabled=true;
  let f=null;
  try{
    setT('⏳ جارٍ تجهيز ملف PDF…');
    await withT(loadLibs(),15000);
    const tmp=document.createElement('div');
    tmp.innerHTML=html;
    const items=flatten(tmp);
    if(!items.length)return false;
    f=makeFrame();
    await waitFrame(f);
    measureAll(f,items);
    const pages=pack(items);
    const pdf=await render(f,pages,setT);
    pdf.setProperties({title:String(fn).replace(/\.pdf$/i,''),creator:'منصة عيون للقدرات'});
    pdf.save(fn);
    return true;
  }catch(e){
    console.warn('PDF engine fallback:',e);
    return false;
  }finally{
    if(f)f.remove();
    if(btn){btn.disabled=false;btn.textContent=old}
  }
}

/* ---------- طباعة التقرير مباشرة من المتصفح (نفس التنسيق) ---------- */
async function print(html,title){
  let f=null;
  try{
    f=makeFrame();
    f.style.height='1200px';
    await waitFrame(f);
    const tmp=document.createElement('div');tmp.innerHTML=html;
    f.contentDocument.body.innerHTML=tmp.innerHTML+FOOTER;
    f.contentDocument.title=title||'';
    await sleep(120);
    f.contentWindow.focus();
    f.contentWindow.print();
    return true;
  }catch(e){
    console.warn('print failed:',e);
    alert('تعذر فتح نافذة الطباعة. جرّب من متصفح آخر.');
    return false;
  }finally{
    setTimeout(()=>{if(f)f.remove()},120000);
  }
}

window.PDFR={make,print};
})();
