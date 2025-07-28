import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Impor helper untuk upload ke cloud storage (misalnya Cloudinary)
// Anda perlu menginstal package-nya: npm install cloudinary
import { v2 as cloudinary } from 'cloudinary';

const app = express();
const prisma = new PrismaClient();

// ====================================================================
// KONFIGURASI & MIDDLEWARE
// ====================================================================

// PERBAIKAN: Konfigurasi CORS yang lebih eksplisit
app.use(cors({
  origin: "*", // Izinkan semua origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Health Check Route untuk halaman utama
app.get("/", (req, res) => {
  res.send("Backend API Proyek UKM sedang berjalan!");
});

// --- PERUBAHAN 1: KONFIGURASI UPLOAD FILE UNTUK VERCEL ---
// Vercel tidak punya sistem file permanen, jadi kita gunakan 'memoryStorage'
// untuk memproses file di memori sebelum diunggah ke cloud.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Konfigurasi Cloudinary (atau layanan lain seperti AWS S3)
// Pastikan Anda sudah mengatur variabel ini di Environment Variables Vercel
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Helper function untuk upload stream ke Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ====================================================================
// RUTE-RUTE APLIKASI
// ====================================================================

// Rute Publik
app.get('/api/maps-key', (req, res) => {
    res.json({ apiKey: process.env.Maps_API_KEY });
});

app.post('/api/register',
    upload.fields([
        { name: 'foto_ktp', maxCount: 1 }, { name: 'file_nib', maxCount: 1 },
        { name: 'foto_pemilik', maxCount: 1 }, { name: 'foto_tempat_usaha', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { name, nik, email, password } = req.body;
            const existingUser = await prisma.user.findFirst({
                where: { OR: [{ email }, { nik }] }
            });

            if (existingUser) {
                return res.status(409).json({ message: "Email atau NIK sudah terdaftar." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Proses upload semua file yang ada ke Cloudinary secara bersamaan
            const fotoKtpFile = req.files?.foto_ktp?.[0];
            const fileNibFile = req.files?.file_nib?.[0];
            const fotoPemilikFile = req.files?.foto_pemilik?.[0];
            const fotoTempatUsahaFile = req.files?.foto_tempat_usaha?.[0];

            const [fotoKtpResult, fileNibResult, fotoPemilikResult, fotoTempatUsahaResult] = await Promise.all([
                fotoKtpFile ? uploadToCloudinary(fotoKtpFile.buffer) : Promise.resolve(null),
                fileNibFile ? uploadToCloudinary(fileNibFile.buffer) : Promise.resolve(null),
                fotoPemilikFile ? uploadToCloudinary(fotoPemilikFile.buffer) : Promise.resolve(null),
                fotoTempatUsahaFile ? uploadToCloudinary(fotoTempatUsahaFile.buffer) : Promise.resolve(null),
            ]);

            // Simpan URL dari Cloudinary ke database
            await prisma.user.create({
                data: {
                    name: req.body.name,
                    nik: req.body.nik,
                    email: req.body.email,
                    password: hashedPassword,
                    nomor_kk: req.body.nomor_kk,
                    tempat_lahir: req.body.tempat_lahir,
                    tanggal_lahir: req.body.tanggal_lahir ? new Date(req.body.tanggal_lahir) : null,
                    jenis_kelamin: req.body.jenis_kelamin,
                    npwp: req.body.npwp || null,
                    is_pns: req.body.is_pns === 'true',
                    provinsi: req.body.provinsi,
                    kabupaten: req.body.kabupaten,
                    kecamatan: req.body.kecamatan,
                    desa: req.body.desa,
                    alamat_lengkap: req.body.alamat_lengkap,
                    foto_ktp: fotoKtpResult?.secure_url || null,
                    ukm: {
                        create: {
                            nama_usaha: req.body.nama_usaha,
                            nama_pemilik: req.body.name,
                            alamat: req.body.alamat_lengkap,
                            kategori_usaha: req.body.kategori_usaha,
                            nomor_telepon: req.body.nomor_telepon,
                            modal_usaha: req.body.modal_usaha ? parseFloat(req.body.modal_usaha) : null,
                            tahun_berdiri: req.body.tahun_berdiri ? parseInt(req.body.tahun_berdiri) : null,
                            nomor_nib: req.body.nomor_nib,
                            tanggal_nib: req.body.tanggal_nib ? new Date(req.body.tanggal_nib) : null,
                            kondisi_usaha: req.body.kondisi_usaha,
                            file_nib: fileNibResult?.secure_url || null,
                            badan_hukum: req.body.badan_hukum,
                            klasifikasi: req.body.klasifikasi,
                            lingkungan_lokasi: req.body.lingkungan_lokasi,
                            website: req.body.website,
                            facebook: req.body.facebook,
                            instagram: req.body.instagram,
                            foto_pemilik: fotoPemilikResult?.secure_url || null,
                            foto_tempat_usaha: fotoTempatUsahaResult?.secure_url || null,
                            latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
                            longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
                        }
                    }
                }
            });
            return res.status(201).json({ message: "Registrasi berhasil!" });
        } catch (error) {
            console.error("❌ Error saat registrasi:", error);
            return res.status(500).json({ message: "Terjadi kesalahan pada server." });
        }
    }
);

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Email atau password salah." });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email atau password salah." });
        }
        const { password: _, ...userData } = user;
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(200).json({ user: userData, token });
    } catch (error) {
        console.error("Error pada /api/login:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({ message: "Jika email Anda terdaftar, Anda akan menerima link reset." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

        await prisma.user.update({
            where: { email },
            data: { passwordResetToken, passwordResetExpires },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `Anda menerima email ini karena Anda (atau orang lain) meminta untuk mereset password akun Anda.\n\nSilakan klik link berikut untuk menyelesaikan prosesnya:\n\n${resetUrl}\n\nJika Anda tidak meminta ini, abaikan saja email ini.\n`;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Link Reset Password SI-IMKM RIAU',
            text: message,
        });

        res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });

    } catch (error) {
        console.error("Error di forgot-password:", error);
        res.status(500).json({ message: "Gagal mengirim email." });
    }
});

app.post('/api/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        res.status(200).json({ message: "Password berhasil diubah!" });
    } catch (error) {
        console.error("Error di reset-password:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

// Rute Terproteksi
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { ukm: true }
        });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data profil." });
    }
});

app.get('/api/ukm', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat melihat semua data." });
    }
    try {
        const { search, klasifikasi, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const whereClause = {};
        if (search) {
            whereClause.OR = [
                { nama_usaha: { contains: search, mode: 'insensitive' } },
                { nama_pemilik: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (klasifikasi && klasifikasi !== 'Semua') {
            whereClause.klasifikasi = klasifikasi;
        }
        const totalItems = await prisma.ukm.count({ where: whereClause });
        const ukms = await prisma.ukm.findMany({
            where: whereClause,
            skip: skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({
            data: ukms,
            totalPages: Math.ceil(totalItems / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/ukm/:id', authenticateToken, async (req, res) => {
    try {
        const ukm = await prisma.ukm.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: true }
        });
        if (!ukm) {
            return res.status(404).json({ message: "Data UKM tidak ditemukan." });
        }
        if (req.user.role !== 'admin' && req.user.id !== ukm.userId) {
            return res.status(403).json({ message: "Akses ditolak." });
        }
        res.status(200).json(ukm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PENTING: Anda perlu menerapkan logika upload ke Cloudinary di rute PUT ini juga
// jika Anda ingin mengizinkan pengguna mengubah file mereka.
app.put('/api/ukm/:id', authenticateToken, upload.fields([
    { name: 'foto_ktp', maxCount: 1 }, { name: 'file_nib', maxCount: 1 },
    { name: 'foto_pemilik', maxCount: 1 }, { name: 'foto_tempat_usaha', maxCount: 1 }
]),
    async (req, res) => {
        try {
            const ukmId = Number(req.params.id);
            const ukmToUpdate = await prisma.ukm.findUnique({ where: { id: ukmId } });
            if (!ukmToUpdate) {
                return res.status(404).json({ message: "Data UKM tidak ditemukan." });
            }
            if (req.user.id !== ukmToUpdate.userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Anda tidak punya hak untuk mengubah data ini." });
            }
            
            // TODO: Tambahkan logika untuk mengunggah file baru ke Cloudinary
            // dan menghapus file lama jika perlu.
            
            const { name, email, nama_usaha, alamat_lengkap } = req.body;
            const ukmDataToUpdate = { nama_usaha, alamat: alamat_lengkap };
            const userDataToUpdate = { name, email };

            // TODO: Update data di database dengan data baru, termasuk URL file baru
            
            res.status(200).json({ message: "Data berhasil diperbarui!" });
        } catch (error) {
            console.error("Error saat update:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta.target;
                if (target.includes('email')) { return res.status(409).json({ message: "Email ini sudah digunakan." }); }
                if (target.includes('nik')) { return res.status(409).json({ message: "NIK ini sudah terdaftar." }); }
            }
            res.status(500).json({ message: "Terjadi kesalahan pada server." });
        }
    }
);

app.delete('/api/ukm/:id', authenticateToken, async (req, res) => {
    try {
        const ukmId = Number(req.params.id);
        const ukmToDelete = await prisma.ukm.findUnique({ where: { id: ukmId } });
        if (!ukmToDelete) {
            return res.status(404).json({ message: "Data UKM tidak ditemukan." });
        }
        if (req.user.id !== ukmToDelete.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Anda tidak punya hak untuk menghapus data ini." });
        }

        // TODO: Tambahkan logika untuk menghapus file dari Cloudinary
        // sebelum menghapus data dari database.
        
        await prisma.ukm.delete({ where: { id: ukmId } });
        res.status(200).json({ message: 'Data UKM berhasil dihapus.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// ====================================================================
// --- PERSIAPAN UNTUK VERCEL ---
// ====================================================================

// Baris app.listen() DIHAPUS karena Vercel menanganinya secara otomatis.

// Ekspor variabel 'app' agar Vercel bisa menggunakannya sebagai Serverless Function.
export default app;