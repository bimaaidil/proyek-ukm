import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Konfigurasi CORS yang benar untuk mengizinkan akses dari frontend Anda
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.103.166:5173' // Ganti dengan IP Anda jika berubah
];
app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json());

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// ====================================================================
// FUNGSI MIDDLEWARE UNTUK OTENTIKASI (Pemeriksa Token)
// ====================================================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Simpan info user (id, role) di dalam request
        next();
    });
};

// ====================================================================
// RUTE PUBLIK (Tidak Perlu Login)
// ====================================================================

// Rute untuk memberikan API key Google Maps ke frontend
app.get('/api/maps-key', (req, res) => {
  res.json({ apiKey: process.env.Maps_API_KEY });
});

// Rute Registrasi
app.post('/api/register', 
    upload.fields([
        { name: 'foto_ktp', maxCount: 1 }, { name: 'file_nib', maxCount: 1 },
        { name: 'foto_pemilik', maxCount: 1 }, { name: 'foto_tempat_usaha', maxCount: 1 }
    ]), 
    async (req, res) => {
        const { 
            name, nik, email, password, nomor_kk, tempat_lahir, tanggal_lahir, jenis_kelamin, npwp, is_pns, 
            provinsi, kabupaten, kecamatan, desa, alamat_lengkap, nama_usaha, tahun_berdiri, nomor_nib, tanggal_nib, kondisi_usaha,
            kategori_usaha, nomor_telepon, modal_usaha, badan_hukum, klasifikasi, lingkungan_lokasi,
            website, facebook, instagram, latitude, longitude
        } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    name, nik, email, password: hashedPassword, nomor_kk, tempat_lahir,
                    tanggal_lahir: new Date(tanggal_lahir), jenis_kelamin, npwp: npwp || null, is_pns: is_pns === 'true',
                    provinsi, kabupaten, kecamatan, desa, alamat_lengkap,
                    foto_ktp: req.files['foto_ktp'] ? req.files['foto_ktp'][0].path : null,
                    ukm: {
                        create: {
                            nama_usaha, nama_pemilik: name, alamat: alamat_lengkap, kategori_usaha, nomor_telepon,
                            modal_usaha: modal_usaha ? parseFloat(modal_usaha) : null,
                            tahun_berdiri: tahun_berdiri ? parseInt(tahun_berdiri) : null,
                            nomor_nib, tanggal_nib: tanggal_nib ? new Date(tanggal_nib) : null, kondisi_usaha,
                            file_nib: req.files['file_nib'] ? req.files['file_nib'][0].path : null,
                            badan_hukum, klasifikasi, lingkungan_lokasi, website, facebook, instagram,
                            foto_pemilik: req.files['foto_pemilik'] ? req.files['foto_pemilik'][0].path : null,
                            foto_tempat_usaha: req.files['foto_tempat_usaha'] ? req.files['foto_tempat_usaha'][0].path : null,
                            latitude: latitude ? parseFloat(latitude) : null,
                            longitude: longitude ? parseFloat(longitude) : null,
                        }
                    }
                },
                include: { ukm: true }
            });
            res.status(201).json({ message: "Registrasi berhasil!", user: newUser });
        } catch (error) {
            console.error(error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return res.status(409).json({ message: "Email atau NIK sudah terdaftar." });
            }
            res.status(500).json({ message: "Terjadi kesalahan pada server." });
        }
    }
);

// Rute Login (Menghasilkan token JWT)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Password salah." });

        const { password: _, ...userData } = user;
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ user: userData, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ====================================================================
// RUTE TERPROTEKSI (Harus Login dan Memiliki Token)
// ====================================================================

// Rute untuk mendapatkan data profil pengguna yang sedang login
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { ukm: true }
        });
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data profil." });
    }
});

// Rute GET semua UKM (Hanya untuk Admin)
app.get('/api/ukm', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Hanya admin yang dapat melihat semua data." });
    }
    try {
        const { search } = req.query;
        const whereClause = search ? { nama_usaha: { contains: search, mode: 'insensitive' } } : {};
        const ukms = await prisma.ukm.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
        res.status(200).json(ukms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rute GET UKM by ID (Dilindungi dengan cek kepemilikan)
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

// Rute UPDATE UKM by ID (Dilindungi dengan cek kepemilikan)
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

            const { name, nik, email, /* ... semua field lainnya ... */ } = req.body;
            
            const ukmDataToUpdate = { /* ... data ukm ... */ };
            const userDataToUpdate = { /* ... data user ... */ };
            
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

// Rute DELETE UKM by ID (Dilindungi dengan cek kepemilikan)
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


app.listen(5000, () => console.log('Server berjalan di http://localhost:5000'));