import { Link, useParams, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { ROUTES } from '../constants/routes';
import { serviceCategories } from '../constants/serviceCategories';
import { getServiceById, getStudentById } from '../data/services';
import { imageAssets } from '../data/imageAssets';
import { formatPrice } from '../utils/formatters';
import '../styles/services.css';

function preserveContext(searchParams) {
  const params = new URLSearchParams();
  const query = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  return params.toString() ? `?${params.toString()}` : '';
}

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const service = getServiceById(serviceId);

  if (!service) {
    return (
      <main className="page-section">
        <div className="container">
          <EmptyState
            title="الخدمة غير موجودة"
            description="المعرّف المطلوب لا يطابق خدمة متاحة. يمكنك العودة إلى القائمة والاختيار من البيانات التجريبية."
            actionLabel="العودة إلى الخدمات"
            actionTo={ROUTES.services}
          />
        </div>
      </main>
    );
  }

  const provider = getStudentById(service.providerId);
  const category = serviceCategories.find((item) => item.id === service.category);
  const context = preserveContext(searchParams);
  const requestPath = `${ROUTES.serviceRequest(service.id)}${context}`;

  return (
    <main className="page-section service-details-page">
      <div className="container">
        <Link className="text-link service-details-page__back" to={`${ROUTES.services}${context}`}>العودة إلى الخدمات</Link>
        <article className="service-details card">
          <div className="service-details__media">
            <img src={imageAssets[service.imageKey]} alt="" />
            <span className="badge">{category?.name || 'خدمة'}</span>
          </div>
          <div className="service-details__body">
            <p className="eyebrow">تفاصيل خدمة تجريبية</p>
            <h1>{service.title}</h1>
            <p className="service-details__description">{service.description}</p>
            <dl className="service-facts">
              <div><dt>السعر</dt><dd>{formatPrice(service.price)}</dd></div>
              <div><dt>الوحدة</dt><dd>{service.unit}</dd></div>
              <div><dt>مدة التسليم المتوقعة</dt><dd>{service.deliveryDays} أيام</dd></div>
            </dl>
            <div className="service-details__provider panel">
              <div>
                <p className="eyebrow">مقدم الخدمة</p>
                {provider ? (
                  <Link className="text-link service-details__provider-name" to={ROUTES.studentProfile(provider.id)}>
                    {provider.name}
                  </Link>
                ) : <p>بيانات مقدم الخدمة غير متاحة.</p>}
              </div>
              <p className="notice">التواصل المعروض تجريبي فقط، والبريد ينتهي بـ <span dir="ltr">.example</span> ولا يمثل قناة حقيقية.</p>
              {provider ? <p className="muted" dir="ltr">{provider.email}</p> : null}
            </div>
            <div className="service-details__actions">
              <Link className="btn btn-primary" to={requestPath}>طلب هذه الخدمة</Link>
              <Link className="btn btn-ghost" to={`${ROUTES.search}${context}`}>مقارنة نتائج مشابهة</Link>
            </div>
          </div>
        </article>

        <section className="panel service-details__faq" aria-labelledby="faq-title">
          <h2 id="faq-title">قبل إرسال الطلب</h2>
          <ul>
            <li>اكتب في نموذج الطلب ما تحتاجه بوضوح وحدد الموعد المفضل.</li>
            <li>السعر ومدة التسليم هنا بيانات تجريبية قابلة للمراجعة قبل أي حفظ فعلي.</li>
            <li>لا تُرسل بيانات شخصية حساسة؛ استخدم بيئة Firebase المضبوطة فقط عند توفرها.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
