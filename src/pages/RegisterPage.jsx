import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getSafeRedirect } from '../services/authService.js';
import { validateRegistration } from '../utils/validators.js';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '',
  terms: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { register, loading, authError, isConfigured } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const redirectCandidate = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search ?? ''}${location.state.from.hash ?? ''}`
    : searchParams.get('redirect');
  const redirectTo = getSafeRedirect(redirectCandidate, '/my-requests');

  function updateField(event) {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !isConfigured) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate(redirectTo, { replace: true });
    } catch {
      // الرسالة التي يضعها AuthContext توضح أيضًا حالة الحساب الجزئية عند فشل حفظ الملف.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container page-section auth-page">
      <div className="page-header">
        <p className="eyebrow">انضم إلى المجتمع</p>
        <h1>إنشاء حساب</h1>
        <p className="muted">أنشئ حسابًا حقيقيًا عبر Firebase لإدارة طلباتك وملفك.</p>
      </div>
      {!isConfigured && (
        <div className="notice notice-error" role="alert">
          إنشاء الحساب غير متاح قبل ضبط اتصال Firebase. لا يوجد حساب تجريبي أو دخول وهمي.
        </div>
      )}
      {authError && isConfigured && <div className="notice notice-error" role="alert">{authError}</div>}
      <form className="card auth-form stack" onSubmit={handleSubmit} noValidate>
        <FormField
          id="register-name"
          name="name"
          label="الاسم"
          autoComplete="name"
          value={form.name}
          onChange={updateField}
          error={errors.name}
          required
        />
        <FormField
          id="register-email"
          name="email"
          type="email"
          label="البريد الإلكتروني"
          autoComplete="email"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          required
        />
        <div className="form-grid">
          <FormField
            id="register-password"
            name="password"
            type="password"
            label="كلمة المرور"
            hint="8 أحرف على الأقل."
            autoComplete="new-password"
            value={form.password}
            onChange={updateField}
            error={errors.password}
            required
          />
          <FormField
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            label="تأكيد كلمة المرور"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={updateField}
            error={errors.confirmPassword}
            required
          />
        </div>
        <FormField
          id="register-department"
          name="department"
          label="القسم أو التخصص"
          autoComplete="organization-title"
          value={form.department}
          onChange={updateField}
          error={errors.department}
          required
        />
        <div className={`field ${errors.terms ? 'field--error' : ''}`}>
          <label className="checkbox-label" htmlFor="register-terms">
            <input id="register-terms" name="terms" type="checkbox" checked={form.terms} onChange={updateField} />
            <span>أوافق على استخدام المنصة لإدارة طلباتي وبيانات ملفي التعريفي.</span>
          </label>
          {errors.terms && <p className="field-error" id="register-terms-error" role="alert">{errors.terms}</p>}
        </div>
        <Button type="submit" disabled={loading || submitting || !isConfigured}>
          {submitting ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
        </Button>
        <p className="auth-form__footer">
          لديك حساب؟ <Link className="text-link" to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>سجّل الدخول</Link>
        </p>
      </form>
    </section>
  );
}
