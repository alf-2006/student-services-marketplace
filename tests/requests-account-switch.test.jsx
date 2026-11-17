import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ user: { uid: 'first' }, getUserRequests: vi.fn(), cancelServiceRequest: vi.fn() }));
vi.mock('../src/features/auth/hooks/useAuth.js', () => ({ useAuth: () => ({ user: state.user, loading: false, isConfigured: true }) }));
vi.mock('../src/lib/firebase/firebase.js', () => ({ isFirebaseConfigured: true }));
vi.mock('../src/features/requests/requestsService.js', () => ({ getUserRequests: state.getUserRequests, cancelServiceRequest: state.cancelServiceRequest }));
import MyRequestsPage from '../src/pages/MyRequestsPage.jsx';
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }
const row = (id, title) => ({ id, serviceTitle: title, preferredDate: '2999-12-31', status: 'pending' });

describe('عزل الطلبات عند تبديل الحساب', () => {
  beforeEach(() => { vi.clearAllMocks(); state.user = { uid: 'first' }; });
  it('لا تستبدل استجابة الحساب القديم بيانات الحساب الجديد', async () => {
    const first = deferred(); const second = deferred();
    state.getUserRequests.mockImplementation((uid) => uid === 'first' ? first.promise : second.promise);
    const { rerender } = render(<MemoryRouter><MyRequestsPage /></MemoryRouter>);
    state.user = { uid: 'second' };
    rerender(<MemoryRouter><MyRequestsPage /></MemoryRouter>);
    await act(async () => { second.resolve([row('b', 'طلب الحساب الثاني')]); });
    expect(screen.getByText('طلب الحساب الثاني')).toBeInTheDocument();
    await act(async () => { first.resolve([row('a', 'طلب الحساب الأول')]); });
    expect(screen.queryByText('طلب الحساب الأول')).not.toBeInTheDocument();
    expect(screen.getByText('طلب الحساب الثاني')).toBeInTheDocument();
  });
  it('يخفي الطلبات المحملة فورًا عند تسجيل الخروج أو تبديل الحساب', async () => {
    const second = deferred();
    state.getUserRequests.mockImplementation((uid) => uid === 'first' ? Promise.resolve([row('a', 'طلب الحساب الأول')]) : second.promise);
    const { rerender } = render(<MemoryRouter><MyRequestsPage /></MemoryRouter>);
    expect(await screen.findByText('طلب الحساب الأول')).toBeInTheDocument();
    state.user = { uid: 'second' };
    rerender(<MemoryRouter><MyRequestsPage /></MemoryRouter>);
    expect(screen.queryByText('طلب الحساب الأول')).not.toBeInTheDocument();
    state.user = null;
    rerender(<MemoryRouter><MyRequestsPage /></MemoryRouter>);
    await act(async () => { second.resolve([row('b', 'طلب الحساب الثاني')]); });
    expect(screen.queryByText('طلب الحساب الثاني')).not.toBeInTheDocument();
    expect(screen.getByText('سجّل الدخول لرؤية طلباتك')).toBeInTheDocument();
  });
});
