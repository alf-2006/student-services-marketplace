import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Button from '../src/components/ui/Button';
import FormField from '../src/components/ui/FormField';
import SearchBar from '../src/components/ui/SearchBar';

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, authError: null, isConfigured: false }),
}));

function LocationOutput() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

describe('مكونات الواجهة المشتركة', () => {
  it('يربط FormField التسمية بالحقل ويعلن الخطأ', () => {
    render(<FormField id="details" label="التفاصيل" hint="اكتب ما تحتاجه" error="هذا الحقل مطلوب" required />);
    const input = screen.getByLabelText(/التفاصيل/);
    expect(input).toHaveAttribute('id', 'details');
    expect(input).toHaveAttribute('aria-describedby', 'details-hint details-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('هذا الحقل مطلوب');
  });

  it('يعرض Button كرابط عند تمرير to ويقبل حالة التعطيل', () => {
    render(<MemoryRouter><Button to="/services" disabled>الخدمات</Button></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'الخدمات' });
    expect(link).toHaveAttribute('href', '/services');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('ينقل نموذج البحث إلى المسار مع query وcategory', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="*" element={<><SearchBar initialCategory="all" /><LocationOutput /></>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText('ابحث عن خدمة'), { target: { value: 'تصميم' } });
    fireEvent.change(screen.getByLabelText('التصنيف'), { target: { value: 'design' } });
    fireEvent.submit(screen.getByRole('search'));
    expect(screen.getByTestId('location')).toHaveTextContent('/search?q=%D8%AA%D8%B5%D9%85%D9%8A%D9%85&category=design');
  });
});
