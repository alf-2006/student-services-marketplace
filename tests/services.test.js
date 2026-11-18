import { describe, expect, it } from 'vitest';
import { services, getServiceById } from '../src/data/services';
import { filterServices, normalizeArabic } from '../src/services/servicesService';

describe('منطق سوق الخدمات', () => {
  it('يضم بيانات كافية وثلاثة تصنيفات أساسية', () => {
    expect(services.length).toBeGreaterThanOrEqual(12);
    expect(new Set(services.map((service) => service.category))).toEqual(
      new Set(['tutoring', 'design', 'printing']),
    );
  });

  it('يبحث بالعنوان وباسم التصنيف العربي', () => {
    expect(filterServices(services, { query: 'تفاضل' }).map((service) => service.id)).toContain('tutoring-calculus');
    expect(filterServices(services, { query: 'تصميم' }).every((service) => service.category === 'design')).toBe(true);
  });

  it('يتجاهل الحركات والتطويل ويوحّد الألف في البحث العربي', () => {
    expect(normalizeArabic('إِنـفوجرافيك')).toBe('انفوجرافيك');
    expect(filterServices(services, { query: 'إِنـفوجرافيك' }).map((service) => service.id)).toEqual(['design-infographic']);
  });

  it('يطبّق تصنيفًا وترتيب السعر تصاعديًا وتنازليًا', () => {
    const printing = filterServices(services, { category: 'printing', sort: 'price-asc' });
    expect(printing.every((service) => service.category === 'printing')).toBe(true);
    expect(printing.map((service) => service.price)).toEqual([60, 75, 95]);
    expect(filterServices(services, { category: 'design', sort: 'price-desc' }).map((service) => service.price)).toEqual([350, 320, 280, 240]);
  });

  it('يعيد خدمة غير موجودة كقيمة undefined ولا يستبدلها بعنصر عشوائي', () => {
    expect(getServiceById('service-does-not-exist')).toBeUndefined();
  });
});
