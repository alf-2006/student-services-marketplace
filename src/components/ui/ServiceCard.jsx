import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { getStudentById } from '../../data/services';
import { imageAssets } from '../../data/imageAssets';
import { formatPrice } from '../../utils/formatters';
import Button from './Button';

export default function ServiceCard({ service }) {
  if (!service) return null;
  const provider = getStudentById(service.providerId);
  const providerName = provider?.name || 'مقدم خدمة تجريبي';
  const image = imageAssets[service.imageKey] || imageAssets.hero;

  return (
    <article className="service-card card">
      <Link className="service-card-image-link" to={ROUTES.serviceDetails(service.id)} aria-label={`عرض تفاصيل ${service.title}`}>
        <img className="service-card-image" src={image} alt="" />
      </Link>
      <div className="service-card-body">
        <div className="row service-card-meta">
          <span className="badge">بيانات تجريبية</span>
          <span className="muted">{service.deliveryDays} أيام</span>
        </div>
        <h3 className="service-card-title"><Link to={ROUTES.serviceDetails(service.id)}>{service.title}</Link></h3>
        <p className="service-card-description">{service.description}</p>
        <p className="service-card-provider"><span className="muted">مقدم الخدمة:</span> <Link to={ROUTES.studentProfile(service.providerId)}>{providerName}</Link></p>
        <div className="service-card-footer">
          <strong className="service-card-price">{formatPrice(service.price)} <span>{service.unit}</span></strong>
          <Button to={ROUTES.serviceRequest(service.id)} variant="secondary">اطلب الخدمة</Button>
        </div>
      </div>
    </article>
  );
}
