import React from 'react';
import { Car, DollarSign, Heart } from 'lucide-react';
import FeatureCard from '../components/common/featurecard';

const HomePage = ({ navigateTo }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Dream Vehicle</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Quality cars and bikes at competitive prices</p>
            <button 
              onClick={() => navigateTo('vehicles')} 
              className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Browse Vehicles
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AutoHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Car />} 
              title="Wide Selection" 
              description="Choose from hundreds of quality vehicles" 
            />
            <FeatureCard 
              icon={<DollarSign />} 
              title="Best Prices" 
              description="Competitive pricing on all vehicles" 
            />
            <FeatureCard 
              icon={<Heart />} 
              title="Quality Assured" 
              description="All vehicles thoroughly inspected" 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Sell Your Vehicle?</h2>
          <p className="text-xl mb-8 text-blue-100">Get the best value for your car or bike</p>
          <button 
            onClick={() => navigateTo('sell')} 
            className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
          >
            Sell Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
