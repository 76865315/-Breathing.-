import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Settings, Bell, Moon, Shield,
  HelpCircle, LogOut, ChevronRight, Heart
} from 'lucide-react';
import { useStore } from '../context/store';
import techniques from '../data/breathing-techniques.json';

function Profile() {
  const navigate = useNavigate();
  const { user, logout, favorites, onboardingAnswers } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const favoriteTechniques = techniques.techniques.filter(t =>
    favorites.includes(t.id)
  );

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage reminders',
      action: () => {}
    },
    {
      icon: Moon,
      label: 'Appearance',
      description: 'Dark mode, themes',
      action: () => {}
    },
    {
      icon: Shield,
      label: 'Privacy',
      description: 'Data and security',
      action: () => {}
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'FAQ, contact us',
      action: () => {}
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h1>
        <p className="text-gray-500 flex items-center justify-center">
          <Mail className="h-4 w-4 mr-1" />
          {user?.email}
        </p>
      </div>

      {/* Preferences Summary */}
      {onboardingAnswers && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary-600" />
            Your Preferences
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Goal</span>
              <span className="text-gray-900 capitalize">
                {onboardingAnswers.goal.replace(/-/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Experience</span>
              <span className="text-gray-900 capitalize">{onboardingAnswers.experience}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Daily time</span>
              <span className="text-gray-900">{onboardingAnswers.duration} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Favorites */}
      {favoriteTechniques.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Favorite Techniques
          </h2>
          <div className="space-y-2">
            {favoriteTechniques.map((technique) => (
              <button
                key={technique.id}
                onClick={() => navigate(`/techniques/${technique.id}`)}
                className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <span className="text-gray-900">{technique.name}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="card !p-0">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Log Out</span>
      </button>

      {/* Version */}
      <p className="text-center text-xs text-gray-400">
        Breathe v1.0.0
      </p>
    </div>
  );
}

export default Profile;
