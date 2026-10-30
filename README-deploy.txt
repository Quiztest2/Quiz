دليل نشر الموقع
================

1) الملفات (كلها في جذر المستودع، لا تنقص أي واحد، ولا ترفع level.js القديم):
   index.html      الصفحة الرئيسية
   style.css       التصميم
   app.js          الاختبار الرسمي وتسجيل الدخول ولوحة المالك
   practice-data.js بنك أسئلة التدريب (كمي + لفظي) مع الشرح
   practice.js     واجهة التدريب + مستوى الطالب والقائمة الجانبية (يشمل level.js)
   firestore.rules قواعد Firestore (انسخها في Firebase)

2) الرفع: GitHub > Add file > Upload files > اسحب الملفات > Commit.
   انتظر دقيقة ثم افتح الموقع بتحديث كامل (Ctrl+Shift+R).

3) قواعد Firestore: Firebase Console > Firestore Database > Rules،
   الصق محتوى firestore.rules ثم Publish.
   (الإضافة الجديدة: مجموعة progress لحفظ نقاط الطالب على حسابه. لو ما نشرتها
   تبقى النقاط محفوظة على جهاز الطالب فقط والموقع يشتغل عادي.)

4) رسالة استعادة كلمة المرور: Firebase Console > Authentication > Templates
   > Password reset > اختر اللغة العربية ثم الصق النص الموجود في ملف
   firebase-reset-template.txt واضغط Save.

5) تأكد أن Email/Password و Anonymous مفعّلان في Authentication > Sign-in method.
6) الدومين: Authentication > Settings > Authorized domains يجب أن يحتوي quiztest2.github.io

7) مهم: في app.js لا تحذف ولا تغيّر ترتيب عناصر الجداول (CTX و RCQ و CMP و ANT ...)، أضف الجديد في آخرها فقط، وإلا تتغيّر أسئلة الاختبارات القديمة وتصحيحها.
8) مراجعة الشرح بعد الاختبار تُعطَّل من أول app.js بتغيير EXAM_REVIEW إلى false.
