# عقد تنفيذ سوق خدمات الطلبة

المجلد المعتمد: `/home/ubuntu/studenthub`. الريبو الأصلي: `alf-2006/student-services-marketplace` وفيه تاريخ محفوظ وملفات فارغة. لا أحد يشغل git commit/push أو أدوات webdev أو ينشر أو يغير إعدادات المشروع إلا المنسق. لا تقرأوا قيم secrets ولا تكتبوها في الملفات أو المخرجات. خمس وحدات فقط، وحدود ملفات منفصلة. كل فريق فرعي يرجع ملخص الملفات ونتائج اختباره والمشاكل المتبقية.

## المتطلبات المعتمدة

موقع عربي RTL في React، عشر صفحات مختلفة: الرئيسية، الخدمات، التصنيفات، نتائج البحث، تفاصيل خدمة، طلب خدمة، الدخول، التسجيل، طلباتي، ملف طالب. بحث بالاسم أو التصنيف، سعر ووصف وتواصل للخدمة، نموذج مطلوباته validated ونجاح بعد حفظ فعلي. واجهة متجاوبة وروابط سليمة وsample data موسومة كتجريبية، لا social proof أو تقييمات حقيقية مختلقة. المستخدم اختار النشر على Vercel؛ نشر الجامعة المطلوب في PDF ليس مثبتًا. Firebase Authentication وFirestore هما provider المطلوب؛ لا دخول وهمي ولا كلمات مرور في localStorage. لو Firebase غير مضبوط، التصفح يظل يعمل وتظهر رسالة إعداد صريحة للفورمات بدل نجاح مختلق. كل عضو يراجع ويشغل جزأه قبل العرض؛ لا نضيف ادعاء أنه نفذ جلسة الاختبارات.

## البنية المشتركة التي يديرها المنسق

`package.json`, lockfile, `pnpm-workspace.yaml`, `vite.config.js`, `vitest.config.js`, `tests/setup.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/app/router.jsx`, `src/constants/routes.js`, `src/utils/formatters.js`, `public/manus-routes.json`, Vercel/build config وTODO. كل الصفحات default export. React Router BrowserRouter عبر App؛ الروابط relative لـbasename. لا تضيفوا packages أو تغيروا هذه الملفات. كل طفل يقرأ ملفات عقده؛ لا يحتاج browser أو MCP.

## التصميم المشترك

لغة تصميم سوق جامعي humanist واضحة، لون forest green `#185B47`، accent ochre `#D9B35B`، خلفية ivory `#F7F6F0`، ink `#18342A`، muted `#586B61`. خطوط عربية `Noto Sans Arabic` مع fallback sans-serif؛ عناوين قوية ومساحات هادئة. المكونات قابلة للمس 44px، حواف 12px للبطاقات و8px للحقول، انتقالات hover 160ms واحترام reduced motion. لا emoji ولا gradients ولا ادعاءات أرقام نجاح حقيقية. الصور توضيحية وليست صور التيم ولا أدلة التنفيذ. الصور الأصلية الأربع قيد التجهيز؛ عناوينها الفعلية ستوضع في `src/data/imageAssets.js` بواسطة المنسق.

الملفات البصرية المشتركة: `src/styles/variables.css`, `src/styles/global.css`, `src/components/layout/{AppLayout,Navbar,Footer}.jsx`, `src/components/ui/{Button,FormField,EmptyState,LoadingState,SearchBar,ServiceCard}.jsx` تملكها وحدة ياسمين رجب. تحتاج بقية الوحدات استخدام API أدناه وعدم تعديلها.

CSS APIs عامة: `container`, `page-section`, `page-header`, `eyebrow`, `section-heading`, `card`, `panel`, `grid`, `service-grid`, `stack`, `row`, `muted`, `notice`, `notice-error`, `notice-success`, `badge`, `text-link`, `form-grid`, `field`, `field-error`, `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `empty-state`, `loading-state`. كل وحدة يمكنها CSS إضافي في ملفها فقط: `src/styles/auth.css`, `src/styles/services.css`, `src/styles/requests.css`.

## مسارات وصفحات الربط

`/` HomePage؛ `/services` ServicesPage؛ `/categories` CategoriesPage؛ `/search?q=&category=` SearchResultsPage؛ `/services/:serviceId` ServiceDetailsPage؛ `/request/:serviceId` ServiceRequestPage؛ `/login` LoginPage؛ `/register` RegisterPage؛ `/my-requests` MyRequestsPage؛ `/students/:studentId` StudentProfilePage. Unknown route يعرض EmptyState برابط الخدمات. عناوين زر طلب الخدمة تذهب للخدمة نفسها. profile الافتراضي العام `student-ahmed` عند عدم تسجيل الدخول، وليس fake user. لا تمنع التصفح العام إذا Firebase غير مضبوط. Login/Register يمكن أن يستخدم redirect داخلي validated مثل `/my-requests` أو `/request/id`، ويرفض URLs خارجية و`//`.

## بيانات الخدمات

وحدة ياسمين حسن تملك `src/data/services.js`, `src/constants/serviceCategories.js`, `src/features/services/**`, صفحات Services/Categories/SearchResults/ServiceDetails، `src/styles/services.css` و`tests/services.test.js`.

Exports في `src/data/services.js`: `services` (12 خدمة على الأقل، بيانات واضحة تجريبية), `students` (خمسة profiles تجريبية), `getServiceById(id)`, `getStudentById(id)`. خدمة shape:
`{id,title,category,description,price,unit,providerId,deliveryDays,tags,featured,imageKey}`. التصنيفات IDs `tutoring`, `design`, `printing` ويمكن إضافة `coding`, `translation`, `presentations` إذا يوجد بيانات. `imageKey` من tutoring/design/printing، mapping في `src/data/imageAssets.js`: export const imageAssets={hero:'...',tutoring:'...',design:'...',printing:'...'}؛ use `imageAssets[service.imageKey]`.

طالب shape `{id,name,initials,department,year,bio,email}`، emails تنتهي `.example` وموسومة تجريبية، لا تستعمل بيانات تواصل حقيقية لطلاب التيم. أول provider id `student-ahmed` حتى يعمل profile الافتراضي. `serviceCategories` array export من constants shape `{id,name,description,imageKey}`. خدمات filters pure export في `src/features/services/services/servicesService.js`: `filterServices(list,{query='',category='all',sort='recommended'}={})` و`getServices()` يرجع services؛ sort IDs `recommended`, `price-asc`, `price-desc`. البحث العربي يتجاهل الحركات والتطويل ويدعم أسماء التصنيفات. استخدم getServiceById للمعرف غير الموجود ولا fallback لخدمة عشوائية.

## APIs الخاصة بالحسابات

وحدة أحمد عيد تملك `src/lib/firebase/**`, `src/features/auth/**`, `src/features/profile/**`, Login/Register/StudentProfilePage، `src/styles/auth.css`, `.env.example`, `tests/auth.test.js`.

`src/lib/firebase/firebase.js` exports `firebaseApp`, `firebaseAuth`, `firebaseDb`, `isFirebaseConfigured`, `firebaseMode`, `firebaseConfigurationError`. متغيرات `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. لا server/admin credentials. Auth Provider export named `AuthProvider` من `src/features/auth/context/AuthContext.jsx`; hook named `useAuth` من `src/features/auth/hooks/useAuth.js` يرجع `{user,loading,authError,login,register,logout,isConfigured}`. register signature `register({name,email,password,department})`، login `login({email,password})`; user حقيقي Firebase User وdisplayName. user null حتى onAuthStateChanged ينجح. احمِ protected APIs من null user. استعمل Firebase modular SDK. Profile تعرض sample provider للمعرف العام، وبيانات الحساب للمستخدم الحقيقي uid إن تطابق؛ لا تدّعي sample profile أنه current logged-in user. أي form لا يتمكن من Firebase يعطي خطأ صريحًا، لا يعلن نجاحًا.

## APIs الخاصة بالفورمات والطلبات

وحدة مريم مصطفى تملك `src/features/requests/**`, ServiceRequestPage/MyRequestsPage، `src/utils/validators.js`, `src/styles/requests.css`, `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `.firebaserc`, `tests/validators.test.js`, `tests/requests.test.js`, `tests/firestore.rules.test.js`.

Validators exports `{validateEmail,validatePassword,validateRequest,validateRegistration}`. validateEmail/validatePassword ترجع boolean؛ password الحد الأدنى 8 حروف. validateRegistration({name,email,password,confirmPassword,department,terms}) ترجع object errors حسب field؛ validateRequest({name,email,contact,details,preferredDate,consent}) ترجع object errors. name 2-80 trimmed؛ email صحيح <=254؛ contact 5-120؛ details 20-2000؛ date مطلوب date-only غير ماضٍ؛ consent true. لا تضع PII في URL. شكل الطلب في Firestore `requests/{id}`: `{userId,serviceId,serviceTitle,name,email,contact,details,preferredDate,status:'pending',createdAt:serverTimestamp()}`؛ consent يحكم UI ولا يسجل ضمن الحقول إلا إذا تطلبت نسخة rules ذلك بشكل متطابق.

API named `createServiceRequest({user,service,form})`, `getUserRequests(userId)`, `cancelServiceRequest({requestId,userId})` في requestsService.js. الحفظ والسحب عبر Firestore فقط. لا تعلن نجاحًا أو تسجل طلبًا إذا فشل create. استعلام owner `where('userId','==',userId)` ثم sort client لتجنب composite index، مع معالجة permission/network failures. القواعد ترفض المستخدم غير المسجل، تمنع قراءة طلبات الآخرين، تقيّد الحقول وأنواعها وأطوالها والـUID والسعر/عنوانالخدمة client label ليس حقيقة مالية، تمنع update إلا transition pending→cancelled وتثبيت بقية الحقول، وتمنع delete. default deny لغير requests/profiles. إذا profiles محفوظة، read/write صاحب UID فقط ويمنع حقول أدوار admin. تفعيل emulator tests فقط بـRUN_FIREBASE_RULES_TESTS=1 وFIRESTORE_EMULATOR_HOST؛ لا يلمس الاختبار Cloud.

## APIs الخاصة بالمكونات العامة

`Button` default `{children,to,variant='primary',type='button',...props}` يصير Link إذا to وإلا button. `FormField` default `{label,id,error,hint,required,as='input',children,...props}` يدعم input/textarea/select وid/aria-describedby وaria-invalid؛ select يستقبل children options. `EmptyState` default `{title,description,actionLabel,actionTo}`؛ `LoadingState` default `{label}`. `SearchBar` default `{initialQuery='',initialCategory='all',compact=false}` فورم GET navigation إلى /search، مع label واضح. `ServiceCard` default `{service}` يستخدم بيانات الطالب وimageAssets. `AppLayout` default يضم Navbar/Footer وOutlet وskip link. الصفحة الرئيسية تستخدم services وserviceCategories وروابط حقيقية، ولا تضيف مزاعم مستخدمين/تقييمات.

## وحدة مصطفى أحمد: التحقق المستقل

بعد انتهاء وحدات التنفيذ الأربع، نفس الـworkflow يستدعي خامس subagent واحدًا **read-only** ليقرأ الـTODO والعقد ومكونات التطبيق ونتائج الاختبارات الموجودة، ويتحقق من الاتصال بين الأجزاء ومطابقة متطلبات المشروع. لا يغيّر source أو config أو Git ولا browser ولا database، ولا يرفع أو يعلن نشرًا. يمكنه تشغيل build/unit tests وقراءة المخرجات. يرجع issues محددة مع path/line/impact/fix وملخص requirement coverage وحالات Firebase/Vercel الحقيقية، ونص دليل مراجعة للفريق. المنسق يكتب تقريره ويصلح المشاكل المحددة فقط، ويضيف workflow CI والتوثيق النهائي في commit وحدة الاختبارات.

## الاختبارات وقيود الوكلاء

Dependencies مثبتة بواسطة المنسق؛ لا تثبتوا أو تغيروا package manifest. استخدم Vitest وTesting Library عند الحاجة؛ اختبار pure logic هو الافتراضي. `pnpm test --run tests/your-test.test.js` عند توفر الملف. لا تعملوا اختبارات على Firebase Cloud أو مستخدمين حقيقيين. لا تستخدموا browser أو MCP، ولا تزيدوا scope بمميزات دفع أو رفع ملفات أو إشعارات حقيقية. نفّذوا المطلوب في حدود الملفات المحددة واكتبوا تعليقات قصيرة مفيدة بالعربي حيث يفيد الشرح. جميع الإيميلات والصور والبيانات sample واضحة، والفريق يراجع قبل المناقشة.
