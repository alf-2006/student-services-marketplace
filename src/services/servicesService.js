import { serviceCategories } from '../constants/serviceCategories';
import { services } from '../data/services';

// نوحّد النص العربي حتى يجد البحث «إنفوجرافيك» و«انفوجرافيك» بنفس الطريقة.
export function normalizeArabic(value = '') {
  let result = String(value).normalize('NFKC');
  result = result.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  result = result.replace(/ـ/g, '');
  result = result.replace(/[أإآٱ]/g, 'ا');
  result = result.replace(/\s+/g, ' ');
  return result.trim().toLocaleLowerCase('ar');
}

export function filterServices(list = services, options = {}) {
  if (!Array.isArray(list)) return [];

  const query = normalizeArabic(options.query || '');
  const category = options.category || 'all';
  const sort = options.sort || 'recommended';
  let results = [...list];

  // 1. نختار الخدمات التابعة للتصنيف المطلوب.
  if (category !== 'all') {
    const selectedCategory = serviceCategories.find(function (item) {
      return item.id === category || normalizeArabic(item.name) === normalizeArabic(category);
    });
    if (!selectedCategory) return [];
    results = results.filter(function (service) {
      return service.category === selectedCategory.id;
    });
  }

  // 2. نبحث في عنوان الخدمة واسم التصنيف.
  if (query) {
    results = results.filter(function (service) {
      const serviceCategory = serviceCategories.find(function (item) {
        return item.id === service.category;
      });
      const categoryName = serviceCategory ? serviceCategory.name : '';
      const searchText = normalizeArabic(service.title + ' ' + categoryName);
      return searchText.includes(query);
    });
  }

  // 3. نرتب نسخة من النتائج دون تغيير البيانات الأصلية.
  if (sort === 'price-asc') {
    results.sort(function (first, second) {
      return first.price - second.price;
    });
  }
  if (sort === 'price-desc') {
    results.sort(function (first, second) {
      return second.price - first.price;
    });
  }
  return results;
}

export function getServices() {
  return services;
}
