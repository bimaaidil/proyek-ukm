import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

function LoginPage({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Untuk error validasi form saja
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Mengambil URL API dari environment variable
            const apiUrl = import.meta.env.VITE_API_URL;

            // Mengirim data login ke backend
            const response = await axios.post(`${apiUrl}/api/login`, {
                email,
                password,
            });
            
            // PERBAIKAN: Simpan TOKEN, bukan seluruh data user
            localStorage.setItem('token', response.data.token);

            // Update state user di komponen App.jsx
            setUser(response.data.user);

            // Gunakan notifikasi toast yang lebih modern
            toast.success(`Login berhasil! Selamat datang, ${response.data.user.name}.`);
            
            // PERBAIKAN: Arahkan pengguna berdasarkan perannya (role)
            if (response.data.user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/profile');
            }

        } catch (err) {
            // Tampilkan pesan error dari backend menggunakan toast
            toast.error(err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4">Login</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Alamat Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Masukkan Email" 
                                        required 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan Password" 
                                        required 
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit">Login</Button>
                                </div>
                                <div className="text-center mt-3">
                                    <p>Belum punya akun? <Link to="/register">Registrasi disini</Link></p>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;
