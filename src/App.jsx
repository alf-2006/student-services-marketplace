import { useEffect } from 'react';
import { BrowserRouter, matchPath, useLocation } from 'react-router-dom';
import AppRouter from './app/router';
import { pageRoutes } from './constants/routes';

function PageEffects() {
  const location = useLocation();
  useEffect(() => {
    const page = pageRoutes.find((route) => matchPath({ path: route.path, end: true }, location.pathname));
    document.title = `${page?.title || 'الصفحة غير موجودة'} | سوق خدمات الطلبة`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
  return <BrowserRouter basename={basename}><PageEffects /><AppRouter /></BrowserRouter>;
}
