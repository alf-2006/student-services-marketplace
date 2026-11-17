export const ROUTES = {
  home: '/',
  services: '/services',
  categories: '/categories',
  search: '/search',
  login: '/login',
  register: '/register',
  myRequests: '/my-requests',
  serviceDetails: (id) => `/services/${encodeURIComponent(id)}`,
  serviceRequest: (id) => `/request/${encodeURIComponent(id)}`,
  studentProfile: (id) => `/students/${encodeURIComponent(id)}`,
};

export const pageRoutes = [
  { path: '/', title: 'الرئيسية' },
  { path: '/services', title: 'الخدمات' },
  { path: '/categories', title: 'التصنيفات' },
  { path: '/search', title: 'نتائج البحث' },
  { path: '/services/:serviceId', title: 'تفاصيل الخدمة' },
  { path: '/request/:serviceId', title: 'طلب خدمة' },
  { path: '/login', title: 'تسجيل الدخول' },
  { path: '/register', title: 'إنشاء حساب' },
  { path: '/my-requests', title: 'طلباتي' },
  { path: '/students/:studentId', title: 'ملف الطالب' },
];
