import { Outlet, NavLink } from 'react-router-dom';
import { Home, Wind, BarChart3, User } from 'lucide-react';

function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/techniques', icon: Wind, label: 'Techniques' },
    { to: '/progress', icon: BarChart3, label: 'Progress' },
    { to: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="pb-20 px-4 pt-4 max-w-2xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-bottom">
        <div className="max-w-2xl mx-auto flex justify-around">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Layout;
