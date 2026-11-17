# إعداد Firebase والنشر

## ربط تطبيق الويب

افتح مشروعك في Firebase Console، ثم Project settings → General → Your apps، واختر تطبيق Web الموجود. انسخ SDK config إلى القيم الست في `.env.local`: `VITE_FIREBASE_API_KEY` و`VITE_FIREBASE_AUTH_DOMAIN` و`VITE_FIREBASE_PROJECT_ID` و`VITE_FIREBASE_STORAGE_BUCKET` و`VITE_FIREBASE_MESSAGING_SENDER_ID` و`VITE_FIREBASE_APP_ID`. `measurementId` غير مطلوب لأن المشروع لا يفعّل Analytics. [1]

Firebase Web API key يعرف المشروع ولا يمنح صلاحيات إدارية. الحماية الفعلية تأتي من قواعد البيانات وAuth؛ لا تعتمد على إخفائه. حافظ على قيوده لخدمات Firebase فقط، ولا تستخدم مفاتيح خدمات خاصة مثل Gemini أو Service Account في React. القيم `VITE_` تظهر في الحزمة حتى لو خزّنها مزود النشر مشفرة. [2]

## Authentication وFirestore

من Authentication → Sign-in method فعّل Email/Password فقط. تسجيل الدخول دون كلمة مرور أو Google/Phone ليس ضمن هذا المشروع. من Settings → Authorized domains أضف الدومين الفعلي للنشر عند الحاجة، دون `https://` أو مسار. لا تغيّر مزودي المشروع الآخرين بلا سبب. [3]

أنشئ Cloud Firestore Standard بالوضع Production، لا Test mode العام. اختيار موقع قاعدة البيانات غير قابل للتغيير بعد إنشائها، فاختَر الموقع قبل الضغط على Create؛ لا تُفعّل خطة مدفوعة أو Enterprise لهذا التكليف. بعد إنشاء القاعدة، انشر `firestore.rules` و`firestore.indexes.json` من هذا الريبو. [4]

قواعد المشروع تمنع الوصول افتراضيًا إلى أي مجموعة غير معلنة. لكل حساب قراءة طلباته فقط؛ الإنشاء يتحقق من الحقول والهوية ووقت الخادم. الإلغاء يغير pending إلى cancelled ولا يغير التفاصيل أو المالك، والحذف مرفوض. الملف الشخصي خاص بمالكه، ولا يمكن تغيير البريد أو uid أو تاريخ الإنشاء من صفحة الملف.

يمكن نشر القواعد من Console → Firestore → Rules، أو من CLI بعد تسجيل دخول صاحب المشروع:

```bash
pnpm exec firebase login
pnpm exec firebase deploy --only firestore:rules,firestore:indexes --project student-services-marketplace
```

تحقق من اسم مشروعك قبل الأمر. `.firebaserc` يحتوي alias محاكي فقط؛ لا تستبدل `--project` بمعرّف demo عند النشر الحقيقي. لا يحتاج تطبيق المتصفح Service Account.

## الاختبار المحلي للقواعد

```bash
java -version
pnpm test:rules
```

يلزم Java21 أو أحدث. الأمر يشغّل المحاكي على `127.0.0.1:8080` ومعرّف `demo-student-marketplace` ثم مجموعة اختبارات القواعد ويغلقه. لا تستخدم مشروع السحابة أو حسابًا حقيقيًا داخل الاختبارات المحلية. رفض العمليات غير المسموح بها نتيجة مقصودة في اختبارات الأمان.

## Vercel

اربط الريبو `alf-2006/student-services-marketplace` بمشروع Vercel. الإطار Vite، مجلد المصدر الجذر، install `pnpm install --frozen-lockfile`، build `pnpm build`، output `dist`. أضف قيم SDK الست إلى بيئة Production، وإلى Preview/Development إذا ستستخدمهما، وأضف `VITE_PORTABLE_ASSETS=true`. هذا المتغير يجعل الصور تقرأ ملفات `public/images` الموجودة في الريبو بدل مسارات تخزين بيئة التطوير.

انشر main، وانتظر READY قبل اعتبار النشر مكتملًا. بعد نشر أول نسخة أضف الدومين النهائي في Authorized domains، ثم اختبر دخول حساب مخصص وطلبًا مخصصًا فقط؛ لا تستخدم أو تمسح بيانات مستخدمين حقيقيين للاختبار. تشغيل build أو Preview وحده ليس نشرًا. الـCI يعيد الاختبارات والبناء ولا ينشر قواعد Firestore السحابية تلقائيًا.

إذا تغيرت قيم `VITE_` يلزم إعادة البناء والنشر لأنها تُضمّن وقت البناء. تأكد أن الروابط الداخلية تفتح مباشرة، وأن `/images/*.webp` يعيد صورة وليس صفحة index.html. حالة التنفيذ الفعلية في [STATUS_AR.md](STATUS_AR.md)، وليست هذه التعليمات إعلانًا أن كل خطوة نُفذت.

## سيرفر الجامعة

التكليف يشترط نشر الجامعة، والمستخدم اختار Vercel. يلزم قبول المدرس لهذا البديل؛ لا يوجد ما يثبت ذلك في هذا الريبو. للرفع الجامعي جهّز `dist` وارفعه إلى مسار الموقع المطلوب واضبط fallback للصفحات الداخلية. إذا كان الموقع تحت مسار فرعي، يلزم مواءمة Vite base وBrowserRouter basename وروابط الصور مع ذلك المسار قبل البناء. بيانات السيرفر وطريقة الرفع لم تُوفر، لذلك لا يُدعى تنفيذ هذه الخطوة.

## تشخيص الأعطال

رسالة Firebase غير مُعد تعني قيمة SDK ناقصة أو أن خادم التطوير لم يُعاد تشغيله بعد الإعداد. operation-not-allowed تعني أن مزود Email/Password غير مفعّل. permission-denied في الطلبات يعني قواعد غير منشورة أو حسابًا غير مالك؛ لا تحوّل القواعد إلى allow all لحلها. نجح الحساب وفشل الملف يعني أن Auth أنشأ الحساب لكن Firestore لم يحفظ الملف؛ سجّل الدخول بالحساب نفسه وأصلح الملف، ولا تنشئ حسابًا ثانيًا أو تخزن كلمة المرور محليًا.

## المراجع

[1]: https://firebase.google.com/docs/web/setup "Firebase Web setup"
[2]: https://firebase.google.com/docs/projects/api-keys "Firebase API keys and restrictions"
[3]: https://firebase.google.com/docs/auth/web/password-auth "Firebase Email and Password Authentication"
[4]: https://firebase.google.com/docs/firestore/quickstart "Cloud Firestore quickstart"
