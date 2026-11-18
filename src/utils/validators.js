const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isRealDateOnly(value) {
  if (!DATE_ONLY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function todayDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateEmail(value) {
  const email = text(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function validatePassword(value) {
  return typeof value === 'string' && value.length >= 8;
}

export function validateRegistration({
  name,
  email,
  password,
  confirmPassword,
  department,
  terms,
} = {}) {
  const errors = {};
  const cleanName = text(name);
  const cleanEmail = text(email);
  const cleanDepartment = text(department);

  if (cleanName.length < 2 || cleanName.length > 80) {
    errors.name = 'اكتب اسمًا من حرفين إلى 80 حرفًا.';
  }
  if (!validateEmail(cleanEmail)) {
    errors.email = 'اكتب بريدًا إلكترونيًا صحيحًا.';
  }
  if (!validatePassword(password)) {
    errors.password = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'تأكيد كلمة المرور غير مطابق.';
  }
  if (!cleanDepartment) {
    errors.department = 'اكتب التخصص أو القسم الدراسي.';
  }
  if (terms !== true) {
    errors.terms = 'يجب الموافقة على الشروط للمتابعة.';
  }

  return errors;
}

export function validateRequest({
  name,
  email,
  contact,
  details,
  preferredDate,
  consent,
} = {}) {
  const errors = {};
  const cleanName = text(name);
  const cleanEmail = text(email);
  const cleanContact = text(contact);
  const cleanDetails = text(details);
  const cleanDate = text(preferredDate);

  if (cleanName.length < 2 || cleanName.length > 80) {
    errors.name = 'اكتب اسمًا من حرفين إلى 80 حرفًا.';
  }
  if (!validateEmail(cleanEmail)) {
    errors.email = 'اكتب بريدًا إلكترونيًا صحيحًا.';
  }
  if (cleanContact.length < 5 || cleanContact.length > 120) {
    errors.contact = 'اكتب وسيلة تواصل من 5 إلى 120 حرفًا.';
  }
  if (cleanDetails.length < 20 || cleanDetails.length > 2000) {
    errors.details = 'اكتب تفاصيل الطلب من 20 إلى 2000 حرف.';
  }
  if (!isRealDateOnly(cleanDate) || cleanDate < todayDateOnly()) {
    errors.preferredDate = 'اختر تاريخًا صحيحًا اليوم أو بعده.';
  }
  if (consent !== true) {
    errors.consent = 'يجب الموافقة على مشاركة بيانات الطلب مع مقدم الخدمة.';
  }

  return errors;
}
