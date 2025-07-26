-- CreateTable
CREATE TABLE "ukm" (
    "id" SERIAL NOT NULL,
    "nama_usaha" TEXT NOT NULL,
    "nama_pemilik" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kategori_usaha" TEXT,
    "nomor_telepon" TEXT,
    "modal_usaha" DOUBLE PRECISION,
    "klasifikasi" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "tahun_berdiri" INTEGER,
    "nomor_nib" TEXT,
    "tanggal_nib" TIMESTAMP(3),
    "file_nib" TEXT,
    "kondisi_usaha" TEXT,
    "badan_hukum" TEXT,
    "lingkungan_lokasi" TEXT,
    "foto_pemilik" TEXT,
    "foto_tempat_usaha" TEXT,
    "website" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,

    CONSTRAINT "ukm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'pelaku_usaha',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "is_pns" BOOLEAN,
    "nik" TEXT,
    "nomor_kk" TEXT,
    "tempat_lahir" TEXT,
    "tanggal_lahir" TIMESTAMP(3),
    "npwp" TEXT,
    "jenis_kelamin" TEXT,
    "foto_ktp" TEXT,
    "provinsi" TEXT,
    "kabupaten" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "alamat_lengkap" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- AddForeignKey
ALTER TABLE "ukm" ADD CONSTRAINT "ukm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
