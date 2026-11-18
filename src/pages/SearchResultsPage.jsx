import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import ServiceCard from '../components/ui/ServiceCard';
import { ROUTES } from '../constants/routes';
import { serviceCategories } from '../constants/serviceCategories';
import { formatPrice } from '../utils/formatters';
import ServiceFilters from '../components/ui/ServiceFilters';
import { filterServices } from '../services/servicesService';
import '../styles/services.css';

function resultQuery(searchParams) {
  const params = new URLSearchParams();
  const query = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  return params.toString() ? `?${params.toString()}` : '';
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'recommended';
  const results = filterServices(undefined, { query, category, sort });
  const categoryName = serviceCategories.find((item) => item.id === category)?.name;
  const preserved = resultQuery(searchParams);

  return (
    <main className="page-section search-results-page">
      <div className="container">
        <header className="page-header search-results-page__header">
          <p className="eyebrow">بحث وفرز</p>
          <h1>نتائج البحث</h1>
          <p className="muted">
            {query ? `نتائج مطابقة لـ «${query}»` : 'استعرض كل الخدمات أو اكتب اسم الخدمة.'}
            {categoryName ? ` ضمن تصنيف ${categoryName}.` : ''}
          </p>
        </header>

        <SearchBar initialQuery={query} initialCategory={category} />
        <ServiceFilters query={query} category={category} sort={sort} action={ROUTES.search} />

        {results.length ? (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">مطابقة فعلية</p>
                <h2>{results.length} نتيجة</h2>
              </div>
              <Link className="text-link" to={ROUTES.categories}>تغيير التصنيف</Link>
            </div>
            <div className="service-grid" aria-label="نتائج البحث">
              {results.map((service) => (
                <div className="service-result-card" key={service.id}>
                  <ServiceCard service={service} />
                  <div className="service-result-card__footer">
                    <span className="muted">{formatPrice(service.price)} · {service.unit}</span>
                    <Link className="text-link" to={`${ROUTES.serviceDetails(service.id)}${preserved}`}>
                      فتح التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state search-results-page__empty" role="status">
            <h2>لم نعثر على نتائج</h2>
            <p>لا توجد خدمة تطابق البحث والتصنيف الحاليين. جرّب صياغة أبسط أو ابدأ من جديد.</p>
            <Link className="btn btn-primary" to={ROUTES.search}>مسح البحث والفلاتر</Link>
          </div>
        )}
      </div>
    </main>
  );
}
