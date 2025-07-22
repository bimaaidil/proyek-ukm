-- CreateTable
CREATE TABLE `Ukm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_usaha` VARCHAR(191) NOT NULL,
    `nama_pemilik` VARCHAR(191) NOT NULL,
    `alamat` TEXT NOT NULL,
    `kategori_usaha` VARCHAR(191) NULL,
    `nomor_telepon` VARCHAR(191) NULL,
    `modal_usaha` DOUBLE NULL,
    `klasifikasi` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `tahun_berdiri` INTEGER NULL,
    `nomor_nib` VARCHAR(191) NULL,
    `tanggal_nib` DATETIME(3) NULL,
    `file_nib` VARCHAR(191) NULL,
    `kondisi_usaha` VARCHAR(191) NULL,
    `badan_hukum` VARCHAR(191) NULL,
    `klasifikasi_omset` VARCHAR(191) NULL,
    `lingkungan_lokasi` VARCHAR(191) NULL,
    `foto_pemilik` VARCHAR(191) NULL,
    `foto_tempat_usaha` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'pelaku_usaha',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `is_pns` BOOLEAN NULL,
    `nik` VARCHAR(191) NULL,
    `nomor_kk` VARCHAR(191) NULL,
    `tempat_lahir` VARCHAR(191) NULL,
    `tanggal_lahir` DATETIME(3) NULL,
    `npwp` VARCHAR(191) NULL,
    `jenis_kelamin` VARCHAR(191) NULL,
    `foto_ktp` VARCHAR(191) NULL,
    `provinsi` VARCHAR(191) NULL,
    `kabupaten` VARCHAR(191) NULL,
    `kecamatan` VARCHAR(191) NULL,
    `desa` VARCHAR(191) NULL,
    `alamat_lengkap` TEXT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ukm` ADD CONSTRAINT `Ukm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
