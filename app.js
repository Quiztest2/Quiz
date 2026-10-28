const app=document.getElementById('app');
const PER=25,QMS=60000,SMS=25*60000;
const SEC=[{t:'q',n:'القسم الكمي'},{t:'v',n:'القسم اللفظي'}];
let CW=null,db=null,user=null,uid=null,canAdmin=false,bank=[],S=null,tm=null,subs=[];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
function downloadFile(name,data,type='application/octet-stream'){const blob=data instanceof Blob?data:new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}

async function loadBank(){const s=await db.collection('bank').get();bank=[];s.docs.forEach(d=>bank.push(...((d.data()||{}).items||[])))}

/* ---------- مولّد أسئلة لا يتكرر (بذرة عشوائية لكل سؤال) ---------- */
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const RI=(r,a,b)=>a+Math.floor(r()*(b-a+1)),PK=(r,a)=>a[Math.floor(r()*a.length)],SH=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=n=>String(+(+n).toFixed(2)),gcd=(a,b)=>b?gcd(b,a%b):a,fr=(a,b)=>{const g=gcd(a,b);return a/g+'/'+b/g};
const nb=(c,r)=>[c+RI(r,1,3),c-RI(r,1,3),c+RI(r,4,9),c*2,c+10,c-10,c+RI(r,11,19)].filter(x=>x>0&&x!==c).map(fmt);
const tf=m=>{m=(m%720+720)%720;return(Math.floor(m/60)||12)+':'+String(m%60).padStart(2,'0')};
const ANT=[['حار','بارد'],['طويل','قصير'],['غني','فقير'],['سريع','بطيء'],['واسع','ضيق'],['قوي','ضعيف'],['صادق','كاذب'],['شجاع','جبان'],['كريم','بخيل'],['سعيد','حزين'],['قديم','حديث'],['ثقيل','خفيف'],['عميق','سطحي'],['نشيط','كسول'],['مضيء','مظلم'],['ممتلئ','فارغ'],['سهل','صعب'],['قريب','بعيد'],['نظيف','قذر'],['رخيص','غالٍ'],['مرتفع','منخفض'],['ناعم','خشن'],['صاعد','هابط'],['ظاهر','خفي'],['يقظ','غافل'],['مطيع','عاصٍ'],['متواضع','متكبر'],['وفير','شحيح']];
const TOOL=[['طبيب','سماعة'],['نجار','منشار'],['كاتب','قلم'],['خياط','إبرة'],['رسام','فرشاة'],['حداد','مطرقة'],['مزارع','محراث'],['فلكي','تلسكوب']];
const PART=[['عجلة','سيارة'],['صفحة','كتاب'],['غصن','شجرة'],['نافذة','بيت'],['ريشة','طائر'],['إصبع','يد'],['شاشة','حاسوب'],['سطر','فقرة']];
const CAT=[['تفاح','موز','عنب','برتقال','رمان','خوخ'],['سيارة','قطار','طائرة','سفينة','حافلة','دراجة'],['المريخ','زحل','الزهرة','عطارد','المشتري','نبتون'],['قلب','كبد','رئة','كلية','معدة','طحال'],['الرياض','جدة','الدمام','أبها','تبوك','حائل'],['أحمر','أزرق','أخضر','أصفر','بنفسجي','برتقالي'],['خباز','نجار','طبيب','مهندس','معلم','حداد'],['مطرقة','منشار','مفك','كماشة','مفتاح'],['قلم','دفتر','مسطرة','ممحاة','مبراة'],['صقر','نسر','عصفور','حمامة','بومة','غراب'],['أسد','نمر','ذئب','فهد','دب','ثعلب'],['مصر','عمان','قطر','الأردن','الكويت','اليمن'],['بحر','نهر','بحيرة','محيط','جدول','شلال'],['شتاء','صيف','ربيع','خريف']];
const SV=b=>`<svg viewBox="0 0 300 190" role="img"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc94" stop-opacity=".45"/><stop offset="1" stop-color="#c8962b" stop-opacity=".1"/></linearGradient></defs>${b}</svg>`,TX=(x,y,s,c='')=>`<text class="t ${c}" x="${+x.toFixed(1)}" y="${+y.toFixed(1)}">${s}</text>`,PG=p=>`<polygon class="s" points="${p.map(q=>q.map(v=>+v.toFixed(1)).join(',')).join(' ')}"/>${p.map(q=>`<circle class="v" cx="${+q[0].toFixed(1)}" cy="${+q[1].toFixed(1)}" r="3.6"/>`).join('')}`;
const SENT=[['الصدق منجاة و... مهلكة','الكذب',['الأمانة','العدل','الكرم']],['القناعة كنز ...','لا يفنى',['لا يُرى','لا يُباع','يُسرق']],['الوقت كالسيف إن لم تقطعه ...','قطعك',['نفعك','رافقك','سبقك']],['السيارة تحتاج إلى ... لتسير','وقود',['ظلال','أوراق','ثلج']],['يحتاج الطالب إلى ... كي ينجح','الاجتهاد',['الكسل','الغياب','التأجيل']],['لا يُعرف الصديق إلا عند ...','الشدة',['الفرح','النوم','الطعام']],['العلم نور و... ظلام','الجهل',['الفهم','الحفظ','الذكاء']],['الطبيب يعالج المريض والمعلم ... الطالب','يعلّم',['يداوي','يزرع','يبني']],['إذا ... الحرّ لبس الناس الملابس الخفيفة','اشتدّ',['انعدم','برد','سقط']],['الحاجة أم ...','الاختراع',['الكسل','النوم','الإسراف']],['من ... في الصيف لم يجد ما يأكله في الشتاء','كسل',['زرع','جدّ','اجتهد']],['القلم أداة الكتابة و... أداة القص','المقص',['الكتاب','الدفتر','الحبر']]];
const PLC=[['طبيب','مستشفى'],['معلم','مدرسة'],['خباز','مخبز'],['قاضٍ','محكمة'],['مزارع','مزرعة'],['بحار','سفينة']];
const SYN=[['كبير','ضخم'],['صغير','ضئيل'],['سريع','عاجل'],['جميل','بديع'],['حزين','كئيب'],['شجاع','باسل'],['غضب','سخط'],['ذكي','فطن'],['كريم','سخي'],['تعب','إعياء'],['بعيد','قاصٍ'],['هادئ','ساكن'],['يتأمل','يتمعّن'],['مهم','جوهري'],['ماهر','بارع'],['عظيم','جليل'],['بيّن','واضح'],['غاية','هدف'],['خوف','رهبة'],['سرور','حبور'],['عدو','خصم'],['كثير','وفير'],['ينصح','يرشد'],['دهاء','مكر']];
const MEAN=[['الأناة','التمهل وعدم العجلة'],['الإسراف','تجاوز الحد في الإنفاق'],['الشح','البخل الشديد'],['الوجل','الخوف'],['التفاني','بذل أقصى الجهد في العمل'],['الاستقراء','تتبع الجزئيات للوصول إلى حكم عام'],['الفصاحة','وضوح الكلام وسلامته'],['القناعة','الرضا بما قُسم'],['الهجير','شدة حر الظهيرة'],['الغيث','المطر النافع'],['الحصافة','جودة الرأي'],['الوهن','الضعف'],['السخاء','الجود والكرم'],['المراء','الجدال'],['الإيجاز','قلة اللفظ مع وفاء المعنى'],['التؤدة','الرفق والتأني'],['الجلد','الصبر وقوة التحمل'],['الاستنباط','استخراج الحكم من الدليل'],['الطلاقة','سهولة الكلام وانسيابه']];
const PLU=[['كتاب','كتب'],['قلم','أقلام'],['رجل','رجال'],['باب','أبواب'],['مدينة','مدن'],['شجرة','أشجار'],['طفل','أطفال'],['بحر','بحار'],['نهر','أنهار'],['جبل','جبال'],['ورقة','أوراق'],['بيت','بيوت'],['قلب','قلوب'],['عين','عيون'],['وزير','وزراء'],['طالب','طلاب'],['سؤال','أسئلة'],['جواب','أجوبة'],['صديق','أصدقاء'],['ملك','ملوك'],['نجم','نجوم'],['ثوب','ثياب'],['سيف','سيوف'],['رسالة','رسائل']];
const KQ=['حساب','حساب','حساب','حساب','إحصاء','جبر','هندسة','حساب','جبر','جبر','حساب','إحصاء','جبر','حساب','مقارنة','هندسة','هندسة','هندسة','هندسة','هندسة','هندسة','إحصاء','إحصاء','حساب','جبر','حساب','حساب','هندسة','هندسة'];
const KV=['التناظر اللفظي','المضادة','الكلمة الشاذة','المرادفات','معاني المفردات','الجمع','إكمال الجملة','المفرد'];
const ORDQ=['حساب','جبر','هندسة','إحصاء','مقارنة','متنوع'],ORDV=['التناظر اللفظي','المرادفات','المضادة','معاني المفردات','الجمع','المفرد','الكلمة الشاذة','إكمال الجملة','متنوع'];
const pol=(c,a,R)=>[c[0]+R*Math.cos(a*Math.PI/180),c[1]-R*Math.sin(a*Math.PI/180)];
const arc=(c,R,a0,a1)=>{const p=pol(c,a0,R),q=pol(c,a1,R);return`<path class="ar" d="M${p[0].toFixed(1)},${p[1].toFixed(1)} A${R},${R} 0 0 0 ${q[0].toFixed(1)},${q[1].toFixed(1)}"/>`};
const GEN={q:[
r=>{const p=PK(r,[10,15,20,25,30,40,60,75]),y=RI(r,2,30)*20,c=p*y/100;return{q:`ما قيمة ${p}% من ${y}؟`,c:fmt(c),w:nb(c,r)}},
r=>{const P=RI(r,4,40)*50,d=PK(r,[10,20,25,30,40]),c=P*(100-d)/100;return{q:`سلعة سعرها ${P} ريال خُصم منها ${d}%، فما سعرها بعد الخصم؟`,c:fmt(c),w:nb(c,r)}},
r=>{const a=RI(r,1,5),b=RI(r,a+1,8),k=RI(r,2,12),c=b*k;return{q:`قُسّم مبلغ ${(a+b)*k} ريالًا بين شخصين بنسبة ${a}:${b}، فكم نصيب الأكبر؟`,c:fmt(c),w:nb(c,r)}},
r=>{const v=PK(r,[40,45,50,60,70,80,90,120]),t=RI(r,2,7);return r()<.5?{q:`تسير سيارة بسرعة ${v} كم/ساعة، فكم كيلومترًا تقطع في ${t} ساعات؟`,c:fmt(v*t),w:nb(v*t,r)}:{q:`قطعت سيارة ${v*t} كم بسرعة ${v} كم/ساعة، فكم ساعة استغرقت؟`,c:fmt(t),w:nb(t,r)}},
r=>{const m=RI(r,10,60),n=RI(r,3,6),c=RI(r,5,m+15);return{q:`متوسط ${n} أعداد يساوي ${m}، ومجموع ${n-1} منها ${m*n-c}. فما العدد المتبقي؟`,c:fmt(c),w:nb(c,r)}},
r=>{const x=RI(r,2,15),a=RI(r,2,9),b=RI(r,1,20);return{q:`إذا كان ${a}س + ${b} = ${a*x+b} فما قيمة س؟`,c:fmt(x),w:nb(x,r)}},
r=>{const W=RI(r,3,15),L=W+RI(r,1,10),c=L*W;return{q:`مستطيل محيطه ${2*(L+W)} سم وطوله ${L} سم، فما مساحته بالسنتيمتر المربع؟`,c:fmt(c),w:nb(c,r)}},
r=>{const[a,b,c]=PK(r,[[12,6,4],[10,15,6],[20,30,12],[12,4,3],[30,20,12],[15,10,6],[6,3,2],[60,40,24]]);return{q:`ينجز أحمد عملًا في ${a} أيام وينجزه خالد في ${b} أيام، فكم يومًا يلزمهما إن عملا معًا؟`,c:fmt(c),w:nb(c,r)}},
r=>{const k=RI(r,2,5),s=RI(r,4,20);return{q:`عمر الأب ${k} أمثال عمر ابنه، ومجموع عمريهما ${(k+1)*s} سنة. فكم عمر الابن؟`,c:fmt(s),w:nb(s,r)}},
r=>{const a=RI(r,1,20),d=RI(r,2,9),n=RI(r,6,12),c=a+(n-1)*d;return{q:`في المتتالية: ${a}، ${a+d}، ${a+2*d}، … ما الحد رقم ${n}؟`,c:fmt(c),w:nb(c,r)}},
r=>{const C=RI(r,2,40)*20,p=PK(r,[10,20,25,40,50]),c=C*(100+p)/100;return{q:`اشترى تاجر سلعة بـ ${C} ريالًا وباعها بربح ${p}%، فبكم باعها؟`,c:fmt(c),w:nb(c,r)}},
r=>{const T=PK(r,[5,8,10,12]),R=RI(r,1,T-1),c=fr(R,T);return{q:`كيس فيه ${T} كرات، منها ${R} حمراء والباقي زرقاء. سُحبت كرة عشوائيًا، فما احتمال أن تكون حمراء؟`,c,w:[fr(T-R,T),fr(R+1,T),fr(R,T+1),fr(1,T),fr(R,T+2)]}},
r=>{const n=RI(r,3,15),k=RI(r,1,9),c=n+k;return{q:`إذا كان س² = ${n*n} وكان س > 0، فما قيمة س + ${k}؟`,c:fmt(c),w:nb(c,r)}},
r=>{const S=RI(r,1,11)*60+PK(r,[0,15,30,45]),D=PK(r,[45,70,95,110,135,150]),e=S+D;return{q:`يبدأ اجتماع الساعة ${tf(S)} ويستمر ${D} دقيقة، فمتى ينتهي؟`,c:tf(e),w:[15,-15,30,-10].map(x=>tf(e+x))}},
r=>{const p=PK(r,[10,20,25,50]),y=RI(r,2,20)*20,sw=r()<.3,p2=sw?y:PK(r,[10,20,25,30,50]),y2=sw?p:RI(r,2,20)*20,a=p*y,b=p2*y2;
 return{q:`قارن بين: القيمة الأولى ${p}% من ${y}، والقيمة الثانية ${p2}% من ${y2}`,fix:1,o:['القيمة الأولى أكبر','القيمة الثانية أكبر','القيمتان متساويتان','المعطيات غير كافية'],c:['القيمة الأولى أكبر','القيمة الثانية أكبر','القيمتان متساويتان'][a>b?0:a<b?1:2]}}
,
r=>{const[a,b,c0]=PK(r,[[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25]]),k=RI(r,1,3),A=a*k,B=b*k,C=c0*k,h=Math.max(55,Math.min(130,200*A/B)),f=r()<.4;
 const g=SV(PG([[50,160],[250,160],[50,160-h]])+`<path class="ar" d="M64,160 v-14 h-14"/>`+TX(150,182,f?'س':B,f?'x':'')+TX(26,160-h/2+5,A)+TX(176,160-h/2-8,f?C:'س',f?'':'x'));
 return f?{q:`في المثلث القائم المرسوم (الرسم ليس بمقياس)، الوتر ${C} والضلع القائم ${A}، فما طول الضلع الآخر س؟`,c:fmt(B),w:nb(B,r),svg:g}:{q:`في المثلث القائم المرسوم (الرسم ليس بمقياس)، الضلعان القائمان ${A} و ${B}، فما طول الوتر س؟`,c:fmt(C),w:nb(C,r),svg:g}},
r=>{const R=RI(r,2,15),ar=r()<.5,c=ar?R*R:2*R;return{q:`دائرة نصف قطرها ${R} سم، فما ${ar?'مساحتها':'محيطها'} بدلالة π؟`,c:c+'π',w:(ar?[2*R,2*R*R,(R+1)*(R+1),R*R+R,4*R*R]:[R,R*R,4*R,R+2,2*R+2]).map(x=>x+'π'),svg:SV(`<circle class="s" cx="150" cy="95" r="72"/><path class="ar" d="M150,95 H222"/><circle cx="150" cy="95" r="3.5" style="fill:var(--a2)"/>`+TX(186,86,R))}},
r=>{const a=RI(r,30,80),b=RI(r,30,Math.min(100,165-a)),c=180-a-b,cx=90+RI(r,0,120);return{q:`في المثلث المرسوم قياس زاويتين ${a}° و ${b}°، فما قياس الزاوية الثالثة س؟`,c:c+'°',w:[c+10,c+20,a+b,180-a,c+30].map(x=>x+'°'),svg:SV(PG([[40,160],[260,160],[cx,35]])+TX(82,150,a+'°')+TX(218,150,b+'°')+TX(cx,84,'س','x'))}},
r=>{const a=RI(r,3,15)*10,b=RI(r,2,Math.floor((170-a)/10))*10,c=180-a-b,O=[150,160],ray=t=>{const q=pol(O,t,105);return`<path class="s" style="fill:none" d="M150,160 L${q[0].toFixed(1)},${q[1].toFixed(1)}"/>`},L=(t,R,s,x)=>{const q=pol(O,t,R);return TX(q[0],q[1]+5,s,x)};
 return{q:`ثلاث زوايا متجاورة على مستقيم، قياس اثنتين منها ${a}° و ${b}°، فما قياس الزاوية الثالثة س؟`,c:c+'°',w:[180-a,180-b,a+b,c+10,c+20,90].map(x=>x+'°'),svg:SV(`<path class="s" style="fill:none" d="M25,160 H275"/>`+ray(a)+ray(a+c)+arc(O,30,0,a)+arc(O,40,a,a+c)+arc(O,30,a+c,180)+L(a/2,62,a+'°')+L(a+c/2,74,'س','x')+L(180-b/2,62,b+'°'))}},
r=>{const s=RI(r,5,14),t=RI(r,2,s-3),u=150/s,ox=70,oy=8,tu=t*u,c=s*s-t*t;return{q:`ما مساحة الشكل المرسوم بالوحدة المربعة؟ (قُصّ مربع ضلعه ${t} من ركن مربع ضلعه ${s})`,c:fmt(c),w:[s*s,(s-t)*s,(s-t)*(s-t)+t,...nb(c,r)].map(fmt),svg:SV(PG([[ox,oy],[ox+150-tu,oy],[ox+150-tu,oy+tu],[ox+150,oy+tu],[ox+150,oy+150],[ox,oy+150]])+`<rect class="d" x="${+(ox+150-tu).toFixed(1)}" y="${oy}" width="${+tu.toFixed(1)}" height="${+tu.toFixed(1)}"/>`+TX(ox+75,178,s)+TX(ox-16,oy+80,s)+TX(ox+150-tu/2,oy+tu/2+5,t,'x'))}},
r=>{const a=RI(r,2,8),b=a+2*RI(r,1,5),h=RI(r,2,9),c=(a+b)*h/2,tw=220*a/b,x0=40+(220-tw)/2;return{q:`شبه منحرف قاعدتاه ${a} و ${b} وارتفاعه ${h}، فما مساحته؟`,c:fmt(c),w:[(a+b)*h,a*b,...nb(c,r)].map(fmt),svg:SV(PG([[40,160],[260,160],[x0+tw,55],[x0,55]])+`<path class="d" d="M${+x0.toFixed(1)},55 V160"/>`+TX(150,181,b)+TX(x0+tw/2,44,a)+TX(x0-14,112,h,'x'))}}
,
r=>{const n=PK(r,[5,7]),a=Array.from({length:n},()=>RI(r,2,40)),m=[...a].sort((x,y)=>x-y)[(n-1)/2];return{q:`ما وسيط الأعداد: ${a.join('، ')}؟`,c:fmt(m),w:nb(m,r)}},
r=>{const L=['أ','ب','ج','د'],v=L.map(()=>RI(r,2,12)*5),mx=Math.max(...v),mn=Math.min(...v),sc=110/mx,d=r()<.5,c=d?mx-mn:v[0]+v[2];let b='';v.forEach((x,i)=>{const h=x*sc,X=45+i*60;b+=`<rect class="s" x="${X}" y="${+(160-h).toFixed(1)}" width="40" height="${+h.toFixed(1)}" rx="5"/>`+TX(X+20,153-h,x)+TX(X+20,180,L[i])});
 return{q:d?'يمثل الرسم قيم أربع مجموعات، فما الفرق بين أكبر قيمة وأصغر قيمة؟':'يمثل الرسم قيم أربع مجموعات، فما مجموع قيمتي المجموعتين أ و ج؟',c:fmt(c),w:[c+5,c-5,c+10,c-10,c+15,c*2].filter(x=>x>0&&x!==c).map(fmt),svg:SV(b+'<path class="d" d="M30,160 H280"/>')}},
r=>{const g=RI(r,2,9),[m,n]=PK(r,[[2,3],[3,4],[4,5],[3,5],[5,6],[2,5]]),l=r()<.5,c=l?g*m*n:g;return{q:l?`ما أصغر مضاعف مشترك للعددين ${g*m} و ${g*n}؟`:`ما أكبر عدد يقسم كلًّا من ${g*m} و ${g*n}؟`,c:fmt(c),w:nb(c,r)}},
r=>{const k=PK(r,[3,5]),mid=RI(r,5,40),c=mid+(k-1)/2;return{q:`مجموع ${k} أعداد صحيحة متتالية يساوي ${k*mid}، فما أكبرها؟`,c:fmt(c),w:nb(c,r)}},
r=>{const a=RI(r,2,9),b=RI(r,2,9),m=RI(r,2,9);return{q:`إذا كانت ${a} : ${b} = ${a*m} : س، فما قيمة س؟`,c:fmt(b*m),w:nb(b*m,r)}},
r=>{const q=PK(r,[4,5,8,10]),p=RI(r,1,q-1),N=q*RI(r,2,20)*5,c=N*(q-p)/q;return{q:`كان مع سعد ${N} ريالًا، أنفق منها ${p}/${q}، فكم ريالًا بقي معه؟`,c:fmt(c),w:nb(c,r)}},
r=>{const b=RI(r,3,12)*2,h=RI(r,3,12),ax=50+RI(r,40,160),c=b*h/2;return{q:`مثلث طول قاعدته ${b} وارتفاعه المناظر ${h}، فما مساحته؟`,c:fmt(c),w:nb(c,r),svg:SV(PG([[50,160],[250,160],[ax,40]])+`<path class="d" d="M${ax},40 V160"/><path class="ar" d="M${ax-12},160 v-12 h12"/>`+TX(150,181,b)+TX(ax+16,105,h,'x'))}},
r=>{const[a,b,c0]=PK(r,[[3,4,5],[5,12,13],[6,8,10]]),k=RI(r,1,3),A=a*k,B=b*k,C=c0*k,H=Math.max(60,Math.min(120,200*A/B));return{q:`مستطيل بعداه ${A} و ${B}، فما طول قطره س؟`,c:fmt(C),w:nb(C,r),svg:SV(PG([[50,160],[250,160],[250,160-H],[50,160-H]])+`<path class="ar" d="M50,160 L250,${+(160-H).toFixed(1)}"/>`+TX(150,181,B)+TX(28,160-H/2+5,A)+TX(150,160-H/2-12,'س','x'))}}
],v:[
r=>{const R=PK(r,[ANT,TOOL,PART,PLC]),[p1,p2,p3]=SH(r,R),O=PK(r,[ANT,TOOL,PART,PLC].filter(x=>x!==R)),[x,y]=SH(r,O);
 return{q:`التناظر اللفظي: ${p1[0]} : ${p1[1]}`,c:`${p2[0]} : ${p2[1]}`,w:[`${p2[1]} : ${p2[0]}`,`${p2[0]} : ${p3[1]}`,`${x[0]} : ${y[1]}`,`${y[1]} : ${x[0]}`]}},
r=>{let[a,b]=PK(r,ANT);if(r()<.5)[a,b]=[b,a];const w=SH(r,ANT.filter(x=>x[0]!==a&&x[1]!==a)).slice(0,3).map(x=>PK(r,x));return{q:`اختر الكلمة المضادة لكلمة «${a}»`,c:b,w}},
r=>{const[A,B]=SH(r,CAT).slice(0,2);const s=SH(r,A).slice(0,3),odd=PK(r,B);return{q:`اختر الكلمة الشاذة: ${s.join(' ، ')} ، ${odd}`,c:odd,w:s}}
,
r=>{let[a,b]=PK(r,SYN);if(r()<.5)[a,b]=[b,a];const w=SH(r,SYN.filter(x=>!x.includes(a))).slice(0,3).map(x=>PK(r,x));return{q:`اختر المرادف لكلمة «${a}»`,c:b,w}},
r=>{const[a,b]=PK(r,MEAN),w=SH(r,MEAN.filter(x=>x[0]!==a)).slice(0,3).map(x=>x[1]);return{q:`ما معنى كلمة «${a}»؟`,c:b,w}},
r=>{const[a,b]=PK(r,PLU),w=SH(r,PLU.filter(x=>x[1]!==b)).slice(0,3).map(x=>x[1]);return{q:`ما جمع كلمة «${a}»؟`,c:b,w}},
r=>{const it=PK(r,SENT);return{q:`أكمل الفراغ: ${it[0]}`,c:it[1],w:it[2]}},
r=>{const[a,b]=PK(r,PLU),w=SH(r,PLU.filter(x=>x[0]!==a)).slice(0,3).map(x=>x[0]);return{q:`ما مفرد كلمة «${b}»؟`,c:a,w}}
]};
function gen(id){const[,t,k,s]=id.split(':'),r=rng(+s),d=GEN[t][+k](r);
 let o=d.fix?d.o.slice():[d.c];if(!d.fix)d.w.forEach(x=>{if(!o.includes(x)&&o.length<4)o.push(x)});
 while(o.length<4)o.push(String(o.length+13));
 if(!d.fix)o=SH(r,o);return{id,t,q:d.q,o,a:o.indexOf(d.c),svg:d.svg,cat:(t==='q'?KQ:KV)[+k]}}

/* ---------- الصفحة الرئيسية ---------- */
function home(){
 S=null;clearInterval(tm);subs.forEach(u=>u());subs=[];
 const nq=bank.filter(x=>x.t==='q').length,nv=bank.filter(x=>x.t==='v').length;
 app.innerHTML=`<div style="padding-top:14px;position:relative"><svg class="deco" viewBox="0 0 120 120" aria-hidden="true"><circle class="d1" cx="60" cy="60" r="44"/><polygon class="d2" points="60,14 106,96 14,96"/><rect class="d3" x="34" y="34" width="52" height="52" rx="6"/></svg><span class="chip">✦ القدرات العامة · اختبار تجريبي</span>
 <h1>اختبر قدراتك<br><em>بثقة وتركيز</em></h1>
 <div class="mu">اختبار محاكي للقدرات بتوقيت حقيقي، وبنك أسئلة يتجدد معك في كل محاولة.</div></div>
 <div class="stats"><div><b>${PER*2}</b><span>سؤال</span></div><div><b>2</b><span>قسمان</span></div><div><b>${PER}</b><span>دقيقة لكل قسم</span></div></div>
 <div class="glass"><div class="authbar">
 ${firebase.auth().currentUser && !firebase.auth().currentUser.isAnonymous
 ? `<div class="mu">مسجّل الدخول: <b dir="ltr">${esc(firebase.auth().currentUser.email||'')}</b></div><button class="g" id="studentOut">تسجيل الخروج</button>`
 : `<div class="row auth-actions"><button class="g" id="studentLogin">تسجيل الدخول</button><button class="g" id="studentRegister">إنشاء حساب</button></div><div class="mu">سجّل بحسابك لحفظ دخولك على جهازك.</div>`}
 </div>${true?`<h2>قبل ما تبدأ</h2>
 <ul class="rl"><li>${PER} سؤال كمي ثم ${PER} سؤال لفظي</li><li>لكل سؤال دقيقة واحدة فقط</li><li>السؤال اللي ما تجاوب عليه ينتهي وقته ويفوتك</li><li>ما تقدر ترجع لسؤال سابق</li><li>أسئلة جديدة بأرقام وصياغات مختلفة لكل طالب</li><li>الاختبار مرة واحدة فقط لكل اسم</li><li>النتيجة تُحفظ ولا تظهر إلا للمشرف</li></ul>
 <input type="text" id="nm" placeholder="الاسم الكامل (ثلاثي على الأقل)" maxlength="60" autocomplete="off">
 <div class="mu">الصف</div><div class="row" id="gr"><button class="g pk" data-v="ثاني ثانوي">ثاني ثانوي</button><button class="g pk" data-v="ثالث ثانوي">ثالث ثانوي</button></div>
 <div class="mu" style="margin-top:10px">الفصل</div><div class="row" id="cl" style="margin-bottom:14px">${[1,2,3,4,5].map(n=>`<button class="g pk" data-v="${n}">${n}</button>`).join('')}</div>
 <button class="btn" id="go">ابدأ الاختبار ←</button>${CW===false?'<div class="err">حسابك بصلاحية «مشاهدة» فقط ولن تُحفظ نتيجتك. اطلب من المشرف يغيّرها إلى «مساهم» (Contributor) من قائمة المشاركة.</div>':''}
 <div class="err" id="er"></div>`:
 `<h2>سجّل الدخول للبدء</h2><div class="mu">لازم تسجّل دخولك عشان تنحفظ نتيجتك.</div>`}</div>
 <button class="g" id="ad">🔒 لوحة المالك</button>`;
 document.querySelectorAll('.pk').forEach(b=>b.onclick=()=>{b.parentNode.querySelectorAll('.pk').forEach(x=>x.classList.toggle('on',x===b))});
 document.querySelectorAll('.stats b').forEach(b=>{const n=+b.textContent;let k=0;const t=setInterval(()=>{k++;b.textContent=Math.round(n*k/20);if(k>=20)clearInterval(t)},35)});const go=$('go');if(go)go.onclick=start;const ad=$('ad');if(ad)ad.onclick=adminGate;
 const sl=$('studentLogin'),sr=$('studentRegister'),so=$('studentOut');
 if(sl)sl.onclick=()=>studentAuthPage('login');if(sr)sr.onclick=()=>studentAuthPage('register');if(so)so.onclick=studentLogout;
}
const $=id=>document.getElementById(id);

/* تسجيل دخول وإنشاء حساب للطلاب */
function studentAuthPage(mode){
 const registering=mode==='register';
 app.innerHTML=`<div class="top"><span class="chip">${registering?'✨ إنشاء حساب طالب':'🔑 تسجيل الدخول'}</span><button class="g" id="authBack">رجوع</button></div>
 <div class="glass"><h2>${registering?'إنشاء حساب جديد':'أهلًا بعودتك'}</h2>
 <div class="mu">${registering?'أدخل بريدك الإلكتروني وكلمة مرور من 6 أحرف على الأقل.':'أدخل البريد الإلكتروني وكلمة المرور لحسابك.'}</div>
 <label for="studentEmail">البريد الإلكتروني</label><input type="email" id="studentEmail" placeholder="name@example.com" autocomplete="email" dir="ltr">
 <label for="studentPassword">كلمة المرور</label><input type="password" id="studentPassword" placeholder="6 أحرف على الأقل" autocomplete="${registering?'new-password':'current-password'}" dir="ltr">
 ${registering?'<label for="studentPassword2">تأكيد كلمة المرور</label><input type="password" id="studentPassword2" placeholder="أعد كتابة كلمة المرور" autocomplete="new-password" dir="ltr">':''}
 <button class="btn" id="studentAuthSubmit">${registering?'إنشاء الحساب':'تسجيل الدخول'}</button><div class="err" id="studentAuthError" role="alert"></div>
 <button class="g" style="margin-top:10px" id="switchAuth">${registering?'لدي حساب بالفعل — تسجيل الدخول':'ليس لديك حساب؟ إنشاء حساب'}</button></div>`;
 $('authBack').onclick=home;
 $('switchAuth').onclick=()=>studentAuthPage(registering?'login':'register');
 $('studentAuthSubmit').onclick=async()=>{
  const email=$('studentEmail').value.trim(),password=$('studentPassword').value,err=$('studentAuthError'),btn=$('studentAuthSubmit');
  err.textContent='';
  if(!email||!password){err.textContent='أدخل البريد الإلكتروني وكلمة المرور.';return}
  if(registering&&password.length<6){err.textContent='كلمة المرور يجب أن تكون 6 أحرف على الأقل.';return}
  if(registering&&password!==$('studentPassword2').value){err.textContent='كلمتا المرور غير متطابقتين.';return}
  btn.disabled=true;btn.textContent='جارٍ التحقق…';
  try{
   const cred=registering?await firebase.auth().createUserWithEmailAndPassword(email,password):await firebase.auth().signInWithEmailAndPassword(email,password);
   user=cred.user;uid=cred.user.uid;canAdmin=false;home();
  }catch(e){
   const msgs={'auth/email-already-in-use':'هذا البريد مسجّل مسبقًا. سجّل الدخول بدلًا من إنشاء حساب جديد.','auth/invalid-email':'صيغة البريد الإلكتروني غير صحيحة.','auth/weak-password':'كلمة المرور ضعيفة؛ استخدم 6 أحرف على الأقل.','auth/invalid-credential':'البريد الإلكتروني أو كلمة المرور غير صحيحة.','auth/user-not-found':'لا يوجد حساب بهذا البريد. أنشئ حسابًا جديدًا.','auth/wrong-password':'كلمة المرور غير صحيحة.','auth/too-many-requests':'محاولات كثيرة؛ انتظر قليلًا ثم حاول مجددًا.','auth/network-request-failed':'تحقق من اتصال الإنترنت.','auth/operation-not-allowed':'فعّل Email/Password من إعدادات Firebase Authentication.'};
   err.textContent=msgs[e.code]||('تعذر إكمال العملية: '+(e.message||e.code||'خطأ غير معروف'));
   btn.disabled=false;btn.textContent=registering?'إنشاء الحساب':'تسجيل الدخول';
  }
 };
}
async function studentLogout(){
 try{await firebase.auth().signOut();await firebase.auth().signInAnonymously();user=firebase.auth().currentUser;uid=user.uid;canAdmin=false;home()}
 catch(e){const er=$('er');if(er)er.textContent='تعذر تسجيل الخروج. تحقق من تفعيل Anonymous في Firebase.'}
}
const norm=n=>String(n).replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim().toLowerCase();

/* ---------- الاختبار ---------- */
async function start(){
 if(!db||!uid){$('er').textContent='سجّل دخولك أولًا عشان تبدأ';return}
 const name=$('nm').value.trim();
 if(name.split(/\s+/).length<3){$('er').textContent='اكتب اسمك الكامل (ثلاثة أسماء على الأقل)';return}
 const gr=document.querySelector('#gr .on'),cl=document.querySelector('#cl .on');
 if(!gr||!cl){$('er').textContent='اختر الصف والفصل';return}
 const grade=gr.dataset.v,cls=+cl.dataset.v;
 if(!canAdmin){app.innerHTML='<div class="glass">جاري التحقق…</div>';const nn=norm(name);let bad=0;
  try{(await db.collection('claims').get()).docs.forEach(d=>{if(d.id===uid||(d.data()||{}).n===nn)bad=1});if(!bad)await db.doc('claims/'+uid).set({n:nn,name,ts:Date.now()})}catch(e){bad=2}
  if(bad){app.innerHTML=`<div class="glass" style="text-align:center"><div class="big">🔒</div><h2>${bad==1?'ما تقدر تختبر مرة ثانية':'تعذر التحقق'}</h2><div class="mu">${bad==1?'تم تسجيل اختبار بهذا الاسم أو الحساب من قبل، والاختبار مسموح مرة واحدة فقط. إذا فيه خطأ تواصل مع المشرف.':'تأكد من اتصالك وحاول مرة ثانية.'}</div><br><button class="btn" id="hm">الرئيسية</button></div>`;$('hm').onclick=home;return}}
 app.innerHTML='<div class="glass">جاري تجهيز اختبارك…</div>';
 let used=new Set();
 try{const d=await db.doc(`data/users/${uid}/used`).get();if(d.exists)used=new Set(d.data().ids||[])}catch(e){}
 const seenQ=new Set(),seenK=new Set(),kk=q=>(q.match(/«(.+?)»/)||[])[1]||q;
 const sec=SEC.map(sc=>{const pool=bank.filter(x=>x.t===sc.t);
  const fr=shuf(pool.filter(x=>!used.has(x.id))).filter(x=>!seenQ.has(x.q)&&seenQ.add(x.q)).slice(0,Math.round(PER*.5)),c=shuf(GEN[sc.t].map((_,i)=>i));let g=0;
  const pk=fr.map(x=>{const p=shuf(x.o.map((_,i)=>i));return{...x,o:p.map(i=>x.o[i]),p,cat:'متنوع'}});
  let tr=0;while(pk.length<PER){const x=gen(`g:${sc.t}:${c[g++%c.length]}:${Math.random()*2**31|0}`),k=kk(x.q);if((seenQ.has(x.q)||seenK.has(k))&&tr++<400)continue;seenQ.add(x.q);seenK.add(k);pk.push(x)}
  const OR=sc.t==='q'?ORDQ:ORDV,ix=x=>{const i=OR.indexOf(x.cat);return i<0?99:i};return shuf(pk).sort((a,b)=>ix(a)-ix(b))});
 sec.flat().forEach(x=>{if(x.id[0]!=='g')used.add(x.id)});
 try{await db.doc(`data/users/${uid}/used`).set({ids:[...used]})}catch(e){}
 S={name,grade,cls,sec,ans:[{},{}],tt:[[],[]],si:0,qi:0,sw:0,t0:Date.now()};
 beginSection(0);
}
function beginSection(si){S.si=si;S.secEnd=Date.now()+SMS;showQ(0)}
function showQ(i){
 S.qi=i;S.qs=Date.now();S.qEnd=Math.min(Date.now()+QMS,S.secEnd);
 try{db.doc('live/'+uid).set({name:S.name,sec:S.si,q:i,ts:Date.now()}).catch(()=>{})}catch(e){}
 const sc=SEC[S.si],it=S.sec[S.si][i];
 app.innerHTML=`<div class="top"><span class="chip">${sc.n}</span><span class="clock">⏱ <span id="st">25:00</span></span></div>
 <div class="seg">${Array.from({length:PER},(_,k)=>`<i class="${k<i?(S.ans[S.si][k]!=null?'d':'m'):k===i?'c':''}"></i>`).join('')}</div>
 <div class="glass noselect"><div class="qh"><span class="mu">سؤال ${i+1} من ${PER} · <b style="color:var(--a1)">${esc(it.cat||'')}</b></span>
 <svg class="ring" id="rg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="rb"/><circle id="rf" cx="32" cy="32" r="26" class="rf" stroke-dasharray="163.4" stroke-dashoffset="0"/><text id="qt" x="32" y="39" text-anchor="middle">60</text></svg></div>
 <div class="qq">${esc(it.q)}</div>${it.svg?`<div class="fig">${it.svg}</div>`:''}
 <div id="ops">${it.o.map((o,k)=>`<button class="op" data-k="${k}"><i>${'أبجد'[k]}</i><span>${esc(o)}</span></button>`).join('')}</div>
 <button class="btn" id="nx" disabled style="margin-top:8px">${i<PER-1?'تأكيد والتالي':'إنهاء القسم'}</button></div>`;
 app.querySelectorAll('.op').forEach(b=>b.onclick=()=>{
  S.ans[S.si][S.qi]=+b.dataset.k;try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}
  app.querySelectorAll('.op').forEach(x=>x.classList.toggle('s',x===b));$('nx').disabled=false});
 $('nx').onclick=nextQ;
 clearInterval(tm);tm=setInterval(tick,200);tick();
}
function tick(){
 if(!S)return;const n=Date.now();
 if(n>=S.secEnd){endSection();return}
 if(n>=S.qEnd){nextQ();return}
 const r=Math.ceil((S.qEnd-n)/1000),sr=Math.ceil((S.secEnd-n)/1000);
 const st=$('st'),qt=$('qt'),rf=$('rf');if(!st)return;
 st.textContent=mmss(sr);qt.textContent=r;
 rf.setAttribute('stroke-dashoffset',(163.4*(1-Math.min(1,(S.qEnd-n)/QMS))).toFixed(1));
 $('rg').classList.toggle('lo',r<=10);
}
function nextQ(){S.tt[S.si][S.qi]=Date.now()-S.qs;S.qi<PER-1?showQ(S.qi+1):endSection()}
function endSection(){
 clearInterval(tm);
 if(S.si===0){let c=5;
  const draw=()=>app.innerHTML=`<div class="glass" style="text-align:center"><div class="big">✅</div><h2>انتهى القسم الكمي</h2>
  <div class="mu">القسم اللفظي يبدأ بعد</div><div class="big" style="margin:4px">${c}</div>
  <button class="btn" id="sk">ابدأ الآن</button></div>`;
  draw();$('sk').onclick=()=>{clearInterval(tm);beginSection(1)};
  tm=setInterval(()=>{c--;if(c<=0){clearInterval(tm);beginSection(1)}else draw();if(c>0)$('sk').onclick=()=>{clearInterval(tm);beginSection(1)}},1000);
 }else finish();
}
function art(S){const hs=[...S.name].reduce((a,c)=>(a*31+c.charCodeAt(0))%20,7)+34,h2=hs+8;let b='';
 [0,1].forEach(si=>S.sec[si].forEach((x,i)=>{const got=S.ans[si][i]!=null,t=S.tt[si][i]??60000,len=got?18+(1-Math.min(1,t/60000))*(si?30:24):8,R=si?92:50,H=si?h2:hs;
  b+=`<line x1="0" y1="${-R}" x2="0" y2="${-R-len}" transform="rotate(${(i/PER*360+(si?7:0)).toFixed(1)})" stroke="hsl(${H},${got?90:15}%,${got?64:45}%)" stroke-width="${si?5:6}" stroke-linecap="round" opacity="${got?1:.3}" style="stroke-dasharray:${len.toFixed(1)};--l:${len.toFixed(1)};animation:ln .7s ${(si*.6+i*.025).toFixed(2)}s both"/>`}));
 return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-165 -165 330 375"><defs><radialGradient id="g"><stop offset="0" stop-color="hsl(${hs},55%,24%)"/><stop offset="1" stop-color="#0a0907"/></radialGradient></defs><rect x="-165" y="-165" width="330" height="375" rx="26" fill="url(#g)"/><circle r="38" fill="none" stroke="hsl(${hs},80%,70%)" stroke-opacity=".45"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite"/>${b}</g><text y="10" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" font-family="Cairo,sans-serif">${esc([...S.name][0])}</text><text y="182" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" font-family="Cairo,sans-serif">${esc(S.name)}</text><text y="200" text-anchor="middle" font-size="10" fill="#fff" opacity=".6" font-family="Cairo,sans-serif">بصمتك في اختبار القدرات</text></svg>`}
async function saveRec(rec){try{const r=db.doc('results/'+uid),d=await r.get(),at=d.exists?JSON.parse(JSON.stringify(d.data().attempts||[])):[];if(!at.some(a=>a.ts===rec.ts))at.push(rec);await r.set({uid,name:rec.name,grade:rec.grade,cls:rec.cls,attempts:at});ls.set('bk','');return''}catch(e){ls.set('bk',JSON.stringify(rec));return String((e&&(e.code||e.message))||'error')}}
async function finish(){
 clearInterval(tm);
 const rec={uid,name:S.name,grade:S.grade,cls:S.cls,ts:Date.now(),secs:Math.round((Date.now()-S.t0)/1000),sw:S.sw,
  answers:S.sec.flatMap((a,si)=>a.map((x,i)=>({id:x.id,t:x.t,pick:S.ans[si][i]==null?-1:x.p?x.p[S.ans[si][i]]:S.ans[si][i]})))};
 app.innerHTML='<div class="glass" style="text-align:center">جاري حفظ إجاباتك…</div>';
 let ok=true;const AR=art(S);
 const er=await saveRec(rec);ok=!er;
 try{await db.doc('live/'+uid).set({name:S.name,done:true,ts:Date.now()})}catch(e){}
 S=null;
 app.innerHTML=`<div class="glass" style="text-align:center">${ok?`<div class="fig art">${AR}</div>`:'<div class="big">⚠️</div>'}<h1 style="font-size:1.8rem">${ok?'أحسنت! تم إرسال اختبارك':'تعذر حفظ الإجابات'}</h1>
 <div class="mu">${ok?'تم حفظ إجاباتك بنجاح، وستصلك النتيجة من المشرف.<br>هذي بصمتك الفنية: كل شعاع سؤال، الحلقة الداخلية للكمي والخارجية للفظي، والأطول يعني إجابة أسرع.':`تعذر الحفظ (${esc(er)}). ${/invalid|argument/.test(er)?'صلاحية حسابك لا تسمح بالحفظ، اطلب من المشرف يرفعها إلى «مساهم» (Contributor) ثم اضغط إعادة المحاولة.':'تأكد من اتصالك ثم اضغط إعادة المحاولة.'}`}</div><br>${ok?'':'<button class="btn" id="rt" style="margin-bottom:10px">🔄 إعادة المحاولة</button>'}<button class="btn" id="hm">الرئيسية</button></div>`;
 $('hm').onclick=home;if(ok)confetti();const rt=$('rt');if(rt)rt.onclick=async()=>{rt.disabled=true;const e2=await saveRec(rec);if(!e2){rt.textContent='✅ تم حفظ إجاباتك'}else{rt.disabled=false;rt.textContent='🔄 فشل ('+e2+') أعد المحاولة'}};const sv=$('sv');if(sv)sv.onclick=async()=>{downloadFile('my-print.svg',AR,'image/svg+xml')};
}
document.addEventListener('visibilitychange',()=>{if(S&&document.hidden)S.sw++});
document.addEventListener('contextmenu',e=>{if(S)e.preventDefault()});
document.addEventListener('copy',e=>{if(S)e.preventDefault()});
document.addEventListener('pointermove',e=>{const g=e.target.closest&&e.target.closest('.glass');if(g){const r=g.getBoundingClientRect();g.style.setProperty('--mx',e.clientX-r.left+'px');g.style.setProperty('--my',e.clientY-r.top+'px')}});
{const pt=document.createElement('div');pt.className='pt';for(let i=0;i<16;i++){const d=document.createElement('i'),z=3+Math.random()*7;d.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${9+Math.random()*14}s;animation-delay:-${Math.random()*20}s`;pt.appendChild(d)}document.body.prepend(pt)}
function confetti(){const c=['#f6dc94','#c8962b','#ffffff','#e8c36a','#8a6a1f'];for(let i=0;i<46;i++){const d=document.createElement('span');d.className='cf';d.style.cssText=`left:${Math.random()*100}%;width:${6+Math.random()*6}px;height:${10+Math.random()*8}px;background:${c[i%5]};--dx:${(Math.random()-.5)*160}px;animation-duration:${2+Math.random()*2.2}s;animation-delay:${Math.random()*.5}s;border-radius:${i%3?'2px':'50%'}`;document.body.appendChild(d);setTimeout(()=>d.remove(),5200)}}

/* ---------- تسجيل دخول المالك عبر Firebase Authentication ---------- */
async function adminGate(){
 app.innerHTML=`<div class="top"><span class="chip">🔒 منطقة المالك</span><button class="g" id="bk">رجوع</button></div>
 <div class="glass"><h2>دخول المشرف</h2><div class="mu">استخدم بريد وكلمة مرور حساب المشرف الذي أنشأته في Firebase Authentication.</div>
 <input type="email" id="adminEmail" placeholder="البريد الإلكتروني" autocomplete="username" dir="ltr">
 <input type="password" id="adminPassword" placeholder="كلمة المرور" autocomplete="current-password" dir="ltr">
 <button class="btn" id="ok">دخول</button><div class="err" id="er"></div></div>`;
 $('bk').onclick=home;
 $('ok').onclick=async()=>{
  const er=$('er'),btn=$('ok');btn.disabled=true;er.textContent='جاري التحقق…';
  try{
   const cred=await firebase.auth().signInWithEmailAndPassword($('adminEmail').value.trim(),$('adminPassword').value);
   const role=await db.doc('admins/'+cred.user.uid).get();
   if(!role.exists || role.data().enabled!==true){await firebase.auth().signOut();await firebase.auth().signInAnonymously();uid=firebase.auth().currentUser.uid;throw new Error('هذا الحساب غير مسجل كمشرف. أضف مستند admins/UID واجعل enabled=true.');}
   uid=cred.user.uid;canAdmin=true;return dash();
  }catch(e){er.textContent=e.code==='auth/invalid-credential'?'البريد أو كلمة المرور غير صحيحة':(e.message||'تعذر تسجيل الدخول');btn.disabled=false;}
 };
}

/* ---------- لوحة المالك ---------- */
async function dash(){
 app.innerHTML='<div class="glass">جاري تحميل اللوحة…</div>';
 const K={};try{(await db.collection('keys').get()).docs.forEach(d=>Object.assign(K,d.data().a||{}))}catch(e){}
 let TAB='o',RES=[],LIVE=[],CL=[];const ok=a=>a.id[0]==='g'?gen(a.id).a===a.pick:K[a.id]===a.pick;
 const draw=()=>{
  const rows=RES.map(r=>{let q=0,v=0;(r.answers||[]).forEach(a=>{if(ok(a))a.t==='q'?q++:v++});return{...r,q,v,tot:q+v}}).sort((a,b)=>b.ts-a.ts);
  const n=rows.length,avg=f=>n?(rows.reduce((s,r)=>s+f(r),0)/n):0;
  const live=LIVE.filter(x=>!x.done&&Date.now()-x.ts<240000);
  const T=[['o','📊 نظرة عامة'],['r','النتائج'],['c','المسجّلون'],['q','الأسئلة']];
  const tabs=`<div class="tabs">${T.map(t=>`<button class="g pk tb${TAB===t[0]?' on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`;
  const ov=`<div class="kp"><div><span class="mu">عدد الاختبارات</span><b>${n}</b></div><div><span class="mu">متوسط الدرجة</span><b>${avg(r=>r.tot).toFixed(1)}/50</b></div>
  <div><span class="mu">متوسط الكمي</span><b>${avg(r=>r.q).toFixed(1)}/25</b></div><div><span class="mu">متوسط اللفظي</span><b>${avg(r=>r.v).toFixed(1)}/25</b></div>
  <div><span class="mu">متوسط الوقت</span><b>${Math.round(avg(r=>r.secs)/60)} د</b></div><div><span class="mu">أسئلة مرفوعة</span><b>${bank.length}</b></div></div>
  <div class="glass" style="margin-top:14px"><h2><span class="dot"></span>مباشر الآن (${live.length})</h2>${live.length?live.map(x=>`<div class="lv"><span>${esc(x.name)}</span><span class="mu">${SEC[x.sec]?.n||''} · سؤال ${(x.q||0)+1}/${PER}</span></div>`).join(''):'<div class="mu">لا أحد يختبر الآن</div>'}</div>`;
  const rs=`<div class="glass"><div class="top"><h2 style="margin:0">النتائج (${n})</h2><button class="g" id="cs">تصدير Excel</button></div>
  ${rows.map(r=>`<div class="rc"><div class="rn"><b>${esc(r.name)}</b><span class="mu">${esc(r.grade||'')} · فصل ${esc(r.cls||'')}</span></div>
  <div class="rs"><span>كمي ${r.q}/25</span><span>لفظي ${r.v}/25</span><b>${r.tot}/50</b></div>
  <div class="mu">⏱ ${Math.round(r.secs/60)} د · تبديل تبويب <span${r.sw>2?' style="color:var(--er)"':''}>${r.sw}</span> · ${new Date(r.ts).toLocaleDateString('ar-SA')}</div></div>`).join('')}${n?'':'<div class="mu">لا توجد نتائج بعد</div>'}</div>`;
  const cl=`<div class="glass"><h2>🔒 المسجّلون (${CL.length})</h2><div class="mu">كل اسم يختبر مرة واحدة. اضغط 🔓 للسماح لاسم بإعادة الاختبار.</div>${CL.map(c=>`<div class="lv"><span>${esc(c.name||'')}</span><button class="g ul" data-id="${esc(c.id)}">🔓</button></div>`).join('')}</div>`;
  $('dv').innerHTML=tabs+(TAB==='o'?ov:TAB==='r'?rs:TAB==='c'?cl:'');
  document.querySelectorAll('.tb').forEach(b=>b.onclick=()=>{TAB=b.dataset.t;draw()});
  $('qs').style.display=TAB==='q'?'':'none';
  document.querySelectorAll('.ul').forEach(b=>b.onclick=async()=>{b.disabled=true;try{await db.doc('claims/'+b.dataset.id).delete()}catch(e){b.disabled=false}});
  if($('cs'))$('cs').onclick=async()=>{if(!window.XLSX)return;
   const L=[...rows].sort((a,b)=>String(a.grade||'').localeCompare(String(b.grade||''),'ar')||(a.cls||0)-(b.cls||0)||String(a.name).localeCompare(String(b.name),'ar'));
   const ws=XLSX.utils.aoa_to_sheet([['الاسم','الصف','الفصل','الكمي (من 25)','اللفظي (من 25)','المجموع (من 50)'],...L.map(r=>[String(r.name),r.grade||'',r.cls||'',r.q,r.v,r.tot])]);
   ws['!cols']=[{wch:34},{wch:12},{wch:8},{wch:14},{wch:14},{wch:15}];const wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};XLSX.utils.book_append_sheet(wb,ws,'النتائج');
   const G={};L.forEach(r=>{const k=(r.grade||'-')+'|'+(r.cls||'-');(G[k]=G[k]||[]).push(r)});const av=(a,f)=>+(a.reduce((x,r)=>x+r[f],0)/a.length).toFixed(1);
   const ws2=XLSX.utils.aoa_to_sheet([['الصف','الفصل','عدد الطلاب','متوسط الكمي','متوسط اللفظي','متوسط المجموع','أعلى مجموع'],...Object.values(G).map(a=>[a[0].grade||'',a[0].cls||'',a.length,av(a,'q'),av(a,'v'),av(a,'tot'),Math.max(...a.map(r=>r.tot))])]);
   ws2['!cols']=[{wch:12},{wch:8},{wch:12},{wch:14},{wch:14},{wch:16},{wch:12}];XLSX.utils.book_append_sheet(wb,ws2,'ملخص الفصول');
   downloadFile('results.xlsx',XLSX.write(wb,{type:'array',bookType:'xlsx'}),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')};
 };
 app.innerHTML=`<div class="top"><span class="chip">🛡️ لوحة المالك</span><div class="row"><button class="g" id="ex">خروج</button></div></div><div id="dv"></div>
 <div id="qs" style="display:none"><div class="glass"><h2>📊 رفع الأسئلة من Excel</h2><div class="mu">الأعمدة بالترتيب: النوع (كمي/لفظي) · السؤال · أ · ب · ج · د · الإجابة (أ/ب/ج/د). ملف xlsx أو csv. الأسئلة المرفوعة تُخلط خياراتها تلقائيًا، ويُكمّلها النظام بأسئلة مولّدة لا تتكرر.</div>
 <div class="row" style="margin-top:10px"><label class="g">اختر ملف<input type="file" id="xf" accept=".xlsx,.xls,.csv" hidden></label><button class="g" id="tp">تحميل القالب</button></div><div class="mu" id="xm"></div></div>
 <details class="glass"><summary>⚙️ إضافة أسئلة بصيغة JSON (متقدم)</summary><div class="mu">الصيغة: <code dir="ltr">[{"t":"v","q":"السؤال","o":["أ","ب","ج","د"],"a":0}]</code> — t: ‏q كمي أو v لفظي، a رقم الإجابة الصحيحة من 0. الإجابات تنحفظ في مكان مغلق على المالك فقط.</div>
 <textarea id="js"></textarea><button class="g" id="im">استيراد</button> <span class="mu" id="am"></span></details></div>`;
 $('xf').onchange=async e=>{const f=e.target.files[0];if(!f)return;const m=$('xm'),M={'أ':0,'ا':0,'ب':1,'ج':2,'د':3,a:0,b:1,c:2,d:3};
  try{if(!window.XLSX)throw 0;const wb=XLSX.read(await f.arrayBuffer(),{type:'array'}),list=[];
   XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''}).forEach(r=>{const h=String(r[0]).trim(),t=/^(q|ك)/i.test(h)?'q':/^(v|ل)/i.test(h)?'v':null;if(!t)return;
    const z=String(r[6]).trim().toLowerCase();list.push({t,q:String(r[1]).trim(),o:r.slice(2,6).map(x=>String(x).trim()).filter(Boolean),a:/^[1-4]$/.test(z)?+z-1:M[z[0]]})});
   $('js').value=JSON.stringify(list);m.textContent='قرأت '+list.length+' صف… جاري الحفظ';$('im').click()}catch(x){m.textContent='تعذر قراءة الملف: '+(window.XLSX?(x&&x.message||''):'مكتبة Excel لم تُحمّل، تأكد من الاتصال')}e.target.value=''};
 $('tp').onclick=async()=>{downloadFile('question-template.csv','\ufeffالنوع,السؤال,أ,ب,ج,د,الإجابة\nكمي,كم ناتج 7×8؟,54,56,58,64,ب\nلفظي,ضد كلمة «شجاع»,جبان,قوي,سريع,ذكي,أ','text/csv;charset=utf-8')};
 $('ex').onclick=async()=>{try{await firebase.auth().signOut();await firebase.auth().signInAnonymously();uid=firebase.auth().currentUser.uid;canAdmin=false;}catch(e){}home()};
 $('im').onclick=async()=>{try{
  const list=JSON.parse($('js').value).filter(x=>x&&x.q&&Array.isArray(x.o)&&x.o.length>=2&&x.a>=0&&x.a<x.o.length&&(x.t==='q'||x.t==='v'));
  const id=Date.now().toString(36);let c=0;
  for(const t of ['q','v']){const a=list.filter(x=>x.t===t);
   for(let i=0;i*50<a.length;i++){const ch=a.slice(i*50,i*50+50),key={};
    const items=ch.map((x,k)=>{const qid=t+id+'_'+i+'_'+k;key[qid]=+x.a;return{id:qid,t,q:String(x.q),o:x.o.map(String)}});
    await db.doc('bank/'+t+id+'_'+i).set({items});await db.doc('keys/'+t+id+'_'+i).set({a:key});Object.assign(K,key);c+=ch.length}}
  await loadBank();$('am').textContent='تمت إضافة '+c+' سؤال';draw();
 }catch(e){$('am').textContent='خطأ في الصيغة'}};
 subs.push(db.collection('results').onSnapshot(s=>{RES=s.docs.flatMap(d=>d.data().attempts||[]);draw();
  s.docs.forEach(d=>{const x=d.data(),at=x.attempts||[];if(at.some(a=>a.q===undefined)){
   const nat=at.map(a=>{if(a.q!==undefined)return a;let q=0,v=0;(a.answers||[]).forEach(p=>{if(ok(p))p.t==='q'?q++:v++});return{...a,q,v,tot:q+v}});
   db.doc('results/'+d.id).set({...x,attempts:nat}).catch(()=>{})}})},()=>{}));
 subs.push(db.collection('live').onSnapshot(s=>{LIVE=s.docs.map(d=>d.data());draw()},()=>{}));
 subs.push(db.collection('claims').onSnapshot(s=>{CL=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.ts-a.ts);draw()},()=>{}));
 {const iv=setInterval(()=>{if($('dv'))draw()},30000);subs.push(()=>clearInterval(iv))}
}

(async()=>{
 try{
  db=firebase.firestore();
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  if(!firebase.auth().currentUser) await firebase.auth().signInAnonymously();
  uid=firebase.auth().currentUser.uid;CW=true;
  await loadBank();
 }catch(e){console.error('Firebase initialization failed:',e);const msg=document.getElementById('app');if(msg){const authFix=e.code==='auth/admin-restricted-operation'?'فعّل تسجيل الدخول المجهول Anonymous: Firebase Console ← Authentication ← Sign-in providers ← Add new provider ← Anonymous ← Enable ثم Save.':'تأكد من إعداد Firebase Authentication وFirestore وقواعد الأمان، ثم حدّث الصفحة.';msg.innerHTML='<div class="glass"><h2>تعذر الاتصال بـ Firebase</h2><div class="mu">'+authFix+'</div><div class="err">'+esc(e.message||'')+'</div></div>'}return}
 home();
})();
