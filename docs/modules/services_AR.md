# دليل وحدة الخدمات

> **توزيع المسؤولية الحالي:** ياسمين حسن — `yasmeenelghazawy-hash` تملك بيانات الكتالوج والتصنيفات والتفاصيل وبطاقات العرض؛ أحمد عيد — `alf-2006` يملك خوارزمية البحث والترشيح وحالة URL واختبارات التكامل المرتبطة بها.

هذا التوزيع للشرح والصيانة الحالية فقط، ولا يعيد كتابة تاريخ Git أو ينسب تنفيذًا يدويًا سابقًا.

## النطاق والمسارات

### نطاق ياسمين حسن: الكتالوج والعرض

- `src/data/services.js`: الخدمات والطلاب التجريبيون ودوال `getServiceById` و`getStudentById`.
- `src/data/imageAssets.js`: ربط `imageKey` بالصور المرفقة.
- `src/constants/serviceCategories.js`: التصنيفات ووصفها وصورها.
- `src/pages/CategoriesPage.jsx`: صفحة التصفح حسب التصنيف.
- `src/pages/ServiceDetailsPage.jsx`: تفاصيل الخدمة ومقدم الخدمة ورابط الطلب.
- `src/components/ui/ServiceCard.jsx`: بطاقة العرض وروابط التفاصيل والملف والطلب.

### نطاق أحمد عيد: المنطق والتكامل

- `src/services/servicesService.js`: `normalizeArabic` و`filterServices` ومنطق التصنيف والترتيب.
- `src/pages/ServicesPage.jsx` و`src/pages/SearchResultsPage.jsx`: قراءة `q` و`category` و`sort` من URL وعرض النتائج.
- `src/components/ui/SearchBar.jsx` و`src/components/ui/ServiceFilters.jsx`: إدخال البحث والفلاتر وتحديث الرابط.
- `src/router.jsx` و`src/constants/routes.js`: ربط المسارات، مع اختبارات `tests/services.test.js` و`tests/navigation-regressions.test.jsx`.

## البيانات والعقود

- توجد 12 خدمة تجريبية موزعة بين `tutoring` و`design` و`printing`.
- توجد خمسة ملفات طلاب تجريبية، ويبدأ ترتيبها بالمعرّف `student-ahmed`. كل بريد ينتهي بـ`.example`.
- الصور تمر عبر `imageKey` وتُحل من `src/data/imageAssets.js`، ولا تُستخدم كصور أشخاص حقيقيين.
- لا تعدّل أسماء `id` أو `category` أو `providerId` دون تنسيق مع أحمد؛ هذه القيم تدخل في البحث والروابط والتفاصيل والطلب.
- كل الأسعار وبيانات التواصل تجريبية للتوضيح، وليست عروضًا أو ملفات تعريف حقيقية.

## البحث والتنقل

`filterServices` دالة نقية تقبل `query` و`category` و`sort`:

1. `normalizeArabic` يزيل الحركات والتطويل ويوحّد أشكال الألف والمسافات.
2. التصنيف يطابق المعرّف أو الاسم العربي، والتصنيف غير المعروف يعيد قائمة فارغة.
3. البحث يطابق عنوان الخدمة واسم التصنيف العربي.
4. `recommended` يحافظ على الترتيب الأصلي، بينما `price-asc` و`price-desc` يرتبان نسخة من النتائج دون تغيير البيانات.

صفحتا الخدمات والنتائج تقرآن `q` و`category` و`sort` من `useSearchParams`. عند الانتقال إلى التفاصيل أو العودة، helper الحالي يحافظ على `q` و`category`؛ لا تفترض أن `sort` محفوظ في رابط التفاصيل إلا إذا غُيّر helper واختباره. صفحة التصنيفات تربط كل تصنيف بنتائج مفلترة، وصفحة التفاصيل تعرض حالة عدم العثور للمعرّف المجهول.

## حدود Firebase

هذه الوحدة لا تنشئ جلسات دخول ولا تحفظ كلمات مرور ولا تحفظ الطلبات. نموذج الطلب وخدمة الحفظ في `docs/modules/requests_AR.md`، وقواعد الملكية في `firestore.rules` ضمن مسؤولية مصطفى أحمد. تغيير بيانات كتالوج تجريبية لا يعني إنشاء بيانات Cloud Firestore؛ الحالة السحابية وقواعد عدم الجاهزية موثقة في [دليل Firebase والأمان](firebase_security_AR.md).

## الاختبار

الاختبار المملوك لمنطق البحث هو `tests/services.test.js` ويغطي البحث بالنص والتصنيف، التطبيع العربي، ترتيب الأسعار، وسلوك المعرّفات غير المعروفة. اختبارات URL والتخطيط في `tests/navigation-regressions.test.jsx`، ويُنسّق تغيير بطاقة أو صفحة تفاصيل مع اختبار مناسب.

```bash
pnpm test --run tests/services.test.js
pnpm test --run tests/navigation-regressions.test.jsx
```

الحالة المسجلة للمشروع هي 42 اختبار وحدة و10 اختبارات قواعد عبر محاكي CI ناجحة. اختبارات الخدمات لا تتصل بمتصفح أو Firebase أو بيانات سحابية. نجاح الاختبارات أو رابط Vercel لا يثبت إنشاء Cloud Firestore أو نجاح حساب أو طلب سحابي.
