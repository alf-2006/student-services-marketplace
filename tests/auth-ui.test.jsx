import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn() }));
vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: () => ({ user: state.user, loading: false, isConfigured: true, authError: null, login: state.login, register: state.register, logout: state.logout }),
}));
import RegisterPage from '../src/pages/RegisterPage.jsx';
import LoginPage from '../src/pages/LoginPage.jsx';
import Navbar from '../src/components/layout/Navbar.jsx';

function open(component) {
  render(<MemoryRouter>{component}</MemoryRouter>);
}

function completeRegistration() {
  fireEvent.change(screen.getByLabelText('الاسم', { exact: false }), { target: { value: 'طالب اختبار' } });
  fireEvent.change(screen.getByLabelText('البريد الإلكتروني', { exact: false }), { target: { value: 'student@example.test' } });
  fireEvent.change(screen.getByLabelText('كلمة المرور', { exact: false, selector: '#register-password' }), { target: { value: 'test12345' } });
  fireEvent.change(screen.getByLabelText('تأكيد كلمة المرور', { exact: false }), { target: { value: 'test12345' } });
  fireEvent.change(screen.getByLabelText('القسم أو التخصص', { exact: false }), { target: { value: 'حاسبات' } });
}

describe('وصول نماذج الحساب والتنقل', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.user = null;
    state.logout.mockResolvedValue();
  });

  it('يربط خطأ الموافقة بالحقل وينقل الفوكس إليه عندما يكون الخطأ الوحيد', async () => {
    open(<RegisterPage />);
    completeRegistration();
    fireEvent.click(screen.getByRole('button', { name: 'إنشاء الحساب' }));
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby', 'register-terms-error');
    await waitFor(() => expect(checkbox).toHaveFocus());
    expect(state.register).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('أوافق على استخدام المنصة لإدارة طلباتي وبيانات ملفي التعريفي.'));
    expect(checkbox).toBeChecked();
    expect(checkbox).not.toHaveAttribute('aria-describedby');
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('ينقل فوكس الدخول إلى أول حقل خاطئ ولا يرسل بيانات ناقصة', async () => {
    open(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول' }));
    await waitFor(() => expect(screen.getByLabelText('البريد الإلكتروني', { exact: false })).toHaveFocus());
    expect(state.login).not.toHaveBeenCalled();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('يعيد الفوكس إلى زر القائمة بعد Escape من رابط داخلها', () => {
    open(<Navbar />);
    const toggle = screen.getByRole('button', { name: 'فتح القائمة' });
    fireEvent.click(toggle);
    screen.getByRole('link', { name: 'الخدمات' }).focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('يعرض زر خروج للحساب المسجل ويستدعي خدمة المصادقة', async () => {
    state.user = { uid: 'account', displayName: 'طالب اختبار' };
    open(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));
    await waitFor(() => expect(state.logout).toHaveBeenCalledTimes(1));
    await screen.findByRole('button', { name: 'تسجيل الخروج' });
  });

  it('يعلن فشل تسجيل الخروج ولا يخفيه عن المستخدم', async () => {
    state.user = { uid: 'account', displayName: 'طالب اختبار' };
    state.logout.mockRejectedValue(new Error('network error'));
    open(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الخروج' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('تعذر تسجيل الخروج. حاول مجددًا.');
  });
});
