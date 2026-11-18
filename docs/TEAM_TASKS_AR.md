# مصفوفة مهام الفريق الحالية

هذا المستند يصف **المسؤولية الحالية عن الشرح والصيانة** في سوق خدمات الطلبة. لا يعيد كتابة تاريخ Git، ولا ينسب بأثر رجعي تنفيذًا يدويًا أو اختبارًا لطالب. المسار المذكور هو نقطة البدء الفعلية في المستودع؛ وإذا احتاج التغيير إلى عبور حد مسؤول آخر فالتنسيق جزء من المهمة.

## القاعدة العامة

قبل تعديل أي ملف، اقرأ الاختبارات والـservice أو المكوّن الذي يستعمله. حافظ على رسائل عدم الجاهزية والتمييز بين بيانات الكتالوج التجريبية وبيانات الحساب والطلبات الفعلية. لا تنشئ Cloud Firestore أو بيانات سحابية في إطار هذه المصفوفة؛ منطقة Firestore غير قابلة للتغيير بعد الإنشاء وتحتاج موافقة صاحب المشروع.

## المصفوفة

| المسؤول الحالي | النطاق العملي | مسارات المصدر الفعلية | حدود التعاون وشرط التسليم |
|---|---|---|---|
| **مصطفى أحمد — `ItzFafa`** | تهيئة Firebase SDK، جلسة Auth والحسابات، الملفات الشخصية الخاصة، قواعد ملكية Firestore، المحاكي وتشخيص مشاكل الأمان | `src/firebase.js`، `src/context/AuthContext.jsx`، `src/hooks/useAuth.js`، `src/services/authService.js`، `src/services/profileService.js`، `firestore.rules`، `firebase.json`، `tests/auth.test.js`، `tests/profile.test.js`، `tests/firestore.rules.test.js` | يراجع قواعد الطلبات مع أحمد ومريم قبل أي تغيير. إعداد SDK وEmail/Password ونطاق المصادقة مفعّل حسب الحالة المسجلة، ولا توجد Cloud Firestore سحابية منشأة حاليًا؛ لذلك الحساب والطلب السحابي غير متحققين. الاختبار المحلي يتم عبر `pnpm test:rules` فقط.
| **أحمد عيد — `alf-2006`** | خدمة وتدفق بيانات الطلب، خوارزمية البحث والترشيح وحالة URL، الراوتنج واختبارات التكامل، وتجهيز إصدار Vercel | `src/services/requestsService.js`، `src/pages/ServiceRequestPage.jsx`، `src/pages/MyRequestsPage.jsx`، `src/services/servicesService.js`، `src/pages/ServicesPage.jsx`، `src/pages/SearchResultsPage.jsx`، `src/components/ui/SearchBar.jsx`، `src/components/ui/ServiceFilters.jsx`، `src/router.jsx`، `tests/services.test.js`، `tests/requests.test.js`، `tests/navigation-regressions.test.jsx`، `tests/requests-account-switch.test.jsx`، `vercel.json` | يستقبل عقد بيانات النموذج من مريم، ولا يغيّر قواعد Firestore دون مصطفى. ينسّق بيانات الكتالوج مع ياسمين حسن. تسليم الإصدار يمر عبر `pnpm test` و`pnpm test:rules` و`pnpm build`؛ نجاح Vercel لا يثبت جاهزية Firebase السحابية.
| **ياسمين رجب — `yasmine56004-stack`** | التخطيط العام، Navbar وFooter وHome، اتجاه RTL، التجاوب والتنسيقات المشتركة | `src/components/layout/AppLayout.jsx`، `src/components/layout/Navbar.jsx`، `src/components/layout/Footer.jsx`، `src/pages/HomePage.jsx`، `src/styles/global.css`، `src/styles/variables.css`، `src/styles/auth.css`، `src/styles/requests.css`، `src/styles/services.css`، `tests/layout.test.jsx` | تحافظ على نقطة `main` وskip link وسلوك RTL. تنسق مع أحمد عند تغيير روابط أو حالات تحميل تظهر في التخطيط، ومع مريم عند تغيير عرض أخطاء النماذج.
| **ياسمين حسن — `yasmeenelghazawy-hash`** | بيانات الكتالوج والعينات، التصنيفات، تفاصيل الخدمة، وبطاقات العرض | `src/data/services.js`، `src/data/imageAssets.js`، `src/constants/serviceCategories.js`، `src/pages/CategoriesPage.jsx`، `src/pages/ServiceDetailsPage.jsx`، `src/components/ui/ServiceCard.jsx`، `src/components/ui/EmptyState.jsx` | كل البيانات تجريبية وليست ملفات طلاب حقيقية أو عروضًا تشغيلية. تتعاون مع أحمد على `filterServices` و`ServicesPage` و`SearchResultsPage` حتى لا تكسر حقول البحث أو `serviceId` وروابط الطلب.
| **مريم مصطفى — `mariammostafa123-mm`** | حقول نموذج الطلب، رسائل الأخطاء، الموافقة، بطاقات حالات الطلب، وواجهة التحقق المبتدئة | `src/pages/ServiceRequestPage.jsx`، `src/pages/MyRequestsPage.jsx`، `src/utils/validators.js`، `src/components/ui/FormField.jsx`، `src/components/ui/LoadingState.jsx`، `src/components/ui/EmptyState.jsx`، `src/styles/requests.css`، `tests/request-form.test.jsx`، `tests/validators.test.js` | `consent` قرار واجهة ولا يُحفظ في وثيقة Firestore. تنسق مع أحمد على شكل `form` وعقد `requestsService`، ومع مصطفى على الحقول التي تقبلها القواعد؛ لا تُعلن نجاحًا قبل تأكيد نتيجة الحفظ.

## حدود لا تُنقل بين المسؤولين

- **الواجهة ليست قاعدة الأمان:** التحقق في `src/utils/validators.js` يساعد المستخدم، لكن القرار النهائي في `firestore.rules` وتملكه مسؤولية مصطفى.
- **الخدمة ليست الكتالوج:** `requestsService.js` يبني وثيقة طلب ويستعمل `service.id` و`service.title`، أما مصدر الخدمة التجريبية وتفاصيلها فيملكه نطاق ياسمين حسن.
- **الحساب ليس الملف العام التجريبي:** Auth و`profiles/{uid}` خاصان بالحساب الحقيقي؛ `src/data/services.js` يحتوي ملفات عينات مستقلة.
- **Vercel ليس Firebase:** رابط `https://student-services-marketplace.vercel.app` يثبت نشر الواجهة، لا إنشاء قاعدة Firestore أو نجاح حساب أو طلب سحابي.

## طريقة قراءة سريعة للمهمة

ابدأ بـ`src/main.jsx` ثم `src/App.jsx` و`src/router.jsx`. للكتالوج اقرأ `src/data/services.js` ثم `src/services/servicesService.js`. لتدفق الطلب اقرأ `src/pages/ServiceRequestPage.jsx` ثم `src/services/requestsService.js` ثم `firestore.rules`. للحساب اقرأ `src/firebase.js` ثم `src/context/AuthContext.jsx` ثم `src/services/authService.js` و`src/services/profileService.js`. بعد أي تعديل شغّل الاختبار الأقرب، ثم مجموعة الأوامر العامة المناسبة للمسؤول.
