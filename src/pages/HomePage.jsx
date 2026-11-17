import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { services } from '../data/services';
import { serviceCategories } from '../constants/serviceCategories';
import { imageAssets } from '../data/imageAssets';
import SearchBar from '../components/ui/SearchBar';
import ServiceCard from '../components/ui/ServiceCard';
import Button from '../components/ui/Button';

export default function HomePage() {
  const featuredServices = services.filter((service) => service.featured).slice(0, 6);

  return (
    <main>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-content">
            <p className="eyebrow">سوق جامعي إنساني</p>
            <h1>مهارة من طالب،<br /><span>حلّ لطالب.</span></h1>
            <p className="home-hero-lead">اكتشف خدمات عملية يقدمها طلاب لطلاب، من الدروس الخصوصية إلى التصميم والطباعة، في مساحة واضحة وسهلة التصفح.</p>
            <div className="row home-hero-actions">
              <Button to={ROUTES.services}>تصفح كل الخدمات</Button>
              <Button to={ROUTES.categories} variant="secondary">استكشف التصنيفات</Button>
            </div>
            <p className="home-sample-note">الخدمات ومقدموها بيانات تجريبية للتوضيح. حسابك وطلباتك يستخدمان Firebase الحقيقي عند تفعيل الاتصال.</p>
          </div>
          <div className="home-hero-visual">
            <img src={imageAssets.hero} alt="مساحة عمل جامعية تمثل التعاون وتبادل المهارات" />
            <div className="hero-caption"><span>مساحة واحدة</span><strong>للمهارات التي تعرفها الجامعة</strong></div>
          </div>
        </div>
      </section>

      <section className="container page-section home-search-section" aria-labelledby="search-heading">
        <div className="section-heading">
          <div><p className="eyebrow">ابدأ من احتياجك</p><h2 id="search-heading">ما الخدمة التي تبحث عنها؟</h2></div>
          <Link className="text-link" to={ROUTES.search}>عرض نتائج البحث</Link>
        </div>
        <SearchBar />
      </section>

      <section className="container page-section" aria-labelledby="categories-heading">
        <div className="section-heading"><div><p className="eyebrow">مسارات واضحة</p><h2 id="categories-heading">تصفح حسب التصنيف</h2></div><Link className="text-link" to={ROUTES.categories}>كل التصنيفات</Link></div>
        <div className="category-grid">
          {serviceCategories.map((category) => (
            <Link className="category-card card" key={category.id} to={`${ROUTES.search}?category=${encodeURIComponent(category.id)}`}>
              <img src={imageAssets[category.imageKey] || imageAssets.hero} alt="" />
              <span className="category-card-body"><strong>{category.name}</strong><span>{category.description}</span><span className="category-card-link">استكشف التصنيف</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container page-section" aria-labelledby="featured-heading">
        <div className="section-heading"><div><p className="eyebrow">اختيارات البداية</p><h2 id="featured-heading">خدمات مميزة للتجربة</h2></div><Link className="text-link" to={ROUTES.services}>كل الخدمات</Link></div>
        {featuredServices.length ? <div className="service-grid">{featuredServices.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <p className="notice">لا توجد خدمات مميزة مضافة بعد.</p>}
      </section>
    </main>
  );
}
