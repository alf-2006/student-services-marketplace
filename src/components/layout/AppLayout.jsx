import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى الرئيسي</a>
      <Navbar />
      <div id="main-content" tabIndex="-1"><Outlet /></div>
      <Footer />
    </div>
  );
}
