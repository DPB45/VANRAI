import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast'; // <-- 1. Import Toaster

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {/* --- 2. Add Toaster component here --- */}
      <Toaster
        position="top-center" // Where the toasts appear
        reverseOrder={false}  // Default order
        toastOptions={{
          // Default options for specific types
          success: {
            duration: 3000, // Show success toasts for 3 seconds
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      {/* ------------------------------------ */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Your pages render here */}
      </main>
      <Footer />
    </div>
  );
}

export default App;