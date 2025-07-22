import axios from 'axios';

// Membuat instance axios yang sudah dikonfigurasi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Mengambil URL dasar API dari file .env
});

// "Interceptor" ini akan berjalan pada setiap permintaan sebelum dikirim
api.interceptors.request.use(
  (config) => {
    // Mengambil token dari localStorage
    const token = localStorage.getItem('token');
    
    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Kembalikan konfigurasi yang sudah diubah untuk dilanjutkan
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada persiapan request
    return Promise.reject(error);
  }
);

export default api;