import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 3000,
            theme: { primary: 'green', secondary: 'black' },
          },
        }}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;