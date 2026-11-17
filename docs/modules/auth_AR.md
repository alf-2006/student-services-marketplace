# دليل وحدة الحسابات والملفات التعريفية

تملك هذه الوحدة تهيئة Firebase modular، وتسجيل الدخول والتسجيل والخروج، وملف الطالب العام والحساب الحقيقي. يقرأ التطبيق متغيرات `VITE_FIREBASE_*` من بيئة Vite فقط. عند غياب أي متغير، يبقى `user` بقيمة `null` وتظهر رسالة إعداد صريحة؛ لا يوجد مستخدم Preview أو نجاح وهمي.

## الواجهات الأساسية

- `src/lib/firebase/firebase.js`: يصدّر `firebaseApp` و`firebaseAuth` و`firebaseDb` و`isFirebaseConfigured` و`firebaseMode` و`firebaseConfigurationError`.
- `AuthProvider` من `src/features/auth/context/AuthContext.jsx` و`useAuth` من `src/features/auth/hooks/useAuth.js`. يعرض الـhook حالة `{user, loading, authError, login, register, logout, isConfigured}`.
- `src/features/auth/authService.js`: يوفّر `getSafeRedirect` الذي يقبل مسارًا داخليًا يبدأ بشرطة واحدة فقط، ويحوّل أخطاء Firebase المعروفة إلى رسائل عربية دون كشف تفاصيل داخلية.
- `src/features/profile/profileService.js`: يقرأ ويكتب `profiles/{uid}` مع التحقق من وجود المستخدم، ويكتب الحد الأدنى `{uid, displayName, email, department, createdAt}`. لا يأخذ `uid` من نموذج المستخدم.

## التشغيل والإعداد

فعّل مزود Email/Password في Firebase Authentication، وأنشئ قاعدة Firestore وقواعدها المقيدة بمالك الوثيقة، ثم أضف القيم الست في `.env.local`. أعد تشغيل Vite بعد تغيير البيئة. لا تُحفظ كلمات المرور في URL أو `localStorage`، ولا تُرفع ملفات البيئة الحقيقية إلى Git.

الملف العام `student-ahmed` بيانات تجريبية مستقلة من كتالوج الخدمات. عند زيارة `/students/{uid}` بعد تسجيل الدخول، يظهر الحساب الحقيقي ويُتاح تعديله؛ لا يُستبدل بملف تجريبي. إذا نجح إنشاء حساب Firebase وفشل حفظ ملف Firestore، تعرض الصفحة رسالة جزئية واضحة بأن الحساب أُنشئ فعلًا ولا تدّعي فشل الإنشاء.

## الاختبار

اختبار الوحدة في `tests/auth.test.js` يختبر التوجيه الداخلي الآمن وتحويل أخطاء Firebase دون اتصال سحابي. لا تعتمد اختبارات هذه الوحدة على مستخدم أو مشروع Firebase حقيقي.
