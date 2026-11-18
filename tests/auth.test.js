import { describe, expect, it } from 'vitest';
import { getSafeRedirect, mapAuthError } from '../src/services/authService.js';

describe('خدمات الحساب الآمنة', () => {
  it('يقبل مسارًا داخليًا ويحافظ على query وhash', () => {
    expect(getSafeRedirect('/request/service-1?step=contact#form', '/services')).toBe('/request/service-1?step=contact#form');
  });

  it('يرفض الروابط الخارجية ومسارات protocol-relative', () => {
    expect(getSafeRedirect('https://evil.example/login', '/services')).toBe('/services');
    expect(getSafeRedirect('//evil.example/login', '/services')).toBe('/services');
    expect(getSafeRedirect('javascript:alert(1)', '/services')).toBe('/services');
    expect(getSafeRedirect('/\\evil.example', '/services')).toBe('/services');
    expect(getSafeRedirect('/%2F%2Fevil.example/login', '/services')).toBe('/services');
  });

  it('يرفض fallback غير الداخلي أيضًا', () => {
    expect(getSafeRedirect('', 'https://evil.example')).toBe('/');
    expect(getSafeRedirect('', '//evil.example')).toBe('/');
  });

  it('يحول رموز Firebase المعروفة إلى رسائل عربية عامة', () => {
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toContain('بالفعل');
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toContain('غير صحيحة');
    expect(mapAuthError({ code: 'auth/network-request-failed' })).toContain('الاتصال');
    expect(mapAuthError({ code: 'auth/unknown', message: 'secret internals' })).not.toContain('secret internals');
  });
});
