import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
// --- IMPOR BARU UNTUK LUPA PASSWORD ---
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Diagnostik untuk memastikan variabel JWT_SECRET terbaca saat server start
console.log("SERVER START -> Memeriksa Kunci JWT:", process.env.JWT_SECRET);

const app = express();
const prisma = new PrismaClient();
const __dirname = path.resolve();

// ====================================================================
// KONFIGURASI & MIDDLEWARE
// ====================================================================

// Izinkan akses dari frontend Anda
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.103.166:5173', // Pastikan IP ini sesuai dengan IP laptop Anda
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Sajikan file statis

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// Middleware untuk Otentikasi Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// ====================================================================
// RUTE PUBLIK (Tidak Perlu Login)
// ====================================================================

app.get('/api/maps-key', (req, res) => {
  res.json({ apiKey: process.env.Maps_API_KEY });
});

app.post(
    '/api/register',
    upload.fields([
        { name: 'foto_ktp', maxCount: 1 },
        { name: 'file_nib', maxCount: 1 },
        { name: 'foto_pemilik', maxCount: 1 },
        { name: 'foto_tempat_usaha', maxCount: 1 },
    ]),
    async (req, res) => {
        const {
            name, nik, email, password, nomor_kk, tempat_lahir, tanggal_lahir,
            jenis_kelamin, npwp, is_pns, provinsi, kabupaten, kecamatan, desa,
            alamat_lengkap, nama_usaha, tahun_berdiri, nomor_nib, tanggal_nib,
            kondisi_usaha, kategori_usaha, nomor_telepon, modal_usaha, badan_hukum,
            klasifikasi, lingkungan_lokasi, website, facebook, instagram,
            latitude, longitude
        } = req.body;

        try {
            const existingUser = await prisma.user.findFirst({
                where: { OR: [{ email }, { nik }] }
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(409).json({ message: "Email sudah terdaftar." });
                }
                if (existingUser.nik === nik) {
                    return res.status(409).json({ message: "NIK sudah terdaftar." });
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    name, nik, email, password: hashedPassword, nomor_kk, tempat_lahir,
                    tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
                    jenis_kelamin, npwp: npwp || null, is_pns: is_pns === 'true',
                    provinsi, kabupaten, kecamatan, desa, alamat_lengkap,
                    foto_ktp: req.files?.foto_ktp?.[0]?.path || null,
                    ukm: {
                        create: {
                            nama_usaha, nama_pemilik: name, alamat: alamat_lengkap, kategori_usaha, nomor_telepon,
                            modal_usaha: modal_usaha ? parseFloat(modal_usaha) : null,
                            tahun_berdiri: tahun_berdiri ? parseInt(tahun_berdiri) : null,
                            nomor_nib, tanggal_nib: tanggal_nib ? new Date(tanggal_nib) : null,
                            kondisi_usaha,
                            file_nib: req.files?.file_nib?.[0]?.path || null,
                            badan_hukum, klasifikasi, lingkungan_lokasi, website, facebook, instagram,
                            foto_pemilik: req.files?.foto_pemilik?.[0]?.path || null,
                            foto_tempat_usaha: req.files?.foto_tempat_usaha?.[0]?.path || null,
                            latitude: latitude ? parseFloat(latitude) : null,
                            longitude: longitude ? parseFloat(longitude) : null,
                        }
                    }
                }
            });

            return res.status(201).json({
                success: true,
                message: "Registrasi berhasil!"
            });

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
        if (!user) return res.status(401).json({ message: "Email atau password salah." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Email atau password salah." });

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


// ====================================================================
// --- RUTE BARU UNTUK LUPA & RESET PASSWORD ---
// ====================================================================

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(200).json({ message: "Jika email Anda terdaftar, Anda akan menerima link reset." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Kedaluwarsa dalam 10 menit

        await prisma.user.update({
            where: { email },
            data: { passwordResetToken, passwordResetExpires },
        });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
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


// ====================================================================
// RUTE TERPROTEKSI (Harus Login)
// ====================================================================

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
            whereClause.nama_usaha = { contains: search };
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

            const { name, nik, email /* ... semua field lainnya ... */ } = req.body;
            const ukmDataToUpdate = { /* ... data ukm dari req.body ... */ };
            const userDataToUpdate = { /* ... data user dari req.body ... */ };

            await prisma.$transaction([
                prisma.user.update({ where: { id: ukmToUpdate.userId }, data: userDataToUpdate }),
                prisma.ukm.update({ where: { id: ukmId }, data: ukmDataToUpdate })
            ]);

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

        await prisma.ukm.delete({ where: { id: ukmId } });
        res.status(200).json({ message: 'Data UKM berhasil dihapus.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ====================================================================
// SERVER LISTENER
// ====================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
