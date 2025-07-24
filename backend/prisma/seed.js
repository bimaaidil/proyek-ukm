// Mengimpor library yang dibutuhkan
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // Menghapus semua data lama untuk menghindari duplikat
  await prisma.ukm.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Data lama berhasil dihapus.');

  // 1. Membuat satu user admin sebagai pemilik semua data
  const hashedPassword = await bcrypt.hash('admin123', 10); // Password: admin123
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Disperindagkop',
      email: 'admin@pekanbaru.go.id',
      password: hashedPassword,
      role: 'admin',
      nik: '0000000000000000', // PERBAIKAN: Menambahkan NIK unik untuk admin
    },
  });
  console.log(`User admin berhasil dibuat dengan ID: ${adminUser.id}`);

  // 2. Menyiapkan data UKM contoh yang realistis
  const ukmData = [
    // 10 USAHA MIKRO
    { nama_usaha: 'Warung Kopi Bahagia', nama_pemilik: 'Budi Santoso', alamat: 'Jl. Merdeka No. 10, Pekanbaru', kategori_usaha: 'Kuliner', nomor_telepon: '081234567890', modal_usaha: 75000000, klasifikasi: 'Usaha Mikro', latitude: 0.5283, longitude: 101.4451 },
    { nama_usaha: 'Bolu Kemojo Riau Berkah', nama_pemilik: 'Ibu Maimunah', alamat: 'Jl. HR. Soebrantas, Panam', kategori_usaha: 'Kuliner', nomor_telepon: '085211223344', modal_usaha: 250000000, klasifikasi: 'Usaha Mikro', latitude: 0.4704, longitude: 101.3884 },
    { nama_usaha: 'Laundy Kiloan "Bersih Cepat"', nama_pemilik: 'Suryani', alamat: 'Jl. Delima, Panam, Pekanbaru', kategori_usaha: 'Jasa', nomor_telepon: '082255667788', modal_usaha: 50000000, klasifikasi: 'Usaha Mikro', latitude: 0.4821, longitude: 101.4058 },
    { nama_usaha: 'Catering "Dapur Bunda"', nama_pemilik: 'Linda Wati', alamat: 'Jl. Kaharuddin Nasution, Marpoyan Damai', kategori_usaha: 'Kuliner', nomor_telepon: '081311112222', modal_usaha: 450000000, klasifikasi: 'Usaha Mikro', latitude: 0.4746, longitude: 101.4552 },
    { nama_usaha: 'Pangkas Rambut "Rapi"', nama_pemilik: 'Ucok', alamat: 'Jl. Durian, Sukajadi', kategori_usaha: 'Jasa', nomor_telepon: '082198765432', modal_usaha: 25000000, klasifikasi: 'Usaha Mikro', latitude: 0.5186, longitude: 101.4284 },
    { nama_usaha: 'Jual Pulsa & Aksesoris HP', nama_pemilik: 'Eko', alamat: 'Simpang Tiga, Bukit Raya', kategori_usaha: 'Perdagangan', nomor_telepon: '085288889999', modal_usaha: 15000000, klasifikasi: 'Usaha Mikro', latitude: 0.4679, longitude: 101.4701 },
    { nama_usaha: 'Keripik Nenas "Rasa Khas"', nama_pemilik: 'Desi', alamat: 'Jl. Yos Sudarso, Rumbai', kategori_usaha: 'Kuliner', nomor_telepon: '081233334444', modal_usaha: 120000000, klasifikasi: 'Usaha Mikro', latitude: 0.5684, longitude: 101.4468 },
    { nama_usaha: 'Warung Sarapan Pagi Lontong Medan', nama_pemilik: 'Bu Siregar', alamat: 'Jl. Paus, Marpoyan Damai', kategori_usaha: 'Kuliner', nomor_telepon: '082155556666', modal_usaha: 90000000, klasifikasi: 'Usaha Mikro', latitude: 0.4938, longitude: 101.4323 },
    { nama_usaha: 'Songket & Tenun Melayu Indah', nama_pemilik: 'Rizki Amelia', alamat: 'Kawasan Pasar Bawah, Pekanbaru', kategori_usaha: 'Kerajinan', nomor_telepon: '081388990011', modal_usaha: 900000000, klasifikasi: 'Usaha Mikro', latitude: 0.5401, longitude: 101.4505 },
    { nama_usaha: 'Servis Elektronik "Solder Panas"', nama_pemilik: 'Wawan', alamat: 'Jl. Hang Tuah, Pekanbaru', kategori_usaha: 'Jasa', nomor_telepon: '085312341234', modal_usaha: 65000000, klasifikasi: 'Usaha Mikro', latitude: 0.5255, longitude: 101.4649 },
    
    // 10 USAHA KECIL
    { nama_usaha: 'Bengkel Motor Harapan Jaya', nama_pemilik: 'Joko Susilo', alamat: 'Jl. Paus, Rumbai', kategori_usaha: 'Jasa', nomor_telepon: '082144556677', modal_usaha: 1500000000, klasifikasi: 'Usaha Kecil', latitude: 0.5732, longitude: 101.4398 },
    { nama_usaha: 'Distro Lokal "Anak Nongkrong"', nama_pemilik: 'Andi Pratama', alamat: 'Jl. Arifin Achmad, Pekanbaru', kategori_usaha: 'Fashion', nomor_telepon: '089912345678', modal_usaha: 1200000000, klasifikasi: 'Usaha Kecil', latitude: 0.4902, longitude: 101.4402 },
    { nama_usaha: 'Toko Komputer "Pekanbaru Tech"', nama_pemilik: 'David Chen', alamat: 'Harapan Raya, Pekanbaru', kategori_usaha: 'Elektronik', nomor_telepon: '085399887766', modal_usaha: 3000000000, klasifikasi: 'Usaha Kecil', latitude: 0.5056, longitude: 101.4728 },
    { nama_usaha: 'Restoran Ikan Bakar Cianjur', nama_pemilik: 'Asep Sunandar', alamat: 'Jl. Jenderal Sudirman, Pekanbaru', kategori_usaha: 'Kuliner', nomor_telepon: '081198765432', modal_usaha: 4500000000, klasifikasi: 'Usaha Kecil', latitude: 0.5089, longitude: 101.4467 },
    { nama_usaha: 'Butik Muslimah "An-Nisa"', nama_pemilik: 'Hj. Fatimah', alamat: 'Mall SKA, Pekanbaru', kategori_usaha: 'Fashion', nomor_telepon: '081365432109', modal_usaha: 2200000000, klasifikasi: 'Usaha Kecil', latitude: 0.4966, longitude: 101.4168 },
    { nama_usaha: 'Toko Bahan Bangunan "Kokoh"', nama_pemilik: 'Koh Aceng', alamat: 'Jl. Soekarno-Hatta, Pekanbaru', kategori_usaha: 'Perdagangan', nomor_telepon: '085233221100', modal_usaha: 5000000000, klasifikasi: 'Usaha Kecil', latitude: 0.4977, longitude: 101.4241 },
    { nama_usaha: 'Klinik Kecantikan "Aura Glow"', nama_pemilik: 'dr. Anisa', alamat: 'Jl. Riau, Pekanbaru', kategori_usaha: 'Jasa', nomor_telepon: '082188776655', modal_usaha: 3500000000, klasifikasi: 'Usaha Kecil', latitude: 0.5367, longitude: 101.4328 },
    { nama_usaha: 'Agen Perjalanan "Riau Tour"', nama_pemilik: 'Bambang Irawan', alamat: 'Jl. Gatot Subroto, Pekanbaru', kategori_usaha: 'Pariwisata', nomor_telepon: '081277665544', modal_usaha: 1800000000, klasifikasi: 'Usaha Kecil', latitude: 0.5222, longitude: 101.4499 },
    { nama_usaha: 'Percetakan Digital "Cetak Cepat"', nama_pemilik: 'Sari', alamat: 'Jl. Pattimura, Gobah', kategori_usaha: 'Jasa', nomor_telepon: '085344332211', modal_usaha: 2800000000, klasifikasi: 'Usaha Kecil', latitude: 0.5126, longitude: 101.4452 },
    { nama_usaha: 'Showroom Mobil Bekas "Mobilindo"', nama_pemilik: 'Alex', alamat: 'Jl. Nangka (Tuanku Tambusai)', kategori_usaha: 'Otomotif', nomor_telepon: '081155443322', modal_usaha: 4800000000, klasifikasi: 'Usaha Kecil', latitude: 0.5042, longitude: 101.4225 },

    // 10 USAHA MENENGAH
    { nama_usaha: 'CV. Riau Konstruksi Mandiri', nama_pemilik: 'Ir. H. Abdullah', alamat: 'Jl. Riau Ujung, Pekanbaru', kategori_usaha: 'Konstruksi', nomor_telepon: '081122334455', modal_usaha: 7500000000, klasifikasi: 'Usaha Menengah', latitude: 0.5312, longitude: 101.4099 },
    { nama_usaha: 'Grosir Sembako "Sumber Rezeki"', nama_pemilik: 'Siti Fatimah', alamat: 'Jl. Tuanku Tambusai, Pekanbaru', kategori_usaha: 'Perdagangan', nomor_telepon: '081266778899', modal_usaha: 9000000000, klasifikasi: 'Usaha Menengah', latitude: 0.5068, longitude: 101.4289 },
    { nama_usaha: 'Pabrik Roti "Lezat Bakery"', nama_pemilik: 'Tan Wijaya', alamat: 'Kawasan Industri Tenayan Raya', kategori_usaha: 'Manufaktur', nomor_telepon: '085277778888', modal_usaha: 6500000000, klasifikasi: 'Usaha Menengah', latitude: 0.5211, longitude: 101.5543 },
    { nama_usaha: 'Hotel Bintang Tiga "Grand Central"', nama_pemilik: 'PT. Hotelindo', alamat: 'Jl. Diponegoro, Pekanbaru', kategori_usaha: 'Akomodasi', nomor_telepon: '0761-888999', modal_usaha: 10000000000, klasifikasi: 'Usaha Menengah', latitude: 0.5188, longitude: 101.4514 },
    { nama_usaha: 'Perkebunan Sawit "Tani Makmur"', nama_pemilik: 'Kelompok Tani', alamat: 'Daerah Kulim, Pekanbaru', kategori_usaha: 'Agribisnis', nomor_telepon: '081312341234', modal_usaha: 8500000000, klasifikasi: 'Usaha Menengah', latitude: 0.5011, longitude: 101.5302 },
    { nama_usaha: 'Ekspedisi Kargo "Lintas Sumatera"', nama_pemilik: 'Robert', alamat: 'Jl. SM Amin, Arengka 2', kategori_usaha: 'Logistik', nomor_telepon: '082133445566', modal_usaha: 9500000000, klasifikasi: 'Usaha Menengah', latitude: 0.4651, longitude: 101.3916 },
    { nama_usaha: 'Developer Perumahan "Griya Asri"', nama_pemilik: 'PT. Propertindo', alamat: 'Jl. Garuda Sakti, Panam', kategori_usaha: 'Properti', nomor_telepon: '081299887766', modal_usaha: 8000000000, klasifikasi: 'Usaha Menengah', latitude: 0.4579, longitude: 101.3663 },
    { nama_usaha: 'Pabrik Air Minum "Segar Riau"', nama_pemilik: 'Keluarga Lim', alamat: 'Jl. Air Hitam, Payung Sekaki', kategori_usaha: 'Manufaktur', nomor_telepon: '085388776655', modal_usaha: 6000000000, klasifikasi: 'Usaha Menengah', latitude: 0.4899, longitude: 101.3999 },
    { nama_usaha: 'Rumah Sakit Ibu dan Anak "Permata Hati"', nama_pemilik: 'Yayasan Medika', alamat: 'Jl. Dahlia, Sukajadi', kategori_usaha: 'Kesehatan', nomor_telepon: '0761-555666', modal_usaha: 9800000000, klasifikasi: 'Usaha Menengah', latitude: 0.5151, longitude: 101.4359 },
    { nama_usaha: 'Supermarket "Pekanbaru Mart"', nama_pemilik: 'PT. Ritel Jaya', alamat: 'Jl. Pepaya, Pekanbaru', kategori_usaha: 'Ritel', nomor_telepon: '081133221100', modal_usaha: 7200000000, klasifikasi: 'Usaha Menengah', latitude: 0.5218, longitude: 101.4361 },
  ];

  // 3. Memasukkan data UKM dengan sintaks relasi yang benar
  for (const data of ukmData) {
    await prisma.ukm.create({
      data: {
        ...data,
        // Menghubungkan UKM ini dengan user admin yang telah dibuat
        user: {
          connect: {
            id: adminUser.id,
          },
        },
      },
    });
  }
  console.log('Seeding 30 data UKM selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
