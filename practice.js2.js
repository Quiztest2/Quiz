/* واجهة التدريب (كمي + لفظي). البيانات في practice-data.js. لا تُحفظ النتائج ولا تدخل لوحة الشرف */
const PGROUPS=()=>[{t:'القسم الكمي',i:'📐',d:QSEC},{t:'القسم اللفظي',i:'📝',d:PSEC}];
function practiceHome(){
 const gs=PGROUPS();
 app.innerHTML=`<div class="top"><span class="chip">📚 مركز التدريب</span><button class="g" id="pb">رجوع</button></div>
 <div class="glass"><div class="mu">تدريب مفتوح بتصحيح فوري وشرح لكل سؤال، ولا يؤثر على درجتك الرسمية.</div></div>
 ${gs.map((g,gi)=>{const ks=Object.keys(g.d),tot=ks.reduce((a,k)=>a+g.d[k].length,0);
  return `<div class="glass"><h2>${g.i} ${g.t} <span class="mu">(${tot} سؤال)</span></h2>
  ${ks.map((k,i)=>`<button class="op" data-g="${gi}" data-k="${i}"><i>${i+1}</i><span>${esc(k)} <span class="mu">(${g.d[k].length})</span></span></button>`).join('')}
  <button class="btn" data-g="${gi}" data-k="all" style="margin-top:10px">تدريب مختلط · ${g.t}</button></div>`}).join('')}`;
 $('pb').onclick=home;
 document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{
  const g=gs[+b.dataset.g],ks=Object.keys(g.d);
  if(b.dataset.k==='all')practiceRun(ks.flatMap(k=>g.d[k]),'مختلط · '+g.t);
  else practiceRun(g.d[ks[+b.dataset.k]],ks[+b.dataset.k]);
 });
}
function practiceRun(src,title){
 const qs=shuf(src).map(q=>{const m=q[2].map((x,k)=>({x,r:k===q[3]}));return{c:q[0],t:q[1],e:q[4],o:q[5]?m:shuf(m)}});
 let i=0,score=0;
 const show=()=>{
  if(i>=qs.length){
   app.innerHTML=`<div class="glass"><h2>انتهى التدريب · ${esc(title)}</h2><div class="big">${score}/${qs.length}</div>
   <button class="btn" id="ag">أعد التدريب</button><button class="g" id="pb2" style="width:100%;margin-top:10px">مركز التدريب</button></div>`;
   $('ag').onclick=()=>practiceRun(src,title);$('pb2').onclick=practiceHome;return}
  const q=qs[i];
  app.innerHTML=`<div class="top"><span class="chip">${esc(q.c)} · ${i+1}/${qs.length}</span><button class="g" id="pb">خروج</button></div>
  <div class="glass noselect"><div class="qq" style="white-space:pre-line">${esc(q.t)}</div>
  ${q.o.map((o,k)=>`<button class="op" data-k="${k}"><i>${'أبجد'[k]}</i><span>${esc(o.x)}</span></button>`).join('')}
  <div id="ex"></div></div>`;
  $('pb').onclick=practiceHome;
  document.querySelectorAll('.op').forEach(b=>b.onclick=()=>{
   const ok=q.o[+b.dataset.k].r;if(ok)score++;
   document.querySelectorAll('.op').forEach((x,k)=>{x.style.pointerEvents='none';if(q.o[k].r)x.classList.add('ok');else if(x===b)x.classList.add('no')});
   $('ex').innerHTML=`<div class="mu" style="margin:10px 0"><b>${ok?'إجابة صحيحة ✓':'إجابة خاطئة ✗'}</b> ${esc(q.e||'')}</div><button class="btn" id="nx">${i<qs.length-1?'التالي ←':'النتيجة'}</button>`;
   $('nx').onclick=()=>{i++;show()};
  });
 };
 show();
}
