import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Row, Col, Image, Accordion } from 'react-bootstrap';
import api from '../api';
import './ProfilePage.css'; // Kita akan buat file CSS ini

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/me');
                setProfile(response.data);
            } catch (err) {
                setError("Gagal mengambil data profil. Silakan coba login kembali.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <Container className="text-center mt-5"><Spinner /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!profile) return null;

    const ukm = profile.ukm[0];
    const apiUrl = import.meta.env.VITE_API_URL;

    // URL untuk foto pemilik, dengan fallback ke placeholder jika tidak ada
    const profileImageUrl = ukm?.foto_pemilik 
        ? `${apiUrl}/${ukm.foto_pemilik.replace(/\\/g, '/')}`
        : 'https://placehold.co/150x150/EFEFEF/333?text=Foto';

    return (
        <Container className="my-5">
            <Row>
                {/* Kolom Kiri: Kartu Profil Personal */}
                <Col md={4} className="mb-4">
                    <Card className="text-center shadow-sm h-100">
                        <Card.Body>
                            <Image 
                                src={profileImageUrl} 
                                roundedCircle 
                                className="profile-image mb-3"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/EFEFEF/333?text=Gagal+Muat'; }}
                            />
                            <h4>{profile.name}</h4>
                            <p className="text-muted">{profile.email}</p>
                            <p>NIK: {profile.nik}</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Kolom Kanan: Detail Usaha */}
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Header as="h4" className="p-3 d-flex justify-content-between align-items-center">
                            <span>Data Usaha Anda</span>
                            {ukm && (
                                <Button as={Link} to={`/edit/${ukm.id}`} variant="primary" size="sm">
                                    Edit Data
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {ukm ? (
                                <Accordion defaultActiveKey="0" alwaysOpen>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Informasi Umum Usaha</Accordion.Header>
                                        <Accordion.Body>
                                            <p><strong>Nama Usaha:</strong> {ukm.nama_usaha}</p>
                                            <p><strong>Klasifikasi:</strong> {ukm.klasifikasi || '-'}</p>
                                            <p><strong>Kategori:</strong> {ukm.kategori_usaha || '-'}</p>
                                            <p><strong>Tahun Berdiri:</strong> {ukm.tahun_berdiri || '-'}</p>
                                            <p><strong>Kondisi Usaha:</strong> {ukm.kondisi_usaha || '-'}</p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>Alamat & Lokasi</Accordion.Header>
                                        <Accordion.Body>
                                            <p><strong>Alamat Lengkap:</strong> {ukm.alamat}</p>
                                            <p><strong>Lingkungan:</strong> {ukm.lingkungan_lokasi || '-'}</p>
                                            {ukm.latitude && ukm.longitude && (
                                                <a href={`https://www.google.com/maps?q=${ukm.latitude},${ukm.longitude}`} target="_blank" rel="noopener noreferrer">
                                                    Lihat di Google Maps
                                                </a>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Kontak & Media Sosial</Accordion.Header>
                                        <Accordion.Body>
                                            <p><strong>Nomor Telepon:</strong> {ukm.nomor_telepon || '-'}</p>
                                            <p><strong>Website:</strong> {ukm.website ? <a href={ukm.website} target="_blank" rel="noopener noreferrer">{ukm.website}</a> : '-'}</p>
                                            <p><strong>Facebook:</strong> {ukm.facebook || '-'}</p>
                                            <p><strong>Instagram:</strong> {ukm.instagram || '-'}</p>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            ) : (
                                <Alert variant="info">
                                    Anda belum memiliki data usaha yang terdaftar.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ProfilePage;
