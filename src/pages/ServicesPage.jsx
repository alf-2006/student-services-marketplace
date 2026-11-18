import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import ServiceCard from '../components/ui/ServiceCard';
import { ROUTES } from '../constants/routes';
import { serviceCategories } from '../constants/serviceCategories';
import { formatPrice } from '../utils/formatters';
import ServiceFilters from '../components/ui/ServiceFilters';
import { filterServices } from '../services/servicesService';
import '../styles/services.css';

function preservedSearch(searchParams) {
  const params = new URLSearchParams();
  const query = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  const value = params.toString();
  return value ? `?${value}` : '';
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'recommended';
  const results = filterServices(undefined, { query, category, sort });
  const categoryName = serviceCategories.find((item) => item.id === category)?.name;
  const querySuffix = preservedSearch(searchParams);

  return (
    <main className="page-section services-page">
      <div className="container">
        <header className="page-header">
          <p className="eyebrow">سوق خدمات الطلبة</p>
          <h1>خدمات تساعدك في يومك الجامعي</h1>
          <p className="muted">تصفّح بيانات تجريبية واضحة، وقارن السعر والوحدة ومدة التسليم قبل فتح التفاصيل.</p>
        </header>

        <section className="services-page__search" aria-label="البحث في الخدمات">
          <SearchBar initialQuery={query} initialCategory={category} />
        </section>
        <ServiceFilters query={query} category={category} sort={sort} action={ROUTES.services} />

        <div className="section-heading services-page__summary">
          <div>
            <p className="eyebrow">{categoryName || 'كل التصنيفات'}</p>
            <h2>{results.length} خدمة متاحة للتصفح</h2>
          </div>
          <Link className="text-link" to={`${ROUTES.search}${querySuffix}`}>فتح صفحة النتائج المتقدمة</Link>
        </div>

        {results.length ? (
          <div className="service-grid" aria-label="قائمة الخدمات">
            {results.map((service) => (
              <div className="service-result-card" key={service.id}>
                <ServiceCard service={service} />
                <div className="service-result-card__footer">
                  <span className="muted">{formatPrice(service.price)} · {service.unit}</span>
                  <Link className="text-link" to={`${ROUTES.serviceDetails(service.id)}${querySuffix}`}>
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" role="status">
            <h2>لا توجد خدمات بهذا الاختيار</h2>
            <p>جرّب كلمة أخرى أو أعد التصنيف إلى كل التصنيفات.</p>
            <Link className="btn btn-secondary" to={ROUTES.services}>إعادة ضبط البحث</Link>
          </div>
        )}
      </div>
    </main>
  );
}
