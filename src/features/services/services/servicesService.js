import { serviceCategories } from '../../../constants/serviceCategories';
import { services } from '../../../data/services';

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ALEF_VARIANTS = /[أإآٱ]/g;

/**
 * يزيل الحركات والتطويل ويوحّد أشكال الألف حتى تكون نتائج البحث العربية ثابتة.
 */
export function normalizeArabic(value = '') {
  return String(value)
    .normalize('NFKC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/ـ/g, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('ar');
}

function categoryByValue(value) {
  if (!value || value === 'all') return null;
  const normalized = normalizeArabic(value);
  return serviceCategories.find(
    (category) => category.id === value || normalizeArabic(category.name) === normalized,
  );
}

export function filterServices(list = services, { query = '', category = 'all', sort = 'recommended' } = {}) {
  const source = Array.isArray(list) ? list : [];
  const normalizedQuery = normalizeArabic(query);
  const selectedCategory = categoryByValue(category);

  const filtered = source.filter((service) => {
    const matchesCategory = !category || category === 'all'
      ? true
      : selectedCategory
        ? service.category === selectedCategory.id
        : false;

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const serviceCategory = serviceCategories.find((item) => item.id === service.category);
    const searchableText = [service.title, serviceCategory?.name].filter(Boolean).join(' ');
    return normalizeArabic(searchableText).includes(normalizedQuery);
  });

  if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
  return filtered;
}

export function getServices() {
  return services;
}
