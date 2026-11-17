const managedImageAssets = {
  hero: '/manus-storage/async-images/zPSwUj3sk4dooT5lBbvU8V/image-1.webp',
  tutoring: '/manus-storage/async-images/zPSwUj3sk4dooT5lBbvU8V/image-2.webp',
  design: '/manus-storage/async-images/zPSwUj3sk4dooT5lBbvU8V/image-3.webp',
  printing: '/manus-storage/async-images/zPSwUj3sk4dooT5lBbvU8V/image-4.webp',
};

// Vercel وسيرفر الجامعة لا يقدمان مسارات تخزين منصة التطوير.
export const imageAssets = import.meta.env.VITE_PORTABLE_ASSETS === 'true'
  ? { hero: '/images/hero.webp', tutoring: '/images/tutoring.webp', design: '/images/design.webp', printing: '/images/printing.webp' }
  : managedImageAssets;
