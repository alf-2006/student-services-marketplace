import { useEffect, useState } from 'react';
import { serviceCategories } from '../../constants/serviceCategories';
import { useNavigate } from 'react-router-dom';

export default function ServiceFilters({ query = '', category = 'all', sort = 'recommended', action = '/search' }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSort, setSelectedSort] = useState(sort);
  useEffect(() => setSelectedCategory(category), [category]);
  useEffect(() => setSelectedSort(sort), [sort]);

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedSort !== 'recommended') params.set('sort', selectedSort);
    navigate(`${action}${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <form className="service-filters panel" method="get" action={action} onSubmit={handleSubmit}>
      <div className="service-filters__heading">
        <h2>تضييق النتائج</h2>
        <p className="muted">اختَر تصنيفًا أو رتّب الأسعار، ثم طبّق الفلتر.</p>
      </div>
      <div className="form-grid service-filters__fields">
        <label className="field" htmlFor={`${action.replace(/\W/g, '-')}-category`}>
          <span>التصنيف</span>
          <select id={`${action.replace(/\W/g, '-')}-category`} name="category" value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="all">كل التصنيفات</option>
            {serviceCategories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="field" htmlFor={`${action.replace(/\W/g, '-')}-sort`}>
          <span>الترتيب</span>
          <select id={`${action.replace(/\W/g, '-')}-sort`} name="sort" value={selectedSort}
            onChange={(event) => setSelectedSort(event.target.value)}>
            <option value="recommended">المقترحة أولًا</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
          </select>
        </label>
      </div>
      {query ? <input type="hidden" name="q" value={query} readOnly /> : null}
      <button className="btn btn-secondary" type="submit">تطبيق الفلاتر</button>
    </form>
  );
}
