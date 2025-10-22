import React, { useState } from 'react';
import { AuthProvider } from './context/Authcontext';
import Header from './components/common/header';
import Footer from './components/common/footer';
import HomePage from './pages/homepage';
import VehiclesPage from './pages/vehicles';
import VehicleDetailsPage from './pages/vehicle_detailes_page';
import LoginPage from './pages/loginpage';
import RegisterPage from './pages/registerpage';
import ProfilePage from './pages/profilepage';
import OrdersPage from './pages/orderspage';
import SellVehiclePage from './pages/sellvehiclepage';
import ContactPage from './pages/contactPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const viewVehicleDetails = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setCurrentPage('vehicle-details');
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header navigateTo={navigateTo} currentPage={currentPage} />
        
        <main className="flex-grow">
          {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
          {currentPage === 'vehicles' && <VehiclesPage viewVehicleDetails={viewVehicleDetails} />}
          {currentPage === 'vehicle-details' && <VehicleDetailsPage vehicleId={selectedVehicleId} navigateTo={navigateTo} />}
          {currentPage === 'login' && <LoginPage navigateTo={navigateTo} />}
          {currentPage === 'register' && <RegisterPage navigateTo={navigateTo} />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'orders' && <OrdersPage viewVehicleDetails={viewVehicleDetails} />}
          {currentPage === 'sell' && <SellVehiclePage navigateTo={navigateTo} />}
          {currentPage === 'contact' && <ContactPage />}
        </main>
        
        <Footer navigateTo={navigateTo} />
      </div>
    </AuthProvider>
  );
}

export default App;
