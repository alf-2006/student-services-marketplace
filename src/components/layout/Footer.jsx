import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { services } from '../../data/services';

const sampleServiceId = services[0]?.id || 'sample-service';

const footerLinks = [
  { to: ROUTES.home, label: 'الرئيسية' },
  { to: ROUTES.services, label: 'الخدمات' },
  { to: ROUTES.categories, label: 'التصنيفات' },
  { to: ROUTES.search, label: 'نتائج البحث' },
  { to: ROUTES.login, label: 'تسجيل الدخول' },
  { to: ROUTES.register, label: 'إنشاء حساب' },
  { to: ROUTES.myRequests, label: 'طلباتي' },
  { to: ROUTES.studentProfile('student-ahmed'), label: 'ملف طالب مقدم خدمة' },
  { to: ROUTES.serviceDetails(sampleServiceId), label: 'تفاصيل خدمة' },
  { to: ROUTES.serviceRequest(sampleServiceId), label: 'طلب خدمة' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="eyebrow">مساحة للتعاون</p>
          <h2>خدمات طلابية أقرب لاحتياجك.</h2>
          <p className="footer-note">المحتوى والخدمات الظاهرة الآن بيانات تجريبية للتوضيح، وليست عروضًا أو تقييمات حقيقية.</p>
        </div>
        <nav aria-label="روابط صفحات السوق">
          <h3>استكشف السوق</h3>
          <ul className="footer-links">
            {footerLinks.map((link) => <li key={`${link.to}-${link.label}`}><Link to={link.to}>{link.label}</Link></li>)}
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom"><span>سوق خدمات الطلبة</span><span>نسخة تجريبية قابلة للتطوير</span></div>
    </footer>
  );
}
