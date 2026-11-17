import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import FormField from '../components/ui/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import { services, students, getStudentById } from '../data/services.js';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { getUserProfile, updateOwnProfile } from '../features/profile/profileService.js';

function validateProfile(form) {
  const errors = {};
  const nameLength = form.displayName.trim().length;
  if (nameLength < 2 || nameLength > 80) errors.displayName = 'الاسم يجب أن يكون بين حرفين و80 حرفًا.';
  if (form.department.trim().length > 120) errors.department = 'القسم يجب ألا يتجاوز 120 حرفًا.';
  return errors;
}

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [accountProfile, setAccountProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [form, setForm] = useState({ displayName: '', department: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isOwnProfile = Boolean(user?.uid && user.uid === studentId);
  const sampleStudent = useMemo(
    () => getStudentById(studentId) || students.find((student) => student.id === studentId),
    [studentId],
  );

  useEffect(() => {
    let active = true;
    if (!isOwnProfile) {
      setAccountProfile(null);
      setProfileError('');
      return undefined;
    }
    if (!isConfigured) {
      setProfileError('لا يمكن تحميل ملف الحساب قبل ضبط اتصال Firebase.');
      return undefined;
    }

    setProfileLoading(true);
    getUserProfile(user.uid)
      .then((profile) => {
        if (!active) return;
        const nextProfile = profile || {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          department: '',
        };
        setAccountProfile(nextProfile);
        setForm({ displayName: nextProfile.displayName || '', department: nextProfile.department || '' });
        setProfileError('');
      })
      .catch(() => {
        if (!active) return;
        setProfileError('تعذر تحميل بيانات ملفك من Firestore. لم نعرض بيانات تجريبية بدلًا منها.');
        setAccountProfile({ uid: user.uid, displayName: user.displayName || '', email: user.email || '', department: '' });
        setForm({ displayName: user.displayName || '', department: '' });
      })
      .finally(() => active && setProfileLoading(false));

    return () => {
      active = false;
    };
  }, [isOwnProfile, isConfigured, user]);

  const providerServices = services.filter((service) => service.providerId === studentId);

  async function handleSave(event) {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setFormErrors(nextErrors);
    setSaveMessage('');
    if (Object.keys(nextErrors).length > 0 || !user || !isConfigured) return;

    setSaving(true);
    try {
      const saved = await updateOwnProfile({ user, ...form });
      setAccountProfile((current) => ({ ...current, ...saved }));
      setSaveMessage('تم حفظ تعديلات ملفك فعليًا في Firestore.');
      setProfileError('');
    } catch (error) {
      setProfileError(error?.message || 'تعذر حفظ الملف التعريفي. لم نعلن نجاحًا غير مؤكد.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || (isOwnProfile && profileLoading)) return <LoadingState label="جارٍ تحميل الملف…" />;
  if (isOwnProfile && accountProfile) {
    return (
      <section className="container page-section profile-page">
        <div className="page-header">
          <p className="eyebrow">ملف الحساب</p>
          <h1>{accountProfile.displayName || 'ملفك التعريفي'}</h1>
          <p className="muted">هذه بيانات حسابك الحقيقية، وليست ملفًا تجريبيًا.</p>
        </div>
        {profileError && <div className="notice notice-error" role="alert">{profileError}</div>}
        {saveMessage && <div className="notice notice-success" role="status">{saveMessage}</div>}
        <form className="card profile-edit-form stack" onSubmit={handleSave}>
          <FormField
            id="profile-display-name"
            name="displayName"
            label="الاسم الظاهر"
            autoComplete="name"
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            error={formErrors.displayName}
            required
          />
          <FormField id="profile-email" label="البريد الإلكتروني" value={accountProfile.email || ''} readOnly hint="يُدار البريد من Firebase ولا يمكن تغييره هنا." />
          <FormField
            id="profile-department"
            name="department"
            label="القسم أو التخصص"
            value={form.department}
            onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
            error={formErrors.department}
          />
          <Button type="submit" disabled={saving || !isConfigured}>{saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}</Button>
        </form>
      </section>
    );
  }

  if (!sampleStudent) {
    return <section className="container page-section"><EmptyState title="الطالب غير موجود" description="لا يوجد ملف عام بهذا المعرّف." actionLabel="تصفّح الخدمات" actionTo="/services" /></section>;
  }

  return (
    <section className="container page-section profile-page">
      <div className="page-header">
        <p className="eyebrow">ملف عام تجريبي</p>
        <h1>{sampleStudent.name}</h1>
        <p className="muted">هذا الملف مقدم للعرض التجريبي، ولا يمثل حساب المستخدم المسجل حالياً.</p>
      </div>
      <div className="profile-layout">
        <article className="card profile-card">
          <div className="profile-avatar" aria-hidden="true">{sampleStudent.initials}</div>
          <p className="badge">بيانات تجريبية</p>
          <h2>{sampleStudent.name}</h2>
          <p>{sampleStudent.department} · {sampleStudent.year}</p>
          <p className="muted">{sampleStudent.bio}</p>
          <a className="text-link" href={`mailto:${sampleStudent.email}`}>التواصل عبر البريد التجريبي</a>
        </article>
        <div className="stack">
          <h2>الخدمات المقدمة</h2>
          {providerServices.length > 0 ? (
            <div className="grid service-grid">
              {providerServices.map((service) => <Link className="card text-link" key={service.id} to={`/services/${service.id}`}>{service.title}</Link>)}
            </div>
          ) : <p className="muted">لا توجد خدمات مرتبطة بهذا الملف حالياً.</p>}
        </div>
      </div>
    </section>
  );
}
