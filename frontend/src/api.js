import axios from 'axios';

// Ambil URL API dari environment variable yang sudah Anda atur di Vercel.
// Jika tidak ada (saat development di laptop), gunakan alamat localhost sebagai cadangan.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Membuat instance axios yang sudah dikonfigurasi
const api = axios.create({
  baseURL: API_URL,
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
