import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { serviceCategories } from '../../constants/serviceCategories';
import Button from './Button';

export default function SearchBar({ initialQuery = '', initialCategory = 'all', compact = false }) {
  const navigate = useNavigate();
  const id = useId();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setCategory(initialCategory), [initialCategory]);

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category && category !== 'all') params.set('category', category);
    const queryString = params.toString();
    navigate(`${ROUTES.search}${queryString ? `?${queryString}` : ''}`);
  }

  return (
    <form className={['search-bar', compact ? 'search-bar-compact' : ''].filter(Boolean).join(' ')} onSubmit={handleSubmit} role="search">
      <div className="search-bar-input">
        <label htmlFor={`${id}-search`}>ابحث عن خدمة</label>
        <input id={`${id}-search`} name="q" type="search" value={query}
          onChange={(event) => setQuery(event.target.value)} placeholder="مثال: تصميم عرض تقديمي" />
      </div>
      <div className="search-bar-category">
        <label htmlFor={`${id}-category`}>التصنيف</label>
        <select id={`${id}-category`} name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">كل التصنيفات</option>
          {serviceCategories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </select>
      </div>
      <Button type="submit">بحث</Button>
    </form>
  );
}
