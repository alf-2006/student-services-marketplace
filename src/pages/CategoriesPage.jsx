import { Link } from 'react-router-dom';
import { serviceCategories } from '../constants/serviceCategories';
import { services } from '../data/services';
import { ROUTES } from '../constants/routes';
import { imageAssets } from '../data/imageAssets';
import '../styles/services.css';

export default function CategoriesPage() {
  return (
    <main className="page-section categories-page">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">طريقة أخرى للاستكشاف</p>
          <h1>اختَر تصنيفًا يناسب المطلوب</h1>
          <p className="muted">كل بطاقة تقود إلى نتائج هذا التصنيف مباشرة، والبيانات المعروضة تجريبية للتوضيح.</p>
        </header>

        <div className="category-grid">
          {serviceCategories.map((category) => {
            const count = services.filter((service) => service.category === category.id).length;
            return (
              <article className="category-card card" key={category.id}>
                <img src={imageAssets[category.imageKey]} alt="" className="category-card__image" />
                <div className="category-card__body">
                  <p className="eyebrow">{count} خدمات تجريبية</p>
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                  <Link className="btn btn-secondary" to={`${ROUTES.search}?category=${encodeURIComponent(category.id)}`}>
                    تصفّح {category.name}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <section className="panel categories-page__note" aria-labelledby="category-note-title">
          <h2 id="category-note-title">كيف تختار؟</h2>
          <p>ابدأ بالتصنيف الأقرب لمهمتك، ثم استخدم صفحة النتائج للبحث باسم الخدمة أو ترتيب الأسعار.</p>
          <Link className="text-link" to={ROUTES.services}>عرض كل الخدمات</Link>
        </section>
      </div>
    </main>
  );
}
