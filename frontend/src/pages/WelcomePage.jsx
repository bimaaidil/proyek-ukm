import React from 'react';
import { Link } from 'react-router-dom';

// Impor semua gambar yang dibutuhkan
import logoPemprov from '../assets/images/logo-pemprov.png';
import logoBpkp from '../assets/images/logobpkp.png';
import pejabat1 from '../assets/images/pejabat_1.png';
import pejabat2 from '../assets/images/pejabat_2.png';

function WelcomePage() {
  return (
    <div className="welcome-container">
      
      {/* PERBAIKAN: Bungkus semua konten utama dalam satu div. 
          Kita bisa gunakan tag <main> agar lebih semantik. */}
      <main className="content-wrapper">
        <header className="welcome-header">
          <img src={logoPemprov} alt="Logo Pemprov Riau" className="logo" />
          <img src={logoBpkp} alt="Logo BPKP" className="logo" />
        </header>

        <div className="official-photos">
          <img src={pejabat1} alt="Gubernur Riau" className="official-photo" />
          <img src={pejabat2} alt="Wakil Gubernur Riau" className="official-photo" />
        </div>

        <h1>
          DINAS PERINDUSTRIAN, <br />
          PERDAGANGAN, KOPERASI, UKM <br />
          PROVINSI RIAU
        </h1>

        <div className="hashtag-bar">
          #BANGGABUATANINDONESIA #BANGGABUATANRIAU #UMKMKIAURBANGKIT
        </div>

        <p className="cta-text">
          silahkan daftarkan Usaha anda pada link dibawah ini
        </p>

        <div className="action-buttons">
          <Link to="/register" className="btn btn-register">
            DAFTARKAN USAHA ANDA
          </Link>
          <Link to="/login" className="btn btn-login">
            LOGIN PELAKU USAHA
          </Link>
        </div>
      </main>

      {/* Link ini biarkan di luar agar posisinya absolut terhadap layar */}
      <a href="/hubungi-kami" className="contact-link">Hubungi Kami</a>
    </div>
  );
}

export default WelcomePage;