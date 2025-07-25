import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Badge, Spinner, Alert } from 'react-bootstrap';
import { MapPin, Building, Phone, Mail, Globe, Hash, Edit, Instagram, Facebook, Image as ImageIcon, User } from 'lucide-react';
import api from '../api';
import './ProfilePage.css'; // File CSS ini tetap digunakan

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // State dan fetch untuk mapsApiKey sudah dihapus karena tidak diperlukan lagi

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/me');
                setProfile(response.data);
            } catch (err) {
                setError("Gagal mengambil data. Silakan coba login kembali.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex vh-100 align-items-center justify-content-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    
    if (!profile) return null;

    const ukm = profile.ukm && profile.ukm.length > 0 ? profile.ukm[0] : null;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const bannerImageUrl = ukm?.foto_tempat_usaha
        ? `${apiUrl}/${ukm.foto_tempat_usaha.replace(/\\/g, '/')}`
        : 'https://placehold.co/1200x400/0d6efd/FFFFFF?text=Tempat+Usaha';
    
    const profileImageUrl = ukm?.foto_pemilik 
        ? `${apiUrl}/${ukm.foto_pemilik.replace(/\\/g, '/')}`
        : `https://placehold.co/150x150/EFEFEF/333?text=${profile.name.charAt(0)}`;

    return (
        <div className="profile-page-visual">
            {/* --- Bagian Header dengan Banner --- */}
            <div className="profile-header-container">
                <Image src={bannerImageUrl} className="profile-banner-image" />
                <div className="profile-header-content">
                    <Image 
                        src={profileImageUrl} 
                        roundedCircle 
                        className="profile-avatar"
                    />
                    <div className="profile-header-text">
                        <h2 className="fw-bold text-white mb-1">{ukm?.nama_usaha || profile.name}</h2>
                        <p className="text-white-50">{ukm?.kategori_usaha || 'Belum ada kategori'}</p>
                    </div>
                    {ukm && (
                        <Button as={Link} to={`/edit/${ukm.id}`} variant="light" size="sm" className="edit-button-header">
                            <Edit size={16} className="me-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <Container className="py-5">
                {ukm ? (
                    <Row className="g-4">
                        {/* --- Kolom Kiri: Informasi Detail --- */}
                        <Col lg={8}>
                            {/* Card Tentang Usaha */}
                            <Card className="shadow-sm border-0 mb-4">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center"><Building size={20} className="me-2 text-primary"/> Tentang Usaha</h5>
                                    <p className="text-muted">
                                    </p>
                                    <hr />
                                    <Row>
                                        <Col sm={6}><p className="mb-2"><strong>Klasifikasi:</strong> <Badge bg="info">{ukm.klasifikasi || '-'}</Badge></p></Col>
                                        <Col sm={6}><p className="mb-2"><strong>Kondisi:</strong> <Badge bg={ukm.kondisi_usaha === 'Masih Berjalan' ? 'success' : 'secondary'}>{ukm.kondisi_usaha || '-'}</Badge></p></Col>
                                        <Col sm={6}><p className="mb-2"><strong>Tahun Berdiri:</strong> {ukm.tahun_berdiri || '-'}</p></Col>
                                        <Col sm={6}><p className="mb-2"><strong>Badan Hukum:</strong> {ukm.badan_hukum || '-'}</p></Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                             {/* Card Lokasi */}
                            <Card className="shadow-sm border-0">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center"><MapPin size={20} className="me-2 text-primary"/> Lokasi</h5>
                                    <p><strong>Alamat:</strong> {ukm.alamat}</p>
                                    <p><strong>Lingkungan:</strong> {ukm.lingkungan_lokasi || '-'}</p>
                                    
                                    {/* PERBAIKAN: Ganti peta dengan tombol link */}
                                    {ukm.latitude && ukm.longitude ? (
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            href={`https://www.google.com/maps?q=${ukm.latitude},${ukm.longitude}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            Lihat Lokasi di Google Maps
                                        </Button>
                                    ) : <p className="text-muted small">Koordinat lokasi tidak tersedia.</p>}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* --- Kolom Kanan: Kontak & Info Pemilik --- */}
                        <Col lg={4}>
                            <Card className="shadow-sm border-0">
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center"><Phone size={20} className="me-2 text-primary"/> Kontak & Info</h5>
                                    <ul className="list-unstyled">
                                        <li className="d-flex align-items-center mb-2"><User size={16} className="me-3 text-muted"/><span className="fw-bold">{profile.name}</span></li>
                                        <li className="d-flex align-items-center mb-2"><Mail size={16} className="me-3 text-muted"/><span>{profile.email}</span></li>
                                        <li className="d-flex align-items-center mb-3"><Phone size={16} className="me-3 text-muted"/><span>{ukm.nomor_telepon || '-'}</span></li>
                                    </ul>
                                    <hr />
                                     <ul className="list-unstyled">
                                        {ukm.website && <li className="d-flex align-items-center mb-2"><Globe size={16} className="me-3 text-muted"/><a href={!ukm.website.startsWith('http') ? `http://${ukm.website}` : ukm.website} target="_blank" rel="noopener noreferrer">{ukm.website}</a></li>}
                                        {ukm.facebook && <li className="d-flex align-items-center mb-2"><Facebook size={16} className="me-3 text-muted"/><a href={!ukm.facebook.startsWith('http') ? `https://facebook.com/${ukm.facebook}` : ukm.facebook} target="_blank" rel="noopener noreferrer">{ukm.facebook}</a></li>}
                                        {ukm.instagram && <li className="d-flex align-items-center"><Instagram size={16} className="me-3 text-muted"/><a href={!ukm.instagram.startsWith('http') ? `https://instagram.com/${ukm.instagram}` : ukm.instagram} target="_blank" rel="noopener noreferrer">@{ukm.instagram}</a></li>}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <Alert variant="info">
                        Anda belum memiliki data usaha yang terdaftar. Silakan lengkapi profil Anda.
                    </Alert>
                )}
            </Container>
        </div>
    );
}

export default ProfilePage;
