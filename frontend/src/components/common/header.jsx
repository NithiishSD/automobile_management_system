import React, { useState } from 'react';
import { Car, Menu, X, User, ShoppingCart, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/Authcontext';

const Header = ({ navigateTo, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigateTo('home');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <Car className="h-8 w-8" />
            <span className="text-2xl font-bold">AutoHub</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink onClick={() => handleNavClick('home')} active={currentPage === 'home'}>
              Home
            </NavLink>
            <NavLink onClick={() => handleNavClick('vehicles')} active={currentPage === 'vehicles'}>
              Vehicles
            </NavLink>
            <NavLink onClick={() => handleNavClick('sell')} active={currentPage === 'sell'}>
              Sell Vehicle
            </NavLink>
            <NavLink onClick={() => handleNavClick('contact')} active={currentPage === 'contact'}>
              Contact
            </NavLink>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={() => handleNavClick('orders')} className="flex items-center space-x-2 hover:text-blue-200 transition">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Orders</span>
                </button>
                <button onClick={() => handleNavClick('profile')} className="flex items-center space-x-2 hover:text-blue-200 transition">
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </button>
                <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-blue-200 transition">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button onClick={() => handleNavClick('login')} className="flex items-center space-x-2 bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-600">
            <div className="flex flex-col space-y-3">
              <MobileNavLink onClick={() => handleNavClick('home')}>Home</MobileNavLink>
              <MobileNavLink onClick={() => handleNavClick('vehicles')}>Vehicles</MobileNavLink>
              <MobileNavLink onClick={() => handleNavClick('sell')}>Sell Vehicle</MobileNavLink>
              <MobileNavLink onClick={() => handleNavClick('contact')}>Contact</MobileNavLink>
              {user ? (
                <>
                  <MobileNavLink onClick={() => handleNavClick('orders')}>Orders</MobileNavLink>
                  <MobileNavLink onClick={() => handleNavClick('profile')}>Profile</MobileNavLink>
                  <MobileNavLink onClick={handleLogout}>Logout</MobileNavLink>
                </>
              ) : (
                <MobileNavLink onClick={() => handleNavClick('login')}>Login</MobileNavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const NavLink = ({ children, onClick, active }) => (
  <button onClick={onClick} className={`font-medium hover:text-blue-200 transition ${active ? 'text-blue-200 border-b-2 border-blue-200' : ''}`}>
    {children}
  </button>
);

const MobileNavLink = ({ children, onClick }) => (
  <button onClick={onClick} className="text-left py-2 hover:text-blue-200 transition">
    {children}
  </button>
);

export default Header;
