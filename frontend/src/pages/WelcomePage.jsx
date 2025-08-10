import React from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css'; 

// Impor komponen dari react-bootstrap untuk tata letak dan video
import { Container, Row, Col, Card, Ratio } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Pastikan CSS Bootstrap diimpor

// Impor semua gambar yang dibutuhkan
import logoPemprov from '../assets/images/logo-pemprov.png';
import pakgub1 from '../assets/images/pakgub1.jpg';
import wagub from '../assets/images/wagub.jpg';

function WelcomePage() {
  // GANTI DENGAN ID VIDEO YOUTUBE ANDA
  const youtubeVideoId1 = 'OqE75g6DHs4'; // Contoh Video 1: Pariwisata Riau

  return (
    <div className="welcome-container">
      
      <main className="content-wrapper">
        <header className="welcome-header">
          <img src={logoPemprov} alt="Logo Pemprov Riau" className="logo" />
        </header>

        <div className="official-photos">
          <img src={pakgub1} alt="Gubernur Riau" className="official-photo" />
          <img src={wagub} alt="Wakil Gubernur Riau" className="official-photo" />
        </div>

        <h1>
          SISTEM INFORMASI GEOGRAFIS, <br />
          INDUSTRI MIKRO,KECIL,MENENGAH (IMKM) <br />
          PROVINSI RIAU
        </h1>

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

      {/* Bagian Video Kegiatan (Menggunakan react-bootstrap) */}
      <Container className="my-5">
          <Row className="justify-content-center text-center mb-4">
              <Col md={10}>
                  <h2 className="fw-bold">Video Penjelasan Aplikasi</h2>
                  <p className="text-muted">Aplikasi dibuat untuk menyelesaikan tugas Kerja Praktek.</p>
              </Col>
          </Row>
          <Row className="g-4 justify-content-center">
              {/* Video Pertama */}
              <Col md={6} lg={5}>
                  <Card className="shadow-lg border-0">
                      <Ratio aspectRatio="16x9">
                          <iframe
                              src={`https://www.youtube.com/embed/${youtubeVideoId1}`}
                              title="Video aplikasi"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ border: 0, borderRadius: '0.5rem' }}
                          ></iframe>
                      </Ratio>
                  </Card>
              </Col>
          </Row>
      </Container>

      <a href="/hubungi-kami" className="contact-link">Hubungi Kami</a>
    </div>
  );
}

export default WelcomePage;
