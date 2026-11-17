import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateRequest,
} from '../src/utils/validators.js';

const futureDate = '2999-12-31';

describe('validators', () => {
  it('يتحقق من البريد وكلمة المرور الأساسية', () => {
    expect(validateEmail('student@example.com')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail(`${'a'.repeat(250)}@x.com`)).toBe(false);
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('1234567')).toBe(false);
  });

  it('يعيد أخطاء التسجيل حسب الحقل', () => {
    const errors = validateRegistration({
      name: 'أ',
      email: 'bad',
      password: 'short',
      confirmPassword: 'different',
      department: '',
      terms: false,
    });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining([
      'name', 'email', 'password', 'confirmPassword', 'department', 'terms',
    ]));
  });

  it('يقبل طلبًا مكتملًا بتاريخ اليوم أو المستقبل', () => {
    expect(validateRequest({
      name: 'طالب جامعي',
      email: 'student@example.com',
      contact: 'student@example.com',
      details: 'أحتاج إلى جلسة شرح مفصلة لموضوع المقرر مع أمثلة عملية.',
      preferredDate: futureDate,
      consent: true,
    })).toEqual({});
  });

  it('يرفض تفاصيل قصيرة وتاريخًا ماضيًا وموافقة ناقصة', () => {
    const errors = validateRequest({
      name: 'طالب جامعي',
      email: 'student@example.com',
      contact: '12345',
      details: 'قصير',
      preferredDate: '2000-01-01',
      consent: false,
    });
    expect(errors.details).toBeTruthy();
    expect(errors.preferredDate).toBeTruthy();
    expect(errors.consent).toBeTruthy();
  });
});
