import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import { services, getStudentById } from '../data/services.js';
import { useAuth } from '../hooks/useAuth.js';
import { getUserProfile, updateOwnProfile } from '../services/profileService.js';

function AccountProfile({ user, isConfigured }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ displayName: '', department: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let ignoreResult = false;

    async function loadProfile() {
      const fallback = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        department: '',
      };
      setLoading(true);
      setError('');

      try {
        if (!isConfigured) throw new Error('لا يمكن تحميل ملف الحساب قبل ضبط اتصال Firebase.');
        const savedProfile = await getUserProfile(user.uid);
        if (ignoreResult) return;
        const currentProfile = savedProfile || fallback;
        setProfile(currentProfile);
        setForm({ displayName: currentProfile.displayName || '', department: currentProfile.department || '' });
      } catch (loadError) {
        if (ignoreResult) return;
        setProfile(fallback);
        setForm({ displayName: fallback.displayName, department: '' });
        setError(isConfigured
          ? 'تعذر تحميل بيانات ملفك من Firestore. لم نعرض بيانات تجريبية بدلًا منها.'
          : loadError.message);
      } finally {
        if (!ignoreResult) setLoading(false);
      }
    }

    loadProfile();
    return () => { ignoreResult = true; };
  }, [user.uid, user.displayName, user.email, isConfigured]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: '' }));
    setSaveMessage('');
  }

  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;
    const errors = {};
    const nameLength = form.displayName.trim().length;
    if (nameLength < 2 || nameLength > 80) {
      errors.displayName = 'الاسم يجب أن يكون بين حرفين و80 حرفًا.';
    }
    if (form.department.trim().length > 100) {
      errors.department = 'القسم يجب ألا يتجاوز 100 حرف.';
    }
    setFormErrors(errors);
    setSaveMessage('');
    if (Object.keys(errors).length > 0 || !isConfigured) return;

    setSaving(true);
    try {
      const saved = await updateOwnProfile({ user, ...form });
      setProfile((current) => ({ ...current, ...saved }));
      setSaveMessage('تم حفظ تعديلات ملفك فعليًا في Firestore.');
      setError('');
    } catch (saveError) {
      setError(saveError.message || 'تعذر حفظ الملف التعريفي. لم نعلن نجاحًا غير مؤكد.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="جارٍ تحميل الملف…" />;

  return (
    <section className="container page-section profile-page">
      <div className="page-header">
        <p className="eyebrow">ملف الحساب</p>
        <h1>{profile.displayName || 'ملفك التعريفي'}</h1>
        <p className="muted">هذه بيانات حسابك الحقيقية، وليست ملفًا تجريبيًا.</p>
      </div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {saveMessage && <div className="notice notice-success" role="status">{saveMessage}</div>}
      <form className="card profile-edit-form stack" onSubmit={handleSave} noValidate>
        <FormField
          id="profile-display-name"
          name="displayName"
          label="الاسم الظاهر"
          autoComplete="name"
          value={form.displayName}
          onChange={updateField}
          error={formErrors.displayName}
          required
        />
        <FormField
          id="profile-email"
          label="البريد الإلكتروني"
          value={profile.email || ''}
          readOnly
          hint="يُدار البريد من Firebase ولا يمكن تغييره هنا."
        />
        <FormField
          id="profile-department"
          name="department"
          label="القسم أو التخصص"
          value={form.department}
          onChange={updateField}
          error={formErrors.department}
        />
        <Button type="submit" disabled={saving || !isConfigured}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
        </Button>
      </form>
    </section>
  );
}

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const { user, loading, isConfigured } = useAuth();
  const student = getStudentById(studentId);

  if (loading) return <LoadingState label="جارٍ تحميل الملف…" />;

  if (user && user.uid === studentId) {
    // قائمة بيانات جديدة لكل حساب؛ لا تنتقل بيانات الحساب السابق للحساب الجديد.
    return <AccountProfile key={user.uid} user={user} isConfigured={isConfigured} />;
  }

  if (!student) {
    return (
      <section className="container page-section">
        <EmptyState
          title="الطالب غير موجود"
          description="لا يوجد ملف عام بهذا المعرّف."
          actionLabel="تصفّح الخدمات"
          actionTo="/services"
        />
      </section>
    );
  }

  const providerServices = services.filter((service) => service.providerId === studentId);

  return (
    <section className="container page-section profile-page">
      <div className="page-header">
        <p className="eyebrow">ملف عام تجريبي</p>
        <h1>{student.name}</h1>
        <p className="muted">هذا الملف مقدم للعرض التجريبي، ولا يمثل حساب المستخدم المسجل حالياً.</p>
      </div>
      <div className="profile-layout">
        <article className="card profile-card">
          <div className="profile-avatar" aria-hidden="true">{student.initials}</div>
          <p className="badge">بيانات تجريبية</p>
          <h2>{student.name}</h2>
          <p>{student.department} · {student.year}</p>
          <p className="muted">{student.bio}</p>
          <a className="text-link" href={`mailto:${student.email}`}>التواصل عبر البريد التجريبي</a>
        </article>
        <div className="stack">
          <h2>الخدمات المقدمة</h2>
          {providerServices.length > 0 ? (
            <div className="grid service-grid">
              {providerServices.map((service) => (
                <Link className="card text-link" key={service.id} to={`/services/${service.id}`}>
                  {service.title}
                </Link>
              ))}
            </div>
          ) : <p className="muted">لا توجد خدمات مرتبطة بهذا الملف حالياً.</p>}
        </div>
      </div>
    </section>
  );
}
