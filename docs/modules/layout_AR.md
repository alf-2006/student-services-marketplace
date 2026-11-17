# دليل وحدة الواجهة المشتركة

تملك هذه الوحدة التخطيط العام للموقع ومكونات الواجهة القابلة لإعادة الاستخدام. `AppLayout` يضع رابط تجاوز التنقل، و`Navbar`، ومنطقة `Outlet` الرئيسية، ثم `Footer`. استورد الصفحات المكونات من المسارات `src/components/layout` و`src/components/ui` بدل إعادة تعريف الأزرار أو الحقول.

## واجهات الاستخدام

- `Button`: يستقبل `children` و`variant` (`primary` افتراضيًا أو `secondary` أو `ghost`) و`to` اختياريًا. وجود `to` يجعله رابط React Router، و`loading` أو `disabled` يمنع التفاعل ويعرض حالة الانتظار.
- `FormField`: يستقبل `label` و`id` و`error` و`hint` و`required`، ويدعم `as="input"` أو `as="textarea"` أو `as="select"`. يربط النص بالحقل ويضيف `aria-describedby` و`aria-invalid` تلقائيًا.
- `SearchBar`: نموذج بحث حقيقي يوجه إلى `/search` مع `q` و`category`، ويدعم `initialQuery` و`initialCategory` و`compact`.
- `ServiceCard`: يستقبل كائن خدمة من `src/data/services.js` ويستخدم `providerId` و`imageKey` لبناء روابط التفاصيل والطلب والملف العام.
- `EmptyState` و`LoadingState`: حالات فارغة وتحميل معلنة دلاليًا لقارئات الشاشة.

## أسلوب التصميم

الألوان الأساسية هي الأخضر الغابي والعاجي والأوكر، والمتغيرات في `src/styles/variables.css` والأنماط العامة في `src/styles/global.css`. استخدم أصناف العقد العامة مثل `container` و`page-section` و`card` و`form-grid` و`service-grid` بدل قيم ألوان محلية. الحد الأدنى للمساحات التفاعلية 44px، وتوجد حالات تركيز واضحة وحركة 160ms مع احترام `prefers-reduced-motion`.

كل النصوص والبطاقات الحالية موسومة بوضوح كبيانات تجريبية؛ لا تضف تقييمات أو أرقام ثقة أو مستخدمين وهميين. بيانات الحساب تأتي فقط من `useAuth`، بينما `student-ahmed` ملف عام تجريبي عند تسجيل الخروج. لا تعتمد على localStorage للمصادقة ولا تعلن نجاح حفظ لا يأتي من Firebase.
