import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../src/components/ui/SearchBar';
import ServiceFilters from '../src/features/services/ServiceFilters';
import AppLayout from '../src/components/layout/AppLayout';
import HomePage from '../src/pages/HomePage';
import { serviceCategories } from '../src/constants/serviceCategories';

vi.mock('../src/features/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: null, loading: false, isConfigured: false }) }));
function SearchHarness() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  return <>
    <SearchBar initialQuery={params.get('q') || ''} initialCategory={params.get('category') || 'all'} />
    <button onClick={() => navigate(-1)}>السابق</button><button onClick={() => navigate(1)}>التالي</button>
  </>;
}

describe('إصلاحات البحث والتخطيط', () => {
  it('يعرض التصنيفات الفعلية فقط', () => {
    render(<MemoryRouter><SearchBar /></MemoryRouter>);
    const select = screen.getByLabelText('التصنيف');
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['all', ...serviceCategories.map((item) => item.id)]);
  });
  it('يتزامن البحث مع الرجوع والتقدم في تاريخ المتصفح', () => {
    render(<MemoryRouter initialEntries={['/search?q=طباعة&category=printing', '/search?q=تصميم&category=design']} initialIndex={1}><SearchHarness /></MemoryRouter>);
    expect(screen.getByLabelText('ابحث عن خدمة')).toHaveValue('تصميم');
    fireEvent.click(screen.getByText('السابق'));
    expect(screen.getByLabelText('ابحث عن خدمة')).toHaveValue('طباعة');
    expect(screen.getByLabelText('التصنيف')).toHaveValue('printing');
    fireEvent.click(screen.getByText('التالي'));
    expect(screen.getByLabelText('ابحث عن خدمة')).toHaveValue('تصميم');
    expect(screen.getByLabelText('التصنيف')).toHaveValue('design');
  });
  it('يتزامن التصنيف والترتيب عند تغيير props القادمة من المسار', () => {
    const { rerender } = render(<MemoryRouter><ServiceFilters category="design" sort="price-asc" /></MemoryRouter>);
    expect(screen.getByLabelText('التصنيف')).toHaveValue('design');
    rerender(<MemoryRouter><ServiceFilters category="printing" sort="price-desc" /></MemoryRouter>);
    expect(screen.getByLabelText('التصنيف')).toHaveValue('printing');
    expect(screen.getByLabelText('الترتيب')).toHaveValue('price-desc');
  });
  it('يوجد main واحد في الصفحة الرئيسية وفي صفحة داخلية', () => {
    const { unmount } = render(<MemoryRouter><Routes><Route element={<AppLayout />}><Route index element={<HomePage />} /></Route></Routes></MemoryRouter>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'انتقل إلى المحتوى الرئيسي' })).toHaveAttribute('href', '#main-content');
    unmount();
    render(<MemoryRouter><Routes><Route element={<AppLayout />}><Route index element={<main><h1>صفحة داخلية</h1></main>} /></Route></Routes></MemoryRouter>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
