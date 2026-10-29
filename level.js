/* مستوى الطالب (نقاط + مستويات + أيام متتالية + شارات) والقائمة الجانبية */
const LV=[['مبتدئ','🌱',0],['متدرّب','📘',150],['متقدّم','🚀',400],['متمكّن','🎯',800],['محترف','🏅',1400],['خبير','💎',2200],['أسطورة','👑',3500]];
const faN=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const Prog={
 key(){return 'qprog:'+((typeof uid!=='undefined'&&uid)||'guest')},
 get(){try{const d=JSON.parse(localStorage.getItem(this.key())||'null');if(d&&typeof d.xp==='number')return Object.assign({runs:0,ans:{},day:'',streak:0},d)}catch(e){}return{xp:0,runs:0,ans:{},day:'',streak:0}},
 save(d){try{localStorage.setItem(this.key(),JSON.stringify(d))}catch(e){}},
 level(xp){let i=0;LV.forEach((l,k)=>{if(xp>=l[2])i=k});const c=LV[i],n=LV[i+1];return{i,name:c[0],icon:c[1],next:n?n[2]:null,nextName:n?n[0]:'',pct:n?Math.round((xp-c[2])/(n[2]-c[2])*100):100}},
 touch(d){const t=today();if(d.day===t)return;const y=new Date();y.setDate(y.getDate()-1);d.streak=d.day===y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate()?d.streak+1:1;d.day=t},
 record(cat,ok){const d=this.get(),a=d.ans[cat]||[0,0];a[1]++;if(ok)a[0]++;d.ans[cat]=a;d.xp+=ok?10:3;this.touch(d);this.save(d)},
 finish(score,total,xp0){const d=this.get(),bonus=total&&score/total>=.8?25:0;d.xp+=bonus;d.runs++;this.touch(d);this.save(d);this.sync();return{gain:d.xp-xp0,bonus,L0:this.level(xp0),L1:this.level(d.xp)}},
 async sync(){try{const u=firebase.auth().currentUser;if(!u||u.isAnonymous||!db)return;const ref=db.doc('progress/'+u.uid),r=await ref.get(),l=this.get();if(r.exists&&(r.data().xp||0)>l.xp)this.save(Object.assign({},l,r.data()));else await ref.set(l)}catch(e){}},
 reset(){try{localStorage.removeItem(this.key())}catch(e){}}
};
const allCats=()=>[...Object.keys(QSEC).map(k=>({k,g:'كمي'})),...Object.keys(PSEC).map(k=>({k,g:'لفظي'}))];
const srcOf=k=>QSEC[k]||PSEC[k];
const mast=p=>p===null?['لم تبدأ','var(--mu)']:p>=80?['ممتاز','var(--ok)']:p>=60?['جيد','var(--wr)']:['يحتاج تدريب','var(--er)'];
function levelCard(){
 const d=Prog.get(),L=Prog.level(d.xp);
 return `<div class="glass lvc"><div class="lvh"><div class="lvi">${L.icon}</div><div><div class="mu">مستواك</div><b class="lvn">${L.name}</b></div><div class="lvs">${d.streak?'🔥 '+faN(d.streak)+' يوم':''}</div></div>
 <div class="bar2"><i style="width:${L.pct}%"></i></div>
 <div class="top" style="margin:8px 0 0"><span class="mu">${faN(d.xp)} نقطة${L.next?' · باقي '+faN(L.next-d.xp)+' للوصول إلى '+L.nextName:' · وصلت لأعلى مستوى'}</span><button class="g" id="lvBtn">تفاصيل</button></div></div>`;
}
function levelBind(){const b=document.getElementById('lvBtn');if(b)b.onclick=levelPage}
async function levelPage(){
 await Prog.sync();
 const d=Prog.get(),L=Prog.level(d.xp),cs=allCats(),rows=cs.map(c=>{const v=d.ans[c.k]||[0,0];return Object.assign({},c,{v,p:v[1]?Math.round(v[0]/v[1]*100):null})});
 const tot=rows.reduce((a,r)=>[a[0]+r.v[0],a[1]+r.v[1]],[0,0]),acc=tot[1]?Math.round(tot[0]/tot[1]*100):0;
 const weak=rows.filter(r=>r.v[1]>=3).sort((a,b)=>a.p-b.p)[0]||rows.find(r=>!r.v[1]);
 const bd=[['🌟','أول تدريب',d.runs>=1],['📈','٥٠ سؤالاً',tot[1]>=50],['🔥','٣ أيام متتالية',d.streak>=3],['🎯','دقة ٩٠٪ فأكثر',tot[1]>=20&&acc>=90],['🧭','جرّبت كل الأنواع',rows.every(r=>r.v[1]>0)]];
 const grp=g=>`<h2 style="margin-top:14px">${g==='كمي'?'📐 الكمي':'📝 اللفظي'}</h2>`+rows.filter(r=>r.g===g).map(r=>{const m=mast(r.p);return `<div class="top" style="margin:8px 0 2px"><span>${esc(r.k)}</span><span style="color:${m[1]};font-weight:700">${r.p===null?m[0]:faN(r.p)+'٪ · '+m[0]}</span></div><div class="bar2"><i style="width:${r.p||0}%;background:${m[1]}"></i></div>`}).join('');
 app.innerHTML=`<div class="top"><span class="chip">🏆 مستواي</span><button class="g" id="lb0">رجوع</button></div>
 <div class="glass" style="text-align:center"><div class="big" style="margin:0">${L.icon}</div><h1 style="margin:.1em 0">${L.name}</h1>
 <div class="bar2"><i style="width:${L.pct}%"></i></div><div class="mu" style="margin-top:8px">${faN(d.xp)} نقطة${L.next?' · باقي '+faN(L.next-d.xp)+' للوصول إلى '+L.nextName:' · أعلى مستوى'}</div></div>
 <div class="glass"><div class="kp"><div><b>${faN(tot[1])}</b><span class="mu">سؤال أجبته</span></div><div><b>${faN(acc)}٪</b><span class="mu">الدقة العامة</span></div><div><b>${faN(d.runs)}</b><span class="mu">محاولة تدريب</span></div><div><b>${faN(d.streak)}</b><span class="mu">يوم متتالٍ</span></div></div></div>
 <div class="glass"><h2>الشارات</h2><div class="bdg">${bd.map(b=>`<span class="${b[2]?'on':''}">${b[0]} ${b[1]}</span>`).join('')}</div></div>
 <div class="glass"><h2>مستواك في كل نوع</h2>${grp('كمي')}${grp('لفظي')}
 ${weak?`<button class="btn" id="wk" style="margin-top:16px">${weak.v[1]?'ركّز على: ':'ابدأ بـ: '}${esc(weak.k)} ←</button>`:''}</div>
 <div class="glass"><h2>سلّم المستويات</h2>${LV.map((l,i)=>`<div class="lvl${i===L.i?' cur':''}${i<L.i?' done':''}"><span>${l[1]} ${l[0]}</span><span class="mu">${faN(l[2])} نقطة</span></div>`).join('')}</div>
 <button class="g" id="rs0" style="width:100%">مسح تقدّمي على هذا الجهاز</button>`;
 document.getElementById('lb0').onclick=home;
 const w=document.getElementById('wk');if(w)w.onclick=()=>practiceRun(srcOf(weak.k),weak.k);
 document.getElementById('rs0').onclick=()=>{if(confirm('تأكيد مسح النقاط والتقدم من هذا الجهاز؟')){Prog.reset();levelPage()}};
}
/* القائمة الجانبية */
(function(){
 const btn=document.getElementById('menuBtn'),ov=document.getElementById('ovl'),dr=document.getElementById('drawer');
 if(!btn||!dr)return;
 const close=()=>{dr.classList.remove('on');ov.classList.remove('on');btn.setAttribute('aria-expanded','false')};
 const render=()=>{
  const cu=firebase.auth().currentUser,logged=!!cu&&!cu.isAnonymous,L=Prog.level(Prog.get().xp);
  const I=[['🏠','الرئيسية',()=>home()],['📚','مركز التدريب',()=>practiceHome()],['🏆','مستواي',()=>levelPage()],['🥇','لوحة الشرف',()=>{home();setTimeout(()=>{const e=document.getElementById('lb');if(e)e.scrollIntoView({behavior:'smooth'})},500)}]];
  if(logged)I.push(['🚪','تسجيل الخروج',()=>studentLogout()]);else I.push(['🔑','تسجيل الدخول',()=>studentAuthPage('login')],['✨','إنشاء حساب',()=>studentAuthPage('register')]);
  I.push(['🔐','استعادة كلمة المرور',()=>resetPage(home,'')],['🔒','لوحة المالك',()=>adminGate()]);
  dr.innerHTML=`<div class="dh"><div class="dn">${logged?'<span dir="ltr">'+esc(cu.email||'')+'</span>':'زائر'}</div><div class="mu">${L.icon} ${L.name}</div></div>`+I.map((x,i)=>`<button class="mi" data-i="${i}"><span>${x[0]}</span>${x[1]}</button>`).join('')+`<div class="mu dft">مدرسة ثانوية العيون - مسارات</div>`;
  dr.querySelectorAll('.mi').forEach(b=>b.onclick=()=>{close();I[+b.dataset.i][2]()});
 };
 const open=()=>{render();dr.classList.add('on');ov.classList.add('on');btn.setAttribute('aria-expanded','true');const f=dr.querySelector('.mi');if(f)f.focus()};
 btn.onclick=()=>dr.classList.contains('on')?close():open();
 ov.onclick=close;
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 setInterval(()=>{const ex=typeof S!=='undefined'&&!!S;btn.hidden=ex;if(ex)close()},300);
})();
