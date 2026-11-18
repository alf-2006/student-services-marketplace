# التسليم الفني: التكامل والطلبات والبحث

> **المسؤول الحالي:** أحمد عيد — `alf-2006`
> **نطاق الشرح والصيانة:** تدفق بيانات الطلب وخدمته، خوارزمية البحث والترشيح وحالة URL، الراوتنج واختبارات التكامل، وتجهيز إصدار Vercel.

هذا الدليل يصف حدود الصيانة الحالية ولا يعيد كتابة تاريخ الـcommits أو ينسب تنفيذًا يدويًا سابقًا.

## المسارات التي يبدأ منها المسؤول

- الطلبات: `src/services/requestsService.js`، `src/pages/ServiceRequestPage.jsx`، `src/pages/MyRequestsPage.jsx`.
- البحث والترشيح: `src/services/servicesService.js`، `src/pages/ServicesPage.jsx`، `src/pages/SearchResultsPage.jsx`، `src/components/ui/SearchBar.jsx`، `src/components/ui/ServiceFilters.jsx`.
- الراوتنج: `src/router.jsx` و`src/constants/routes.js`.
- الاختبارات: `tests/requests.test.js`، `tests/requests-account-switch.test.jsx`، `tests/services.test.js`، `tests/navigation-regressions.test.jsx`، واختبارات نموذج الطلب بالتنسيق مع مريم.
- الإصدار: `vercel.json` و`package.json`، مع بقاء رابط الواجهة المنشور `https://student-services-marketplace.vercel.app`.

## 1. دورة الطلب من الصفحة إلى الخدمة

1. `ServiceRequestPage` يقرأ `serviceId` من المسار ويستعمل `getServiceById`. المعرّف غير الموجود يعرض حالة عدم العثور ولا يستبدل الخدمة بخدمة أخرى.
2. الصفحة تملأ الاسم والبريد من جلسة الحساب إن وُجدت، لكنها تترك وسيلة التواصل والتفاصيل والتاريخ للمستخدم. مريم مصطفى تملك الحقول ورسائل الخطأ والموافقة.
3. `handleSubmit` يستدعي `validateRequest` أولًا، ثم يتحقق من وجود مستخدم حقيقي ومن اكتمال إعداد Firebase، ثم يستدعي `createServiceRequest`.
4. `requestsService.js` يبني الوثيقة من `user.uid` و`service.id` و`service.title` والحقول المعتمدة، ويضيف `status: 'pending'` و`serverTimestamp()`، ثم يعيد معرّف `addDoc`.
5. لا تعرض الصفحة نجاحًا إلا إذا عاد معرّف فعلي. الفشل يعرض رسالة ولا يترك نجاحًا وهميًا.
6. `MyRequestsPage` يستدعي `getUserRequests(uid)` باستعلام `where('userId', '==', uid)`، ثم يرتب النتائج على العميل حسب `createdAt`. الإلغاء يستدعي `cancelServiceRequest` ويحدّث البطاقة بعد نجاح Firebase فقط.

العقد الحالي للوثيقة هو: `userId`, `serviceId`, `serviceTitle`, `name`, `email`, `contact`, `details`, `preferredDate`, `status`, `createdAt`. خانة `consent` واجهة فقط ولا تُرسل إلى Firestore.

## 2. حدود التكامل مع Firebase

مصطفى أحمد يملك `src/firebase.js` و`src/context/AuthContext.jsx` و`src/services/authService.js` و`src/services/profileService.js` وقواعد `firestore.rules`. أحمد يملك استدعاء الخدمة وتسلسل الصفحة، وليس قرار الملكية في القواعد. لذلك:

- لا تضف حقلًا إلى الطلب في الصفحة أو الخدمة دون تنسيق مع مريم ومصطفى.
- لا تغيّر شرط المالك أو حالات `pending` و`cancelled` داخل القواعد ضمن مهمة تدفق عادية.
- `pnpm test:rules` يستخدم Firestore Emulator محليًا بمعرّف `demo-student-marketplace`؛ نجاحه لا يثبت إنشاء Cloud Firestore أو نشر القواعد.
- الحالة الحالية: إعداد SDK ومزوّد Email/Password ونطاق المصادقة مفعّلة حسب السجل، لكن لا توجد Cloud Firestore سحابية منشأة حاليًا، ولذلك لم يُتحقق من إنشاء الحساب أو حفظ الطلب السحابي. لا تنشئ بيانات سحابية، وموافقة صاحب المشروع لازمة لأي منطقة Firestore غير قابلة للتغيير.

## 3. خوارزمية البحث وحالة URL

`filterServices` في `src/services/servicesService.js` دالة نقية:

1. تطبع النص العربي في `normalizeArabic`: تزيل الحركات والتطويل، وتوحّد أشكال الألف والمسافات، ثم تقارن بحروف صغيرة.
2. تطبق التصنيف من `serviceCategories`، وتعيد قائمة فارغة إذا كان التصنيف غير معروف.
3. تبحث في عنوان الخدمة واسم التصنيف العربي.
4. ترتب نسخة من القائمة في `recommended` أو `price-asc` أو `price-desc` دون تغيير المصدر.

`ServicesPage` و`SearchResultsPage` يقرآن `q` و`category` و`sort` من `useSearchParams`. البحث والتصنيف والترتيب يحددان النتائج الحالية؛ وعند الانتقال إلى التفاصيل أو العودة يحافظ helper الحالي على `q` و`category` في الرابط. إذا احتاج المنتج إلى حفظ `sort` أيضًا، يجب تعديل helper والاختبار معًا بدل افتراض أنه محفوظ.

بيانات الخدمات والتصنيفات والعينات تملكها ياسمين حسن في `src/data/services.js` و`src/constants/serviceCategories.js`. عند تغيير اسم حقل أو معرّف خدمة، نسّق معها قبل تعديل الخوارزمية أو الروابط.

## 4. الراوتنج وإصدار Vercel

`src/router.jsx` يربط المسارات العشرة بصفحاتها ويعرض `EmptyState` للمسارات غير المعروفة. أي مسار جديد يحتاج صفحة، رابطًا مناسبًا، وحالة رجوع واضحة، مع اختبار عدم تكرار `main`.

`vercel.json` هو مصدر إعداد الإصدار الحالي:

- framework: `vite`.
- التثبيت: `pnpm install --frozen-lockfile`.
- البناء: `pnpm build`.
- الناتج: `dist`.
- fallback للروابط الداخلية إلى `/index.html`، مع عدم تحويل `/assets` و`/images` غير الموجودة إلى التطبيق.

النشر على Vercel يثبت توفر الواجهة فقط. لا تكتب في دليل الإصدار أن الحساب أو Firestore أو الطلب السحابي تحقق لمجرد فتح الرابط.

## 5. قائمة فحص قبل التسليم

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm test:rules
pnpm build
pnpm preview
```

ابدأ بالاختبار الأقرب للتغيير: `tests/services.test.js` لمنطق البحث، `tests/navigation-regressions.test.jsx` للـURL والراوتنج، و`tests/requests.test.js` أو `tests/requests-account-switch.test.jsx` لتدفق الطلب. الحالة المسجلة للمشروع هي 42 اختبار وحدة و10 اختبارات قواعد عبر محاكي CI ناجحة.

راجع بعدها أن:

- البحث العربي والتصنيف والترتيب لا يغيران بيانات المصدر.
- `q` و`category` لا يختفيان عند فتح التفاصيل والعودة.
- لا يتغير حساب قائمة الطلبات عند تبديل `uid`.
- لا يظهر نجاح قبل معرّف `addDoc` فعلي.
- فشل Firebase لا يتحول إلى بطاقة نجاح.
- `vercel.json` و`package.json` لم يتغيرا بلا سبب واضح.

## حدود المسؤوليات

مريم مصطفى تملك واجهة الحقول والأخطاء والموافقة وبطاقات الحالة. مصطفى أحمد يملك قواعد الملكية والمحاكي وتشخيص أذونات Firebase. ياسمين حسن تملك بيانات الكتالوج والتفاصيل والبطاقات وتتعاون في عقد البحث. ياسمين رجب تملك التخطيط وRTL والتنسيقات. أي تغيير يعبر هذه الحدود يرفق باختبار أو شرح للمسؤول المعني، دون ادعاء أن سجل Git يثبت تنفيذًا يدويًا بعينه.
