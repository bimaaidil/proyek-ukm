import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Button, Form, Row, Col, InputGroup, Pagination, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import MapDisplay from './MapDisplay'; // Pastikan komponen ini ada dan berfungsi
import api from '../api';

function UkmList() {
    const [ukms, setUkms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk filter dan pencarian
    const [filter, setFilter] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    
    // State untuk paginasi
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State untuk peta
    const [mapCenter, setMapCenter] = useState([0.5071, 101.4478]); // Pusat Peta Pekanbaru
    const [mapZoom, setMapZoom] = useState(12);

    // --- PERBAIKAN: Gunakan useCallback agar fungsi ini tidak dibuat ulang terus-menerus ---
    const getUkms = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: activeSearch,
            });

            if (filter !== 'Semua') {
                params.append('klasifikasi', filter);
            }

            const response = await api.get(`/api/ukm?${params.toString()}`);
            
            if (response.data && Array.isArray(response.data.data)) {
                setUkms(response.data.data);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.currentPage || 1);
            } else {
                toast.error("Gagal memuat data: format tidak sesuai.");
                setUkms([]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mengambil data UKM.");
            setUkms([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, activeSearch, filter]); // Dependensi untuk useCallback

    // --- PERBAIKAN: useEffect sekarang hanya mengawasi perubahan dan memanggil getUkms ---
    useEffect(() => {
        getUkms();
    }, [getUkms]);

    const deleteUkm = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                const response = await api.delete(`/api/ukm/${id}`);
                toast.success(response.data.message);
                getUkms(); // Muat ulang data setelah hapus
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal menghapus data.');
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setActiveSearch(searchTerm);
    };

    const handleFilterChange = (e) => {
        const newFilter = e.target.value;
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFilter('Semua');
        setSearchTerm('');
        setActiveSearch('');
        setCurrentPage(1);
    };
    
    const handleViewLocation = (lat, long) => {
        if (lat && long) {
            setMapCenter([lat, long]);
            setMapZoom(17);
        } else {
            toast.warn('Data lokasi untuk usaha ini tidak tersedia.');
        }
    };

    // --- PERBAIKAN: Fungsi untuk membuat item paginasi yang lebih ringkas ---
    const createPaginationItems = () => {
        let items = [];
        // Logika untuk menampilkan paginasi (misal: << < 1 ... 4 5 6 ... 10 > >>)
        // Untuk sederhana, kita tetap tampilkan semua, tapi idealnya dibatasi
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return items;
    };

    return (
        <Container fluid className="p-4">
            <MapDisplay ukms={ukms} center={mapCenter} zoom={mapZoom} />

            <h2 className="mt-4">Data IMKM</h2>
            <Row className="mb-3 align-items-end gy-3">
                <Col md={4} lg={3}>
                    <Form.Group>
                        <Form.Label>Filter Berdasarkan Klasifikasi</Form.Label>
                        <Form.Select value={filter} onChange={handleFilterChange}>
                            <option value="Semua">Tampilkan Semua</option>
                            <option value="Usaha Mikro">Usaha Mikro</option>
                            <option value="Usaha Kecil">Usaha Kecil</option>
                            <option value="Usaha Menengah">Usaha Menengah</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={8} lg={5}>
                    <Form onSubmit={handleSearch}>
                        <Form.Group>
                            <Form.Label>Cari Berdasarkan Nama Usaha</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Masukkan nama usaha..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button type="submit" variant="success">Cari</Button>
                                <Button variant="secondary" onClick={handleReset}>Reset</Button>
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Memuat data...</p>
                </div>
            ) : ukms.length === 0 ? (
                <Alert variant="info">Tidak ada data UMKM yang ditemukan.</Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Usaha</th>
                                <th>Nama Pemilik</th>
                                <th>Klasifikasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ukms.map((ukm, index) => (
                                <tr key={ukm.id}>
                                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                                    <td>{ukm.nama_usaha}</td>
                                    <td>{ukm.nama_pemilik}</td>
                                    <td>{ukm.klasifikasi || '-'}</td>
                                    <td>
                                        <div className="d-flex flex-wrap">
                                            <Button onClick={() => handleViewLocation(ukm.latitude, ukm.longitude)} variant="success" size="sm" className="me-2 mb-1">Lokasi</Button>
                                            <Button as={Link} to={`/edit/${ukm.id}`} variant="info" size="sm" className="me-2 mb-1">Edit</Button>
                                            <Button onClick={() => deleteUkm(ukm.id)} variant="danger" size="sm" className="mb-1">Hapus</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center">
                            <Pagination>
                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
                                {createPaginationItems()}
                                <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}

export default UkmList;