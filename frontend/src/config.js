const config = {
  // If VITE_API_URL is set (like in production), use it.
  // Otherwise, default to your local backend (http://localhost:5001)
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
};

export default config;