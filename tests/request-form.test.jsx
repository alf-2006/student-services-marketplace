import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  createRequest: vi.fn(),
  user: { uid: 'test-student', displayName: 'طالب اختبار', email: 'student@example.com' },
}));
vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: state.user,
    loading: false,
    isConfigured: true,
  }),
}));
vi.mock('../src/firebase.js', () => ({ isFirebaseConfigured: true }));
vi.mock('../src/services/requestsService.js', () => ({ createServiceRequest: state.createRequest }));
import ServiceRequestPage from '../src/pages/ServiceRequestPage.jsx';

function openForm(serviceId = 'tutoring-calculus') {
  render(
    <MemoryRouter initialEntries={['/request/' + serviceId]}>
      <Routes><Route path="/request/:serviceId" element={<ServiceRequestPage />} /></Routes>
    </MemoryRouter>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('وسيلة التواصل المفضلة', { exact: false }), {
    target: { value: 'student@example.com' },
  });
  fireEvent.change(screen.getByLabelText('التاريخ المفضل', { exact: false }), {
    target: { value: '2999-12-31' },
  });
  fireEvent.change(screen.getByLabelText('تفاصيل الطلب', { exact: false }), {
    target: { value: 'أحتاج إلى شرح مفصل مع أمثلة عملية في هذا المقرر.' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
}

describe('نموذج الطلب المبسط', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.createRequest.mockResolvedValue({ id: 'saved-test-request' });
  });

  it('يقرأ الحقول وخانة الموافقة ويعلن النجاح بعد الحفظ فقط', async () => {
    openForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'إرسال الطلب' }));
    expect(await screen.findByText('تم حفظ طلبك بنجاح برقم saved-test-request.')).toBeInTheDocument();
    expect(state.createRequest).toHaveBeenCalledWith(expect.objectContaining({
      form: expect.objectContaining({ consent: true, preferredDate: '2999-12-31', contact: 'student@example.com' }),
    }));
  });

  it('لا يرسل البيانات الناقصة إلى Firebase', () => {
    openForm();
    fireEvent.click(screen.getByRole('button', { name: 'إرسال الطلب' }));
    expect(screen.getByText('راجع الحقول المميزة بالأخطاء ثم أرسل النموذج مجددًا.')).toBeInTheDocument();
    expect(state.createRequest).not.toHaveBeenCalled();
  });

  it('يربط خطأ الموافقة بالحقل ويضع الفوكس عليه إذا كانت بقية البيانات صحيحة', async () => {
    openForm();
    fillForm();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'إرسال الطلب' }));
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-describedby', 'request-consent-error');
    await waitFor(() => expect(checkbox).toHaveFocus());
    expect(state.createRequest).not.toHaveBeenCalled();
  });

  it('لا يظهر نجاحًا عند فشل الحفظ', async () => {
    state.createRequest.mockRejectedValue(new Error('network error'));
    openForm();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'إرسال الطلب' }));
    expect(await screen.findByText(/تعذر حفظ الطلب بسبب مشكلة في الاتصال/)).toBeInTheDocument();
    expect(screen.queryByText(/تم حفظ طلبك بنجاح/)).not.toBeInTheDocument();
  });

  it('لا يعرض فورمًا لخدمة غير موجودة', () => {
    openForm('not-a-service');
    expect(screen.getByText('الخدمة غير موجودة')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'إرسال الطلب' })).not.toBeInTheDocument();
  });
});
