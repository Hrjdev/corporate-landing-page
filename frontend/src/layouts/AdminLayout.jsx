import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Inbox, LogOut, Settings, Users, User } from 'lucide-react';
import axios from 'axios';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${baseUrl}/admin/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(response.data.count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadCount();

    // Periodically check for new messages every 15 seconds
    const interval = setInterval(fetchUnreadCount, 15000);
    window.addEventListener('messages_updated', fetchUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('messages_updated', fetchUnreadCount);
    };
  }, []);

  const role = localStorage.getItem('adminRole');
  const adminName = localStorage.getItem('adminName') || 'Yönetici';

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { name: 'Gelen Kutusu', path: '/admin/messages', icon: <Inbox className="w-5 h-5" />, end: false, badge: unreadCount > 0 ? unreadCount : null }
  ];

  if (role === 'SUPER_ADMIN') {
    navItems.push({ name: 'Yöneticiler', path: '/admin/users', icon: <Users className="w-5 h-5" />, end: false });
    navItems.push({ name: 'Sistem Ayarları', path: '/admin/settings', icon: <Settings className="w-5 h-5" />, end: false });
  }

  return (
    <div className="flex h-screen bg-brand-darker text-brand-text overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Hexagon className="h-8 w-8 text-brand-blue" />
          <span className="ml-3 text-xl font-bold text-white">Erbil<span className="text-brand-blue">Admin</span></span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-brand-blue text-white' : 'text-brand-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg mb-2">
            <div className="bg-brand-blue/20 p-2 rounded-full">
              <User className="w-5 h-5 text-brand-blue" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white truncate max-w-[120px]">{adminName}</span>
              <span className="text-xs text-brand-muted">{role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Editör'}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 bg-brand-dark border-b border-white/5 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center gap-2">
            <Hexagon className="h-6 w-6 text-brand-blue" />
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
