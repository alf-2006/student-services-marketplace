import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ user: null, getProfile: vi.fn(), saveProfile: vi.fn() }));
vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: () => ({ user: state.user, loading: false, isConfigured: true }),
}));
vi.mock('../src/services/profileService.js', () => ({
  getUserProfile: state.getProfile,
  updateOwnProfile: state.saveProfile,
}));
import StudentProfilePage from '../src/pages/StudentProfilePage.jsx';

function profilePage(studentId = 'account') {
  return (
    <MemoryRouter initialEntries={['/students/' + studentId]}>
      <Routes><Route path="/students/:studentId" element={<StudentProfilePage />} /></Routes>
    </MemoryRouter>
  );
}

const profile = {
  uid: 'account', displayName: 'طالب اختبار', email: 'student@example.com', department: 'حاسبات',
};

describe('الملف الشخصي المبسط', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.user = { ...profile };
    state.getProfile.mockResolvedValue(profile);
  });

  it('يمنع القسم الأطول من الحد المسموح قبل إرسال التعديل', async () => {
    render(profilePage());
    const field = await screen.findByLabelText('القسم أو التخصص');
    fireEvent.change(field, { target: { value: 'س'.repeat(101) } });
    fireEvent.click(screen.getByRole('button', { name: 'حفظ التعديلات' }));
    expect(screen.getByText('القسم يجب ألا يتجاوز 100 حرف.')).toBeInTheDocument();
    expect(state.saveProfile).not.toHaveBeenCalled();
    await waitFor(() => expect(field).toHaveFocus());
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('يعرض خدمات الطالب ببطاقات ذات وصف وسعر وروابط تفاصيل بدل العناوين الضيقة', () => {
    state.user = null;
    render(profilePage('student-ahmed'));
    expect(screen.getAllByRole('main')).toHaveLength(1);
    const cards = document.querySelectorAll('.profile-service-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('h3')).not.toBeNull();
    expect(cards[0].querySelector('p')).not.toBeNull();
    expect(cards[0]).toHaveAttribute('href', '/services/tutoring-calculus');
    expect(cards[0]).toHaveTextContent('180 جنيه');
  });

  it('لا يعرض استجابة ملف قديم بعد تسجيل الخروج', async () => {
    let finishLoading;
    state.getProfile.mockImplementation(() => new Promise((resolve) => { finishLoading = resolve; }));
    const { rerender } = render(profilePage());
    state.user = null;
    rerender(profilePage());
    await act(async () => { finishLoading(profile); });
    expect(screen.queryByText('طالب اختبار')).not.toBeInTheDocument();
    expect(screen.getByText('الطالب غير موجود')).toBeInTheDocument();
  });
});
