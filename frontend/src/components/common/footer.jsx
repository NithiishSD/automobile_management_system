import React from 'react';
import { Car, Phone, Mail, MapPin } from 'lucide-react';

const Footer = ({ navigateTo }) => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-6 w-6" />
              <span className="text-xl font-bold">AutoHub</span>
            </div>
            <p className="text-gray-400">Your trusted partner for buying and selling quality automobiles.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <FooterLink onClick={() => navigateTo('vehicles')}>Browse Vehicles</FooterLink>
              <FooterLink onClick={() => navigateTo('sell')}>Sell Your Vehicle</FooterLink>
              <FooterLink onClick={() => navigateTo('contact')}>Contact Us</FooterLink>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 234 567 8900</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@autohub.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Auto Street, City, State</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 AutoHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ children, onClick }) => (
  <button onClick={onClick} className="block text-gray-400 hover:text-white transition">
    {children}
  </button>
);

export default Footer;
