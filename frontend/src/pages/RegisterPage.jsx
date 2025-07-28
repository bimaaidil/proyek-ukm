import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // <-- PERBAIKAN: Baris yang hilang ditambahkan di sini
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import MapPicker from './MapPicker'; // Pastikan komponen ini ada

// Data wilayah Riau lengkap
const dataWilayah = {
    "BENGKALIS": {
        "Bantan": ["Bantan Air", "Bantan Sari", "Bantan Tengah", "Bantan Timur", "Bantan Tua", "Berancah", "Deluk", "Jangkang", "Kembung Baru", "Kembung Luar", "Mentayan", "Muntai", "Muntai Barat", "Pampang Baru", "Pampang Pesisir", "Pasiran", "Resam Lapis", "Selat Baru", "Sukamaju", "Teluk Lancar", "Teluk Pambang", "Teluk Papal", "Ulu Pulau"],
        "Bengkalis": ["Air Putih", "Bengkalis Kota", "Damai", "Damon", "Kelapapati", "Kelebuk", "Kelemantan", "Kelemantan Barat", "Ketam Putih", "Kuala Alam", "Meskom", "Palkun", "Pangkalan Batang", "Pangkalan Batang Barat", "Pedekik", "Pematang Duku", "Pematang Duku Timur", "Penampi", "Penebal", "Prapat Tunggal", "Rimba Sekampung", "Sebauk", "Sei Alam", "Sekodi", "Senderek", "Senggoro", "Simpang Ayam", "Sungaibatang", "Teluk Latak", "Temeran", "Wonosari"],
        "Bukit Batu": ["Batang Duku", "Bukit Batu", "Buruk Bakul", "Dompas", "Pangkalan Jambi", "Pakning Asal", "Sejangat", "Sukajadi", "Sungai Selari", "Sungai Pakning"],
        "Mandau": ["Air Jamban", "Babussalam", "Balik Alam", "Batang Serosa", "Bathin Betuah", "Duri Barat", "Duri Timur", "Gajah Sakti", "Harapan Baru", "Pematang Pudu", "Talang Mandi"],
        "Pinggir": ["Balai Pungut", "Buluh Apo", "Muara Basung", "Pangkalan Libut", "Pinggir", "Semunai", "Sungaimeranti", "Tengganau", "Balai Raja", "Titian Antui"],
        "Rupat": ["Batu Panjang", "Darul Aman", "Dungun Baru", "Hutan Panjang", "Makeruh", "Pancur Jaya", "Pangkalan Nyirih", "Pangkalan Pinang", "Parit Kebumen", "Pergam", "Sri Tanjung", "Sukarjo Mesin", "Sungai Cingam", "Tanjung Kapal", "Tanjung Medang", "Teluk Lecah", "Terkul"],
        "Rupat Utara": ["Hutan Ayu", "Kadus", "Puteri Sembilan", "Suka Damai", "Tanjung Medang", "Tanjung Punak", "Teluk Rhu", "Titi Akar"],
        "Siak Kecil": ["Bandar Jaya", "Koto Raja", "Langkat", "Liang Banir", "Lubuk Garam", "Lubuk Gaung", "Lubuk Muda", "Muara Dua", "Sadar Jaya", "Sepotong", "Sumber Jaya", "Sungai Linau", "Sungai Siput", "Tanjung Belit", "Tanjung Damai", "Tanjungdatuk"]
    },
    "INDRAGIRI HILIR": {
        "Batang Tuaka": ["Gemilang Jaya", "Kuala Sebatu", "Pasir Emas", "Simpang Jaya", "Sungai Dusun", "Sungai Junjungan", "Sungai Luar", "Sungai Piring", "Sungai Rawa", "Sungai Raya", "Tanjung Siantar", "Tasik Raya"],
        "Concong": ["Concong Dalam", "Concong Luar", "Concong Tengah", "Kampung Baru", "Panglima Raja", "Sungai Berapit"],
        "Enok": ["Bagan Jaya", "Enok", "Jaya Bhakti", "Pantaiseberang Makmur", "Pengalihan", "Pusaran", "Rantau Panjang", "Simpang Tiga", "Simpang Tiga Daratan", "Suhada", "Sungai Ambat", "Sungai Lokan", "Sungai Rukam", "Teluk Medan"],
        "Gaung": ["Belantaraya", "Gembira", "Jerambang", "Kuala Lahang", "Lahang Baru", "Lahang Hulu", "Lahang Tengah", "Pintasan", "Pungkat", "Semambu Kuning", "Simpang Gaung", "Soren", "Sungai Baru", "Teluk Kabung", "Telukmerbau", "Terusan Kempas"],
        "Gaung Anak Serka": ["Harapan Makmur", "Idaman", "Kelumpang", "Kuala Gaung", "Rambaian", "Sungai Empat", "Sungai Iliran", "Tanjungharapan", "Teluk Pantaian", "Teluk Pinang", "Teluk Sungka", "Teluk Tuasan"],
        "Kateman": ["Air Tawar", "Amal Bakti", "Bandar Sri Gemilang", "Kuala Selat", "Makmur Jaya", "Penjuru", "Sari Mulya", "Sungai Simbar", "Sungai Teritip", "Tagaraja", "Tanjung Raja"],
        "Kempas": ["Bayas Jaya", "Danau Pulai Indah", "Harapan Tani", "Karya Tani", "Kempas Jaya", "Kerta Jaya", "Kulim Jaya", "Pekan Tua", "Rumbai Jaya", "Sungaiaur", "Sungaigantang", "Sungairabit"],
        "Kemuning": ["Air Balui", "Batu Ampar", "Kemuning Muda", "Kemuning Tua", "Keritang", "Limau Manis", "Lubuk Besar", "Sekara", "Sekayan", "Selensen", "Talang Jangkang", "Tuk Jimun"],
        "Keritang": ["Kayu Raja", "Kembang Mekar Sari", "Kota Baru Reteh", "Kota Baru Seberida", "Kuala Keritang", "Kuala Lemang", "Lintas Utara", "Nusantara Jaya", "Nyiur Permai", "Pancur", "Pasar Kembang", "Pebenaan", "Pengalihan", "Petalongan", "Seberang Pebenaan", "Sencalang", "Teluk Kelasa"],
        "Kuala Indragiri": ["Kuala Indragiri", "Perigi Raja", "Sungai Bela", "Sungai Buluh", "Sungai Piai", "Tanjung Lajau", "Tanjung Melayu", "Teluk Dalam", "Sapat"],
        "Mandah": ["Bakau Aceh", "Bantayan", "Batang Tumu", "Bekawan", "Belaras", "Bente", "Bolak Raya", "Cahaya Baru", "Igal", "Khairiah Mandah", "Pelanduk", "Pantai Bidari", "Pulau Cawan", "Sepakat Jaya", "Soraya Mandiri"],
        "Pelangiran": ["Bagan Jaya", "Baung Rejo Jaya", "Catur Karya", "Hidayah", "Intan Mulya Jaya", "Pelangiran", "Pinang Jaya", "Rotan Semelur", "Saka Palas Jaya", "Simpang Kateman", "Tagagiri Tama Jaya", "Tanjung Simpang", "Tegal Rejo", "Teluk Bunian", "Terusan Beringin Jaya", "Wonosari"],
        "Pulau Burung": ["Bangun Harjo", "Binangun Jaya", "Bukit Sari Intan Jaya", "Keramat Jaya", "Manunggal Jaya", "Mayang Sari Jaya", "Pulau Burung", "Ringin Jaya", "Sapta Jaya", "Sri Danai", "Suka Jaya", "Suko Harjo Jaya", "Sungai Danai", "Teluk Nibung"],
        "Reteh": ["Kota Baru Reteh", "Madani", "Mekar Sari", "Metro", "Pulau Kecil", "Pulau Kijang", "Pulau Ruku", "Sanglar", "Seberang Pulau Kijang", "Seberang Sanglar", "Sungai Asam", "Sungai Terab", "Sungai Undan", "Sungaimahang", "Tanjunglabuh"],
        "Sungai Batang": ["Benteng", "Benteng Barat", "Benteng Utara", "Kuala Patah Arang", "Kuala Sungai Batang", "Mugo Mulyo", "Pandan Sari", "Pasenggerahan"],
        "Tanah Merah": ["Kuala Enok", "Selat Nama", "Sungai Laut", "Sungai Nyiur", "Tanah Merah", "Tanjung Baru", "Tanjung Pasir", "Tekulai Bugis", "Tekulai Hilir", "Tekulai Hulu"],
        "Teluk Belengkong": ["Beringin Mulya", "Gembaran", "Griyamukti Jaya", "Hibrida Jaya", "Hibrida Mulya", "Indra Sari Jaya", "Kelapa Patih Jaya", "Saka Rotan", "Sapta Mulya Jaya", "Sumber Jaya", "Sumber Makmur Jaya", "Sumber Sari Jaya", "Tunggal Rahayu Jaya"],
        "Tembilahan": ["Pekan Arba", "Seberang Tembilahan", "Seberang Tembilahan Barat", "Seberang Tembilahan Selatan", "Sungai Beringin", "Sungai Perak", "Tembilahan Hilir", "Tembilahan Kota"],
        "Tembilahan Hulu": ["Pekan Kamis", "Pulau Palas", "Sialang Panjang", "Sungaiintan", "Tembilahan Barat", "Tembilahan Hulu"],
        "Tempuling": ["Harapan Jaya", "Karya Tunas Jaya", "Mumpa", "Pangkalan Tujuh", "Sungaisalak", "Tanjungpidada", "Telukkiambang", "Tempuling", "Telukjira"]
    },
    "INDRAGIRI HULU": {
        "Batang Cenaku": ["Alim", "Anak Talang", "Aur Cina", "Batu Papan", "Bukit Lingkar", "Bukit Lipai", "Cenaku Kecil", "Kepayang Sari", "Kerubung Jaya", "Kuala Gading", "Kuala Kilan", "Lahai Kemuning", "Pataling Jaya", "Pejangki", "Pematang Manggis", "Punti Anai", "Sanglap", "Sipang", "Talang Bersemi", "Talang Mulya"],
        "Batang Gangsal": ["Belimbing", "Danau Rambai", "Ringin", "Seberida", "Siambul", "Sungai Akar", "Talang Lakat", "Usul", "Penyaguan", "Danau Rambai"],
        "Batang Peranap": ["Koto Tuo", "Peladangan", "Pematang", "Pematang Benteng", "Pesajian", "Puntikayu", "Selunak", "Sencano Jaya", "Suka Maju", "Sungai Aur"],
        "Kelayang": ["Bongkal Malang", "Bukit Selanjut", "Dusun Tua", "Dusun Tua Pelang", "Kota Medan", "Pasir Beringin", "Pelangko", "Polak Pisang", "Pulau Sengkilo", "Simpang Kota Medan", "Sungai Golang", "Sungai Kuning Benio", "Sungai Banyak Ikan", "Tanjung Beludu", "Teluk Sejuah"],
        "Kuala Cenaku": ["Kuala Cenaku", "Kuala Mulia", "Pulau Gelang", "Pulau Jum'at", "Rawa Asri", "Rawa Sekip", "Suka Jadi", "Tambak", "Tanjung Sari", "Teluk Sungkai"],
        "Lirik": ["Banjar Balam", "Gudang Batu", "Japura", "Lambang Sari I, II, III", "Lirik Area", "Mekar Sari", "Pasir Ringgit", "Pasir Sialang Jaya", "Redang Seko", "Rejosari", "Seko Lubuk Tigo", "Sidomulyo", "Sukajadi", "Sungai Sagu", "Wonosari"],
        "Lubuk Batu Jaya": ["Air Putih", "Kulim Jaya", "Lubuk Batu Tinggal", "Pondok Gelugur", "Pontian Mekar", "Rimpian", "Sei Beras-beras", "Sei Seberas Hilir", "Tasik Juang"],
        "Pasir Penyu": ["Air Molek I", "Air Molek II", "Batu Gajah", "Candirejo", "Jati Rejo", "Lembah Dusun Gading", "Pasir Keranji", "Petalongan", "Sempurna"],
        "Peranap": ["Baturijal Barat", "Baturijal Hulu", "Gumanti", "Katipo Pura", "Pandan Wangi", "Pauh Ranap", "Semelinang Tebing", "Semelinang Darat", "Serai Wangi", "Setako Raya"],
        "Rakit Kulim": ["Batu Sawar", "Bukit Indah", "Kampung Bunga", "Kelayang", "Kota Baru", "Kuantan Tenang", "Lubuk Sitarak", "Petonggan", "Rimba Seminai", "Sungai Emas", "Talang Durian Cacar", "Talang Gedabu", "Talang Pring Jaya", "Talang Suka Maju", "Talang Suka Ramai", "Talang Sungai Limau", "Talang Sungai Parit", "Talang Tujuh Buah Tangga"],
        "Rengat": ["Kampung Pulau", "Kuantan Baru", "Pasir Kemilu", "Pulau Gajah", "Rantau Mapesai", "Rawa Bangun", "Sungai Beringin", "Sungai Guntung Hilir", "Sungai Guntung Tengah", "Sungai Raya"],
        "Rengat Barat": ["Air Jernih", "Alang Kepayang", "Barangan", "Bukit Petaling", "Danau Baru", "Danau Tiga", "Kota Lama", "Pekan Heran", "Pematang Jaya", "Rantau Bakung", "Redang", "Sialang Dua Dahan", "Sungai Baung", "Sungai Dawu", "Talang Jerinjing", "Tanah Datar", "Tanah Makmur"],
        "Seberida": ["Bandar Padang", "Beligan", "Bukit Meranti", "Buluh Rampai", "Kelesa", "Payarumbal", "Petala Bumi", "Serasam", "Sibabat", "Titian Resak"]
    },
    "KAMPAR": {
        "Bangkinang Kota": ["Bangkinang", "Kumantan", "Langgini", "Ridan Permai"],
        "Bangkinang": ["Binuang", "Bukit Payung", "Bukit Sembilan", "Laboy Jaya", "Muara Uwai", "Pulau Lawas", "Suka Mulya", "Pasir Sialang", "Pulau"],
        "Gunung Sahilan": ["Gunung Mulya", "Gunung Sahilan", "Gunung Sari", "Kebun Durian", "Makmur Sejahtera", "Sahilan Darussalam", "Subarak", "Suka Makmur", "Sungai Lipai"],
        "Kampa": ["Deli Makmur", "Kampar", "Koto Perambahan", "Pulau Birandang", "Pulau Rambai", "Sawah Baru", "Sungai Putih", "Sungai Tarap", "Tanjung Bungo"],
        "Kampar": ["Air Tiris", "Batu Belah", "Bukit Ranah", "Koto Tibun", "Limau Manis", "Naumbai", "Padang Mutung", "Penyasawan", "Pulau Jambu", "Pulau Sarak", "Pulau Tinggi", "Ranah", "Ranah Baru", "Ranah Singkuang", "Rumbio", "Simpang Kubu", "Tanjung Berulak", "Tanjung Rambutan"],
        "Kampar Kiri": ["IV Koto Setingkai", "Domo", "Kuntu", "Kuntu Darussalam", "Lipat Kain", "Lipat Kain Selatan", "Lipat Kain Utara", "Muara Selaya", "Padang Sawah", "Sungai Geringging", "Sungai Harapan", "Sungai Liti", "Sungai Paku", "Sungai Raja", "Sungai Rambai", "Sungai Sarik", "Tanjung Harapan", "Tanjung Mas", "Teluk Paman", "Teluk Paman Timur"],
        "Kampar Kiri Hilir": ["Bangun Sari", "Gading Permai", "Mentulik", "Rantau Kasih", "Sungai Bunga", "Sungai Pagar", "Sungai Petai", "Sungai Simpang Dua"],
        "Kampar Kiri Hulu": ["Aur Kuning", "Batu Sanggan", "Batu Sasak", "Bukit Betung", "Danau Sontul", "Deras Tajak", "Dua Sepakat", "Gajah Bertalut", "Gema", "Kebun Tinggi", "Kota Lama", "Lubuk Bigau", "Ludai", "Muaro Bio", "Pangkalan Kapas", "Pangkalan Serai", "Subayang Jaya", "Sungai Santi", "Tanjung Belit", "Tanjung Belit Selatan", "Tanjung Beringin", "Tanjung Karang", "Tanjung Permai", "Terusan"],
        "Kampar Kiri Tengah": ["Bina Baru", "Bukit Sakai", "Hidup Baru", "Karya Bakti", "Koto Damai", "Lubuk Sakai", "Mayang Pongkai", "Mekar Jaya", "Penghidupan", "Simalinyang", "Utama Karya"],
        "Kampar Utara": ["Kampung Panjang", "Kayu Aro", "Muara Jalai", "Naga Beralih", "Sawah", "Sendayan", "Sungai Jalau", "Sungai Tonang"],
        "Koto Kampar Hulu": ["Bandar Picak", "Gunung Malelo", "Pongkai", "Sibiruang", "Tabing", "Tanjung"],
        "Kuok": ["Batu Langkah Kecil", "Bukit Melintang", "Empat Balai", "Kuok", "Lereng", "Merangin", "Pulau Jambu", "Pulau Terap", "Silam"],
        "Perhentian Raja": ["Hang Tuah", "Kampung Pinang", "Pantai Raja", "Sialang Kubang", "Lubuk Sakat"],
        "Rumbio Jaya": ["Alam Panjang", "Batang Batindih", "Bukit Kratai", "Pulau Payung", "Simpang Petai", "Tambusai", "Teratak"],
        "Salo": ["Ganting", "Ganting Damai", "Salo", "Salo Timur", "Siabu", "Sipungguk"],
        "Siak Hulu": ["Buluh Cina", "Buluh Nipis", "Desa Baru", "Kepau Jaya", "Kubang Jaya", "Lubuk Siam", "Pandau Jaya", "Pangkalan Baru", "Pangkalan Serik", "Tanah Merah", "Tanjung Balam", "Teratak Buluh"],
        "Tambang": ["Aur Sati", "Balam Jaya", "Gobah", "Kemang Indah", "Kualu", "Kuapan", "Padang Luas", "Palung Raya", "Parit Baru", "Pulau Permai", "Rimba Panjang", "Sungai Pinang", "Tambang", "Tarai Bangun", "Teluk Kenidai", "Terantang"],
        "Tapung": ["Air Terbit", "Batu Gajah", "Bencah Kelubi", "Gading Sari", "Indra Sakti", "Indrapuri", "Karya Indah", "Kijang Rejo", "Kinantan", "Muara Mahat Baru", "Mukti Sari", "Pagaruyung", "Pancuran Gading", "Pantaicermin", "Pelambahan", "Petapahan", "Petapahan Jaya", "Sari Galuh", "Sibuak", "Sumber Makmur", "Sungai Agung", "Sungai Lambu Makmur", "Sungai Putih", "Tanjung Sawit", "Tri Manunggal"],
        "Tapung Hilir": ["Beringin Lestari", "Cinta Damai", "Gerbang Sari", "Kijang Jaya", "Kijang Makmur", "Koto Aman", "Koto Bangun", "Koto Baru", "Koto Garo", "Sikijang Makmur", "Suka Maju", "Tanah Tinggi", "Tandan Sari", "Tapung Lestari", "Tapung Makmur", "Tebing Lestari"],
        "Tapung Hulu": ["Bukit Kemuning", "Danau Lancang", "Intan Jaya", "Kasikan", "Kusau Makmur", "Muara Intan", "Rimba Beringin", "Rimba Jaya", "Rimba Makmur", "Sinama Nenek", "Suka Ramai", "Sumber Sari", "Talang Danto", "Tanah Datar"],
        "XIII Koto Kampar": ["Balung", "Batu Bersurat", "Binamang", "Gunung Bungsu", "Koto Mesjid", "Koto Tuo", "Koto Tuo Barat", "Lubuk Agung", "Muara Takus", "Pulau Gadang", "Pongkai Istiqamah", "Ranah Sungkai", "Tanjung Alai"]
    },
    "KEPULAUAN MERANTI": {
        "Merbau": ["Bagan Melibur", "Lukit", "Mayang Sari", "Mekar Sari", "Meranti Bunting", "Pelantai", "Tanjung Kulim", "Sungai Anak Kamal", "Sungai Tengah", "Teluk Belitung"],
        "Pulau Merbau": ["Baran Melintang", "Batang Meranti", "Centai", "Ketapang Permai", "Kuala Merbau", "Padang Kamal", "Pangkalan Balai", "Renak Rungun", "Semukut", "Tanjung Bunga", "Teluk Ketapang"],
        "Rangsang": ["Beting", "Bungur", "Kemala Sari", "Pengayun", "Ransang", "Repan", "Sokop", "Sungai Gayun", "Tanjung Bakau", "Tanjung Kedabu", "Tanjung Medang", "Tanjung Samak", "Tebun", "Topang"],
        "Rangsang Barat": ["Anak Setatah", "Bantar", "Bina Maju", "Bokor", "Lemang", "Mekar Baru", "Melai", "Permai", "Segomeng", "Sialang Pasung", "Sungai Cina", "Telaga Baru"],
        "Rangsang Pesisir": ["Beting", "Bungur", "Kayu Ara", "Kedabu Rapat", "Sendaur", "Sokop", "Sonde", "Tanah Merah", "Tanjung Kedabu", "Telesung", "Tenggayun Raya"],
        "Tasik Putri Puyu": ["Bandul", "Dedap", "Kudap", "Mekar Delima", "Mengkirau", "Mengkopot", "Putri Puyu", "Selat Akar", "Tanjung Padang", "Tanjung Pisang"],
        "Tebing Tinggi": ["Alah Air", "Alah Air Timur", "Banglas", "Banglas Barat", "Sesap", "Selat Panjang Barat", "Selat Panjang Kota", "Selat Panjang Selatan", "Selat Panjang Timur"],
        "Tebing Tinggi Barat": ["Alai", "Alai Selatan", "Batang Malas", "Gogok Darussalam", "Insit", "Kundur", "Lalang Tanjung", "Maini Darul Aman", "Mekong", "Mengikip", "Sesap", "Tenan", "Tanjung Darul Takzim", "Tanjung Peranap"],
        "Tebing Tinggi Timur": ["Batin Suir", "Kepau Baru", "Lukun", "Nipah Sendanu", "Sendanu Darul Ihsan", "Sungai Tohor", "Sungai Tohor Barat", "Tanjung Gadai", "Tanjung Sari", "Teluk Buntal"]
    },
    "KOTA DUMAI": {
        "Bukit Kapur": ["Bagan Besar", "Bagan Besar Timur", "Bukit Kapur", "Bukit Nenas", "Gurun Panjang", "Kampung Baru"],
        "Dumai Barat": ["Bagan Keladi", "Pangkalan Sesai", "Purnama", "Simpang Tetap Darul Ichsan"],
        "Dumai Kota": ["Bintan", "Dumai Kota", "Laksamana", "Rimba Sekampung", "Sukajadi"],
        "Dumai Selatan": ["Bukit Datuk", "Bumi Ayu", "Mekar Sari", "Ratu Sima", "Simpang Tetap Darul Ikhsan"],
        "Dumai Timur": ["Bukit Batrem", "Buluh Kasap", "Jaya Mukti", "Tanjung Palas", "Teluk Binjai"],
        "Medang Kampai": ["Guntung", "Mundam", "Teluk Makmur"],
        "Sungai Sembilan": ["Bangsal Aceh", "Basilam Baru", "Batu Teritip", "Lubuk Gaung", "Tanjung Penyembal", "Sungai Geniot"]
    },
    "KOTA PEKANBARU": {
        "Binawidya": ["Binawidya", "Delima", "Simpang Baru", "Sungai Sibam", "Tobek Godang"],
        "Bukit Raya": ["Airdingin", "Simpang Tiga", "Tangkerang Labuai", "Tangkerang Selatan", "Tangkerang Utara"],
        "Kulim": ["Kulim", "Mentangor", "Pebatuan", "Pematangkapau", "Sialangrampai"],
        "Lima Puluh": ["Pesisir", "Rintis", "Sekip", "Tanjung Rhu"],
        "Marpoyan Damai": ["Maharatu", "Perhentian Marpoyan", "Sidomulyo Timur", "Tangkerang Barat", "Tangkerang Tengah", "Wonorejo"],
        "Payung Sekaki": ["Air Hitam", "Bandar Raya", "Labuh Baru Barat", "Labuh Baru Timur", "Tampan", "Tirta Siak"],
        "Pekanbaru Kota": ["Kota Baru", "Kota Tinggi", "Sago", "Simpang Empat", "Sukaramai", "Tanah Datar", "Sumahilang"],
        "Rumbai": ["Lembah Damai", "Lembah Sari", "Meranti Pandak", "Limbungan Baru", "Palas", "Sri Meranti", "Umban Sari"],
        "Rumbai Barat": ["Agrowisata", "Maharani", "Muara Fajar Barat", "Muara Fajar Timur", "Rantau Panjang", "Rumbai Bukit"],
        "Rumbai Timur": ["Lembah Sari", "Limbungan", "Sungai Ambang", "Sungai Ukai", "Tebing Tinggi Okura"],
        "Sail": ["Cinta Raja", "Sukamaju", "Sukamulya"],
        "Senapelan": ["Kampung Bandar", "Kampung Baru", "Kampung Dalam", "Padang Bulan", "Padang Terubuk", "Sago"],
        "Sukajadi": ["Harjosari", "Jadirejo", "Kampung Melayu", "Kampung Tengah", "Kedung Sari", "Pulau Karam", "Sukajadi"],
        "Tenayan Raya": ["Bambu Kuning", "Bencah Lesung", "Industri Tenayan", "Melebung", "Rejosari", "Sialang Sakti", "Tangkerang Timur", "Tuah Negeri"],
        "Tuah Madani": ["Air Putih", "Sialang Munggu", "Sidomulyo Barat", "Tuah Karya", "Tuah Madani"]
    },
    "KUANTAN SINGINGI": {
        "Benai": ["Banjar Benai", "Banjar Lopak", "Benai", "Benai Kecil", "Gunung Kesiangan", "Koto Benai", "Pulau Ingu", "Pulau Kalimanting", "Pulau Lancang", "Pulau Tongah", "Siberakun", "Simandolak", "Tolontam", "Tanjung", "Tebing Tinggi", "Ujung Tanjung"],
        "Cerenti": ["Kampung Baru", "Kampung Baru Timur", "Kompe Berangin", "Koto Cerenti", "Pasikaline", "Pulau Bayur", "Pulau Jambu", "Pulau Panjang Cerenti", "Sikakak", "Tanjungmedan", "Teluk Pauh", "Pasar Cerenti", "Koto Peraku"],
        "Gunung Toar": ["Gunung", "Kampung Baru", "Koto Gunung", "Lubuk Terantang", "Petapahan", "Pisang Berebus", "Pulau Mungkur", "Pulau Rumput", "Seberang Gunung", "Seberang Sungai", "Siberobah", "Teberau Panjang", "Teluk Beringin", "Toar"],
        "Hulu Kuantan": ["Inuman", "Koto Kombu", "Lubuk Ambacang", "Mudik Ulo", "Serosah", "Sumpu", "Sungai Alah", "Sungai Kalilawar", "Sungai Pinang", "Tanjung", "Tanjung Medang", "Sampurago"],
        "Inuman": ["Banjar Nantigo", "Bedeng Sikuran", "Kampung Baru Koto", "Ketaping Jaya", "Koto Inuman", "Lebuh Lurus", "Pasar Inuman", "Pulau Busuk", "Pulaubusuk", "Pulau Panjang Hulu", "Pulau Panjang Hilir", "Pulau Sipan", "Seberang Pulau Busuk", "Sigaruntung"],
        "Kuantan Hilir": ["Banuaran", "Dusun Tuo", "Gunung Melintang", "Kampung Madura", "Kampung Medan", "Kampung Tengah", "Kepala Pulau", "Koto Tuo", "Pulau Beralo", "Pulau Kijang", "Pulau Madinah", "Rawang Bonto", "Simpang Teras", "Teratak Baru", "Pasar Usang"],
        "Kuantan Hilir Seberang": ["Danau", "Kasang Limau Sundai", "Koto Rajo", "Lumbok", "Pelukahan", "Pengalihan", "Pulaubaru", "Pulauberalo", "Pulaululu", "Rawang Ogung", "Sungaisorik", "Tanjung", "Tanjungpajang", "Teratak Jering"],
        "Kuantan Mudik": ["Air Buluh", "Aur Duri", "Banjar Guntung", "Banjar Padang", "Bukit Kauman", "Bukit Pedusunan", "Kasang", "Kinali", "Koto Cengar", "Koto Lubuk Jambi", "Luai", "Lubuk Ramo", "Muaro Tombang", "Pantai", "Pebaun Hilir", "Pebaun Hulu", "Pulau Binjai", "Rantau Sialang", "Saik", "Sangau", "Seberang Cengar", "Seberang Pantai", "Sungai Manau", "Lubuk Jambi"],
        "Kuantan Tengah": ["Bandar Alai Kari", "Beringin Taluk", "Jake", "Jaya", "Kopah", "Koto Kari", "Koto Taluk", "Koto Tuo", "Munsalo", "Pintu Gobang", "Pulau Baru", "Pulau Godang", "Pulau Aro", "Pulau Banjar Kari", "Pulau Kerdung", "Sawah", "Seberang Taluk", "Seberang Taluk Hilir", "Sitorajo", "Titian Modang Kopah", "Pasar Taluk", "Simpang Tiga", "Sungai Jering"],
        "Logas Tanah Darat": ["Bumi Mulya", "Giri Sako", "Hulu Teso", "Kuantan Sako", "Logas", "Lubuk Kebun", "Perhentian Luas", "Rambahan", "Sako Margasari", "Sidodadi", "Sikijang", "Situgal", "Sukaraja", "Sungai Rambai", "Teratak Rendah"],
        "Pangean": ["Koto Pangean", "Padang Kunik", "Padang Tanggung", "Pasar Baru Pangean", "Pauh Angit", "Pauh Angit Hulu", "Pembatang", "Pulau Deras", "Pulau Kumpai", "Pulau Rengas", "Pulau Tengah", "Rawang Binjai", "Sako", "Sukaping", "Sungailangsat", "Tanah Bekali", "Teluk Pauh"],
        "Pucuk Rantau": ["Ibul", "Kampung Baru Ibul", "Muara Petai", "Muaro Tobek", "Muaro Tiu", "Makmur", "Pangkalan", "Perhentian Sungkai", "Setiang", "Sungai Besar", "Sungai Besar Hilir"],
        "Sentajo Raya": ["Beringin Jaya", "Geringging Jaya", "Geringging Baru", "Jalur Patah", "Kampung Baru Sentajo", "Koto Sentajo", "Langsat Hulu", "Marsawa", "Muaro Langsat", "Muaro Sentajo", "Parit Teratak Air Hitam", "Pulaukumang Sentajo", "Pulaukapung Sentajo", "Seberang Teratak Air Hitam", "Teratak Air Hitam"],
        "Singingi": ["Air Mas", "Kebun Lado", "Logas", "Logas Hilir", "Pangkalan Indarung", "Pasir Emas", "Petai Baru", "Pulau Padang", "Sumber Datar", "Sungai Bawang", "Sungai Keranji", "Sungai Kuning", "Sungai Sirih", "Muara Lembu"],
        "Singingi Hilir": ["Beringin Jaya", "Bukit Raya", "Koto Baru", "Muara Bahan", "Petai", "Simpang Raya", "Sukamaju", "Suka Damai", "Sumber Jaya", "Sungai Buluh", "Sungai Paku", "Tanjung Pauh"]
    },
    "PELALAWAN": {
        "Bandar Petalangan": ["Air Terjun", "Angkasa", "Kuala Tolam", "Lubuk Keranji", "Lubuk Raja", "Sialang Bungkuk", "Sialang Godang", "Tambun", "Terbangiang"],
        "Bandar Sei Kijang": ["Bandar Sei Kijang", "Kiab Jaya", "Lubuk Ogung", "Muda Setia", "Simpang Beringin"],
        "Bunut": ["Bagan Laguh", "Balam Merah", "Bunut", "Keriung", "Lubuk Mandian Gajah", "Lubuk Mas", "Merbau", "Petani", "Sialang Kayu Batu"],
        "Kerumutan": ["Banjar Panjang", "Beringin Makmur", "Bukit Lembah Subur", "Kerumutan", "Lipai Bulan", "Mak Teduh", "Pangkalan Panduk", "Pangkalan Tampoi", "Pematang Tinggi", "Tanjung Air Hitam"],
        "Kuala Kampar": ["Serapung", "Sokoi", "Sungai Mas", "Sungai Solok", "Sungai Upik", "Tanjung Sum", "Teluk", "Teluk Beringin", "Teluk Bakau"],
        "Langgam": ["Langgam", "Langgam", "Padang Luas", "Pangkalan Gondai", "Penarikan", "Segati", "Sotok"],
        "Pangkalan Kerinci": ["Bukit Agung", "Kuala Terusan", "Makmur", "Pangkalan Kerinci Barat", "Pangkalan Kerinci Kota", "Pangkalan Kerinci Timur", "Rantau Baru"],
        "Pangkalan Kuras": ["Batang Kulim", "Beringin Indah", "Betung", "Dundangan", "Harapan Jaya", "Kemang", "Kesuma", "Meranti", "Palas", "Sialang Indah", "Sorek Dua", "Sorek Satu", "Surya Indah", "Talau", "Tanjung Beringin", "Terantang Manuk"],
        "Pangkalan Lesung": ["Dusun Tua", "Genduang", "Mayang Sari", "Mulya Subur", "Pesaguan", "Pangkalan Lesung", "Rawang Sari", "Sari Makmur", "Sari Mulya", "Tanjung Kuyo"],
        "Pelalawan": ["Batang Nilo Kecil", "Delik", "Kuala Tolam", "Lalang Kabung", "Pelalawan", "Ransang", "Sering", "Sungai Ara", "Telayap"],
        "Teluk Meranti": ["Gambut Mutiara", "Kuala Panduk", "Labuhan Bilik", "Pangkalan Terap", "Petodaan", "Pulau Muda", "Segamai", "Teluk Binjai", "Teluk Meranti"],
    },
    "ROKAN HILIR": {
        "Bagan Sinembah": ["Bagan Batu", "Bagan Batu Kota", "Bagan Sapta Permai", "Bagan Manunggal", "Bahtera Makmur", "Bakti Makmur", "Bhayangkara Jaya", "Gelora", "Jaya Agung", "Meranti Makmur", "Pelita", "Suka Maju"],
        "Bagan Sinembah Raya": ["Bagan Sinembah", "Bagan Sinembah Barat", "Bagan Sinembah Kota", "Bagan Sinembah Timur", "Bagan Sinembah Utara", "Harapan Makmur", "Harapan Makmur Selatan", "Makmur Jaya", "Panca Mukti", "Salak"],
        "Balai Jaya": ["Bagan Bhakti", "Balai Jaya", "Balai Jaya Kota", "Balam Jaya", "Balam Sempurna", "Balam Sempurna Kota", "Kencana", "Lubuk Jawi", "Pasir Putih", "Pasir Putih Barat", "Pasir Putih Utara"],
        "Bangko": ["Bagan Barat", "Bagan Hulu", "Bagan Kota", "Bagan Punak", "Bagan Punak Pesisir", "Bagan Punak Meranti", "Bagan Timur", "Labuhan Tangga Baru", "Labuhan Tangga Besar", "Labuhan Tangga Hilir", "Labuhan Tangga Kecil", "Parit Aman", "Serusa"],
        "Bangko Pusako": ["Bangko Bakti", "Bangko Balam", "Bangko Jaya", "Bangko Kanan", "Bangko Kiri", "Bangko Lestari", "Bangko Makmur", "Bangko Mas Raya", "Bangko Mukti", "Bangko Permata", "Bangko Pusako", "Bangko Sempurna", "Pematang Damar", "Pematang Ibul", "Sungai Menasib", "Teluk Bano I"],
        "Batu Hampar": ["Bantayan", "Bantayan Baru", "Bantayan Hilir", "Sei Sialang", "Sei Sialang Hulu"],
        "Kubu": ["Rantau Panjang Kanan", "Sei Segajah Makmur", "Sungai Kubu", "Sungai Segajah Jaya", "Sungai Sigajah", "Sungaikubu Hulu", "Tanjung Leban", "Teluk Merbau", "Telukpiyai Pesisir", "Teluk Piyai"],
        "Kubu Babussalam": ["Jojol", "Pulau Halang Belakang", "Pulau Halang Hulu", "Pulau Halang Muka", "Rantau Panjang Kiri", "Rantau Panjang Kiri Hilir", "Sungai Majo", "Sungai Majo Pusako", "Sungai Panji", "Sungai Pinang", "Teluk Nilap", "Teluk Nilap Jaya"],
        "Pasir Limau Kapas": ["Panipahan", "Panipahan Darat", "Panipahan Laut", "Pasir Limau Kapas", "Pulaujemur", "Sungai Daun", "Teluk Pulai"],
        "Pekaitan": ["Karya Mulyo Sari", "Kubu I", "Pedamaran", "Pekaitan", "Rokan Baru", "Rokan Baru Pesisir", "Suak Air Hitam", "Suak Temenggung", "Sungai Besar", "Teluk Bano II"],
        "Pujud": ["Air Hitam", "Babussalam Rokan", "Kasang Bangsawan", "Perkebunan Siarang-arang", "Pujud", "Pujud Selatan", "Pujud Utara", "Siarang-arang", "Sukajadi", "Sungai Pinang", "Teluk Nayang"],
        "Rantau Kopar": ["Bagan Cempedak", "Rantau Kopar", "Sekapas", "Sungai Rangau"],
        "Rimba Melintang": ["Harapan Jaya", "Jumrah", "Karya Mukti", "Lenggadai Hilir", "Lenggadai Hulu", "Mukti Jaya", "Pematang Botam", "Pematang Sikek", "Rimba Melintang", "Seremban Jaya", "Teluk Pulau Hilir", "Teluk Pulau Hulu"],
        "Simpang Kanan": ["Bagan Nibung", "Bukit Damar", "Bukit Mas", "Bukit Selamat", "Kota Parit", "Simpang Kanan"],
        "Sinaboi": ["Darussalam", "Raja Bejamu", "Sinaboi", "Sungai Bakau", "Sungai Nyamuk", "Sinaboi Kota"],
        "Tanah Putih": ["Banjar XII", "Cempedak Rahuk", "Mumugo", "Putat", "Rantau Bais", "Menggala Sakti", "Menggala Sempurna", "Sedinginan", "Sekeladi", "Sekeladi Hilir", "Sintong", "Sintong Bakti", "Sintong Makmur", "Sintong Pusaka", "Teluk Berembun", "Teluk Mega", "Ujung Tanjung"],
        "Tanah Putih Tanjung Melawan": ["Batu Hampar", "Labuhan Papan", "Melayu Besar", "Melayu Besar Kota", "Melayu Tengah", "Mesah"],
        "Tanjung Medan": ["Akar Belingkar", "Perkebunan Tanjung Medan", "Pondok Kresek", "Sri Kayangan", "Sei Meranti", "Sei Meranti Darussalam", "Sungai Tapah", "Tangga Batu", "Tanjung Medan", "Tanjung Medan Barat", "Tanjung Medan Utara", "Tanjung Sari"]
    },
    "ROKAN HULU": {
        "Bangun Purba": ["Bangun Purba", "Bangun Purba Barat", "Bangun Purba Timur Jaya", "Pasir Agung", "Pasir Intan", "Rambah Jaya", "Tangun"],
        "Bonai Darussalam": ["Bonai", "Kasang Mungkal", "Kasang Padang", "Pauh", "Rawa Makmur", "Sontang", "Teluk Sono"],
        "Kabun": ["Aliantan", "Batu Langkah", "Bencah Kesuma", "Giti", "Kabun", "Koto Ranah"],
        "Kepenuhan": ["Kepenuhan Barat", "Kepenuhan Barat Mulya", "Kepenuhan Barat Sei Rokan Jaya", "Kepenuhan Baru", "Kepenuhan Hilir", "Kepenuhan Raya", "Kepenuhan Tengah", "Kepenuhan Timur", "Rantau Binuang Sakti", "Ulak Patian"],
        "Kepenuhan Hulu": ["Kepayan", "Kepenuhan Hulu", "Kepenuhan Jaya", "Muara Jaya", "Pekan Tebih"],
        "Kunto Darussalam": ["Bagan Tujuh", "Bukit Intan Makmur", "Kota Baru", "Kota Intan", "Kota Lama", "Muara Dilam", "Pasir Indah", "Pasir Luhur", "Sungai Kuti"],
        "Pagaran Tapah Darussalam": ["Kembang Damai", "Pagaran Tapah", "Sangir Jaya"],
        "Pendalian IV Koto": ["Air Panas", "Bengkolan Salak", "Pendalian", "Sei Kandis", "Suligi"],
        "Rambah": ["Babussalam", "Koto Tinggi", "Menaming", "Pasir Baru", "Pasir Maju", "Pasir Pengaraian", "Pematang Berangan", "Rambah Tengah Barat", "Rambah Tengah Hilir", "Rambah Tengah Hulu", "Rambah Tengah Utara", "Sialang Jaya", "Suka Maju", "Tanjung Belit"],
        "Rambah Hilir": ["Lubuk Kerapat", "Muara Musu", "Pasir Jaya", "Pasir Utama", "Rambah", "Rambah Hilir", "Rambah Hilir Tengah", "Rambah Hilir Timur", "Rambah Muda", "Sejati", "Serombau Indah", "Sungai Dua Indah", "Sungai Sitolang"],
        "Rambah Samo": ["Karya Mulia", "Langkitin", "Lubuk Bilang", "Lubuk Napal", "Marga Mulya", "Masda Makmur", "Pasir Makmur", "Rambah Baru", "Rambah Samo", "Rambah Samo Barat", "Rambah Utama", "Sei Kuning", "Sei Salak", "Teluk Aur"],
        "Rokan IV Koto": ["Air Panas", "Bengkolan Salak", "Cipang Kanan", "Cipang Kiri Hilir", "Cipang Kiri Hulu", "Lubuk Bendahara", "Lubuk Bendahara Timur", "Pendalian", "Rokan", "Rokan Koto Ruang", "Sikebau Jaya", "Suligi", "Tanjung Medan"],
        "Tambusai": ["Batang Kumu", "Batas", "Lubuk Soting", "Rantau Panjang", "Sialang Rindang", "Suka Maju", "Sungai Kumango", "Tali Kumain", "Tambusai Barat", "Tambusai Tengah", "Tingkok"],
        "Tambusai Utara": ["Bangun Jaya", "Mahato", "Mahato Sakti", "Mekar Jaya", "Pagar Mayang", "Payung Sekaki", "Rantau Sakti", "Simpang Harapan", "Suka Damai", "Tambusai Utara", "Tanjung Medan"],
        "Tandun": ["Bono Tapung", "Dayo", "Koto Tandun", "Kumain", "Puo Raya", "Sungai Kuning", "Tandun", "Tandun Barat", "Tapung Jaya"],
        "Ujung Batu": ["Ngaso", "Pematang Tebih", "Suka Damai", "Ujung Batu", "Ujung Batu Timur"]
    },
    "SIAK": {
        "Bunga Raya": ["Buatan Lestari", "Bunga Raya", "Dayang Suri", "Jati Baru", "Jaya Pura", "Kemuning Muda", "Langsat Permai", "Suak Merambai", "Temusai", "Tuah Indrapura"],
        "Dayun": ["Banjar Seminai", "Berumbung Baru", "Buana Makmur", "Dayun", "Lubuk Tilan", "Merangkai", "Pangkalan Makmur", "Sawit Permai", "Sialang Sakti", "Suka Mulya", "Teluk Merbau"],
        "Kandis": ["Bekalar", "Belutu", "Jambai Makmur", "Kandis", "Libo Jaya", "Pencing Bekulo", "Sam Sam", "Sungai Gondang", "Kandis Kota", "Simpang Belutu", "Telaga Sam Sam"],
        "Kerinci Kanan": ["Buana Bakti", "Buatan Baru", "Bukit Agung", "Bukit Harapan", "Delima Jaya", "Gabung Makmur", "Jati Mulya", "Kerinci Kanan", "Kerinci Kiri", "Kumbara Utama", "Seminai", "Simpang Perak Jaya"],
        "Koto Gasip": ["Buatan I", "Buatan II", "Empang Pandan", "Keranji Guguh", "Kuala Gasip", "Pangkalan Pisang", "Rantau Panjang", "Sengkemang", "Sri Gemilang", "Tasik Seminai", "Teluk Rimba"],
        "Lubuk Dalam": ["Empang Baru", "Lubuk Dalam", "Rawang Kao", "Rawang Kao Barat", "Sialang Baru", "Sialang Palas", "Sri Gading"],
        "Mempura": ["Benteng Hilir", "Benteng Hulu", "Kampung Tengah", "Kota Ringin", "Merempan Hilir", "Paluh", "Telukmerempan", "Sungai Mempura"],
        "Minas": ["Mandi Angin", "Minas Barat", "Minas Timur", "Rantau Bertuah", "Minas Jaya"],
        "Pusako": ["Benayah", "Dosan", "Dusun Pusaka", "Pebadaran", "Perincit", "Sungai Berbari", "Sungai Limau"],
        "Sabak Auh": ["Bandar Pedada", "Bandar Sungai", "Belading", "Laksamana", "Rempak", "Sabak Permai", "Selat Guntung", "Sungai Tengah"],
        "Siak": ["Buantan Besar", "Kampung Dalam", "Kampung Rempak", "Langkai", "Merempan Hulu", "Rawang Air Putih", "Suak Lanjut", "Tumang"],
        "Sungai Apit": ["Bunsur", "Harapan", "Kayu Ara Permai", "Lalang", "Mengkapan", "Parit I/II", "Penyengat", "Rawa Mekar Jaya", "Sungai Apit", "Sungai Kayu Ara", "Sungai Rawa", "Tanjung Kuras", "Teluk Batil", "Teluk Lanus", "Teluk Mesjid"],
        "Sungai Mandau": ["Bencah Umbai", "Lubuk Jering", "Lubuk Umbut", "Muara Bungkal", "Muara Kelantan", "Olak", "Sungai Selodang", "Tasik Betung", "Teluk Lancang"],
        "Tualang": ["Maredan", "Maredan Barat", "Perawang", "Perawang Barat", "Pinang Sebatang", "Pinang Sebatang Barat", "Pinang Sebatang Timur", "Tualang", "Tualang Timur"]
    }
};

// Definisikan skema validasi menggunakan Zod
const registerSchema = z.object({
  name: z.string().min(3, "Nama harus diisi, minimal 3 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  // Tambahkan validasi untuk field lain jika perlu
  nama_usaha: z.string().min(1, "Nama usaha harus diisi"),
});

function RegisterPage({ showSuccessToast, showErrorToast }) {
    const [formData, setFormData] = useState({
        provinsi: "RIAU",
        latitude: '',
        longitude: ''
        // Tambahkan state awal lainnya jika perlu
    });
    const [files, setFiles] = useState({});
    const navigate = useNavigate();

    const [kabupatenList] = useState(Object.keys(dataWilayah));
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (coords) => {
        setFormData(prev => ({
            ...prev,
            latitude: coords.lat.toFixed(6),
            longitude: coords.lng.toFixed(6)
        }));
    };

    const handleKabupatenChange = (e) => {
        const kab = e.target.value;
        handleChange(e);
        if (kab && dataWilayah[kab]) {
            setKecamatanList(Object.keys(dataWilayah[kab]));
        } else {
            setKecamatanList([]);
        }
        setDesaList([]);
        setFormData(prev => ({ ...prev, kecamatan: '', desa: '' }));
    };

    const handleKecamatanChange = (e) => {
        const kec = e.target.value;
        handleChange(e);
        const kab = formData.kabupaten;
        if (kab && kec && dataWilayah[kab] && dataWilayah[kab][kec]) {
            setDesaList(dataWilayah[kab][kec]);
        } else {
            setDesaList([]);
        }
        setFormData(prev => ({ ...prev, desa: '' }));
    };

    const handleFileChange = (e) => {
        setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        for (const key in files) {
            if (files[key]) {
                data.append(key, files[key]);
            }
        }

        console.log("Data yang akan dikirim ke backend:", Object.fromEntries(data.entries()));

        try {
            // PERBAIKAN: Menggunakan URL dari environment variable
            await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            showSuccessToast("Pendaftaran berhasil! Anda akan diarahkan ke halaman login.");
            
            setTimeout(() => {
                navigate('/login');
            }, 4000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registrasi gagal. Periksa kembali data Anda.';
            showErrorToast(errorMessage);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-md-center">
                <Col md={10}>
                    <Card>
                        <Card.Header as="h4">Form Registrasi Pelaku & Brand Usaha</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Apakah anda berprofesi sebagai PNS/TNI/POLRI/PEGAWAI BUMN/BUMD?</Form.Label>
                                    <Col sm={8}>
                                        <Form.Check inline type="radio" label="Ya" name="is_pns" value="true" onChange={handleChange} />
                                        <Form.Check inline type="radio" label="Tidak" name="is_pns" value="false" onChange={handleChange} />
                                    </Col>
                                </Form.Group>
                                <hr />
                                <p className="fw-bold">DATA DIRI</p>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Nomor Induk Kependudukan (NIK)</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="nik" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Nomor Kartu Keluarga (KK)</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="nomor_kk" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Nama Pelaku Usaha (sesuai KTP)</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="name" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Tempat & Tanggal Lahir</Form.Label>
                                    <Col sm={5}><Form.Control type="text" name="tempat_lahir" placeholder="Tempat Lahir" onChange={handleChange} required /></Col>
                                    <Col sm={3}><Form.Control type="date" name="tanggal_lahir" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>NPWP</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="npwp" onChange={handleChange} /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Jenis Kelamin</Form.Label>
                                    <Col sm={8}>
                                        <Form.Check inline type="radio" label="Laki-laki" name="jenis_kelamin" value="Laki-laki" onChange={handleChange} />
                                        <Form.Check inline type="radio" label="Perempuan" name="jenis_kelamin" value="Perempuan" onChange={handleChange} />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Foto KTP</Form.Label>
                                    <Col sm={8}><Form.Control type="file" name="foto_ktp" onChange={handleFileChange} required /></Col>
                                </Form.Group>
                                <hr />
                                <p className="fw-bold">ALAMAT PELAKU USAHA (Sesuai Domisili)</p>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Provinsi</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="provinsi" value="RIAU" readOnly /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Kabupaten/Kota</Form.Label>
                                    <Col sm={8}>
                                        <Form.Select name="kabupaten" onChange={handleKabupatenChange} required>
                                            <option value="">--Pilih Nama Kabupaten--</option>
                                            {kabupatenList.map(kab => <option key={kab} value={kab}>{kab}</option>)}
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Kecamatan</Form.Label>
                                    <Col sm={8}>
                                        <Form.Select name="kecamatan" onChange={handleKecamatanChange} required disabled={kecamatanList.length === 0}>
                                            <option value="">--Pilih Nama Kecamatan--</option>
                                            {kecamatanList.map(kec => <option key={kec} value={kec}>{kec}</option>)}
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Desa/Kelurahan</Form.Label>
                                    <Col sm={8}>
                                        <Form.Select name="desa" onChange={handleChange} required disabled={desaList.length === 0}>
                                            <option value="">--Pilih Nama Desa/Kelurahan--</option>
                                            {desaList.map(desa => <option key={desa} value={desa}>{desa}</option>)}
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Alamat Lengkap</Form.Label>
                                    <Col sm={8}><Form.Control as="textarea" rows={3} name="alamat_lengkap" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <hr />
                                <p className="fw-bold">DATA BRAND USAHA</p>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Nama atau Brand Usaha</Form.Label><Col sm={8}><Form.Control type="text" name="nama_usaha" onChange={handleChange} required /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Tahun Berdiri</Form.Label><Col sm={8}><Form.Control type="number" name="tahun_berdiri" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Nomor Izin Berusaha (NIB)</Form.Label><Col sm={8}><Form.Control type="text" name="nomor_nib" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Tanggal Terbit NIB</Form.Label><Col sm={8}><Form.Control type="date" name="tanggal_nib" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Upload File NIB/SKDU</Form.Label><Col sm={8}><Form.Control type="file" name="file_nib" onChange={handleFileChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Kondisi Usaha</Form.Label><Col sm={8}><Form.Check inline type="radio" name="kondisi_usaha" value="Masih Berjalan" onChange={handleChange} /><Form.Check inline type="radio" name="kondisi_usaha" value="Sudah Tutup" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Nomor Telepon/HP Usaha</Form.Label>
                                    <Col sm={8}><Form.Control type="text" name="nomor_telepon" onChange={handleChange} required /></Col>
                                </Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={12}>
                                        Pilih Lokasi Usaha di Peta (Klik pada Peta)
                                    </Form.Label>
                                    <Col sm={12}>
                                        <MapPicker onLocationChange={handleLocationSelect} />
                                    </Col>
                                    <Col sm={6} className="mt-2">
                                        <Form.Control type="text" name="latitude" placeholder="Latitude" value={formData.latitude} readOnly disabled />
                                    </Col>
                                    <Col sm={6} className="mt-2">
                                        <Form.Control type="text" name="longitude" placeholder="Longitude" value={formData.longitude} readOnly disabled />
                                    </Col>
                                </Form.Group>
                                <hr />
                                <p className="fw-bold">LEGALITAS & KLASIFIKASI USAHA</p>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Badan Hukum/Legalitas</Form.Label><Col sm={8}><Form.Check type="radio" name="badan_hukum" label="Belum Ada" value="Belum Ada" onChange={handleChange} /><Form.Check type="radio" name="badan_hukum" label="Perseorangan" value="Perseorangan" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={4}>Klasifikasi Usaha (Omset)</Form.Label>
                                    <Col sm={8}>
                                        <Form.Check type="radio" name="klasifikasi" label="Mikro (0 - 300 Juta/Tahun)" value="Usaha Mikro" onChange={handleChange} />
                                        <Form.Check type="radio" name="klasifikasi" label="Kecil (300 Juta - 2,5 Miliar/Tahun)" value="Usaha Kecil" onChange={handleChange} />
                                        <Form.Check type="radio" name="klasifikasi" label="Menengah (2,5 Miliar - 50 Miliar/Tahun)" value="Usaha Menengah" onChange={handleChange} />
                                    </Col>
                                </Form.Group>
                                <hr />
                                <p className="fw-bold">INFORMASI TAMBAHAN</p>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Lingkungan Lokasi Usaha</Form.Label><Col sm={8}><Form.Check type="radio" name="lingkungan_lokasi" label="Dalam Pemukiman/Perumahan" value="Pemukiman" onChange={handleChange} /><Form.Check type="radio" name="lingkungan_lokasi" label="Dalam Pasar/Pusat Perbelanjaan/Mall" value="Pusat Perbelanjaan" onChange={handleChange} /><Form.Check type="radio" name="lingkungan_lokasi" label="Dalam Ruko/Rukan" value="Ruko" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Foto Pemilik Usaha</Form.Label><Col sm={8}><Form.Control type="file" name="foto_pemilik" onChange={handleFileChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Foto Tempat Usaha</Form.Label><Col sm={8}><Form.Control type="file" name="foto_tempat_usaha" onChange={handleFileChange} /></Col></Form.Group>
                                <hr />
                                <p className="fw-bold">DATA AKUN & KONTAK</p>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Alamat Email</Form.Label><Col sm={8}><Form.Control type="email" name="email" onChange={handleChange} required /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Password</Form.Label><Col sm={8}><Form.Control type="password" name="password" onChange={handleChange} required /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Alamat Website</Form.Label><Col sm={8}><Form.Control type="text" name="website" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Akun Facebook</Form.Label><Col sm={8}><Form.Control type="text" name="facebook" onChange={handleChange} /></Col></Form.Group>
                                <Form.Group as={Row} className="mb-3"><Form.Label column sm={4}>Akun Instagram</Form.Label><Col sm={8}><Form.Control type="text" name="instagram" onChange={handleChange} /></Col></Form.Group>
                                <div className="d-grid mt-4">
                                    <Button variant="primary" type="submit">Kirim Data</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterPage;