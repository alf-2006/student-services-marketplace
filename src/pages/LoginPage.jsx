import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getSafeRedirect } from '../services/authService.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import '../styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loading, authError, isConfigured } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const redirectCandidate = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search ?? ''}${location.state.from.hash ?? ''}`
    : searchParams.get('redirect');
  const redirectTo = getSafeRedirect(redirectCandidate, '/my-requests');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!validateEmail(form.email)) nextErrors.email = 'اكتب بريدًا إلكترونيًا صحيحًا.';
    if (!validatePassword(form.password)) nextErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const formElement = event.currentTarget;
      requestAnimationFrame(() => formElement.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    if (!isConfigured) return;

    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch {
      // يعرض authError الرسالة العامة دون كشف تفاصيل Firebase الداخلية.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container page-section auth-page">
      <div className="page-header">
        <p className="eyebrow">حسابك في السوق</p>
        <h1>تسجيل الدخول</h1>
        <p className="muted">ادخل بحسابك للوصول إلى طلباتك وملفك التعريفي.</p>
      </div>
      {!isConfigured && (
        <div className="notice notice-error" role="alert">
          تسجيل الدخول غير متاح قبل ضبط اتصال Firebase. يمكنك متابعة تصفح الخدمات العامة.
        </div>
      )}
      {authError && isConfigured && <div className="notice notice-error" role="alert">{authError}</div>}
      <form className="card auth-form stack" onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-email"
          name="email"
          type="email"
          label="البريد الإلكتروني"
          autoComplete="email"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          required
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="كلمة المرور"
          autoComplete="current-password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          required
        />
        <Button type="submit" disabled={loading || submitting || !isConfigured}>
          {submitting ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
        </Button>
        <p className="auth-form__footer">
          ليس لديك حساب؟ <Link className="text-link" to={`/register?redirect=${encodeURIComponent(redirectTo)}`}>أنشئ حسابًا</Link>
        </p>
      </form>
    </main>
  );
}
