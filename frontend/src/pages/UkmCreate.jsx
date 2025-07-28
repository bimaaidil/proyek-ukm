import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import api from '../api'; // 1. Impor instance axios terpusat

function UkmCreate() {
    const [namaUsaha, setNamaUsaha] = useState('');
    const [namaPemilik, setNamaPemilik] = useState('');
    const [alamat, setAlamat] = useState('');
    const [kategoriUsaha, setKategoriUsaha] = useState('');
    const [nomorTelepon, setNomorTelepon] = useState('');
    const [modalUsaha, setModalUsaha] = useState('');
    const navigate = useNavigate();

    const saveUkm = async (e) => {
        e.preventDefault();
        
        try {
            // 2. Gunakan 'api.post' agar token otentikasi otomatis ditambahkan
            await api.post('/api/ukm', {
                nama_usaha: namaUsaha,
                nama_pemilik: namaPemilik,
                alamat: alamat,
                kategori_usaha: kategoriUsaha,
                nomor_telepon: nomorTelepon,
                modal_usaha: parseFloat(modalUsaha),
            });
            navigate('/');
        } catch (error) {
            console.error("Gagal menyimpan data UKM:", error);
            // Anda bisa menambahkan notifikasi error untuk pengguna di sini
        }
    };

    return (
        <div>
            <h2>Tambah Data UKM Baru</h2>
            <Form onSubmit={saveUkm}>
                <Form.Group className="mb-3">
                    <Form.Label>Nama Usaha</Form.Label>
                    <Form.Control type="text" value={namaUsaha} onChange={(e) => setNamaUsaha(e.target.value)} placeholder="Masukkan Nama Usaha" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Nama Pemilik</Form.Label>
                    <Form.Control type="text" value={namaPemilik} onChange={(e) => setNamaPemilik(e.target.value)} placeholder="Masukkan Nama Pemilik" />
                </Form.Group>
                 <Form.Group className="mb-3">
                    <Form.Label>Alamat</Form.Label>
                    <Form.Control as="textarea" rows={3} value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Masukkan Alamat" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Kategori Usaha</Form.Label>
                    <Form.Control type="text" value={kategoriUsaha} onChange={(e) => setKategoriUsaha(e.target.value)} placeholder="Contoh: Kuliner, Fashion" />
                </Form.Group>
                 <Form.Group className="mb-3">
                    <Form.Label>Nomor Telepon</Form.Label>
                    <Form.Control type="text" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)} placeholder="Masukkan Nomor Telepon" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Modal Usaha (Rp)</Form.Label>
                    <Form.Control type="number" value={modalUsaha} onChange={(e) => setModalUsaha(e.target.value)} placeholder="Contoh: 50000000" />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                    Simpan
                </Button>
            </Form>
        </div>
    );
}

export default UkmCreate;