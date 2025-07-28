import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';

// Menerima 'showSuccessToast' dan 'showErrorToast' dari props App.js
function LoginPage({ setUser, showSuccessToast, showErrorToast }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Mengambil alamat API dari environment variablee
            const apiUrl = import.meta.env.VITE_API_URL;

            const response = await axios.post(`${apiUrl}/api/login`, {
                email,
                password,
            });

            const { token, user } = response.data;

            // Simpan token ke localStorage untuk sesi login
            localStorage.setItem('token', token);
            // Update state user di komponen utama (App.js)
            setUser(user);

            // Tampilkan notifikasi sukses
            showSuccessToast(`Selamat datang kembali, ${user.name}!`);

            // Arahkan pengguna berdasarkan perannya
            if (user.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/profile');
            }

        } catch (err) {
            const message = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
            
            // Tampilkan notifikasi error
            showErrorToast(message);
        }
    };

    return (
        <Container
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '80vh' }}
        >
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <h2 className="text-center mb-4">Login</h2>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Alamat Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Masukkan email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-end mb-3">
                                    <Link to="/forgot-password" className="small">Lupa Password?</Link>
                                </div>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit">
                                        Login
                                    </Button>
                                </div>

                                <div className="text-center mt-3">
                                    <p className="small">
                                        Belum punya akun?{' '}
                                        <Link to="/register">Registrasi di sini</Link>
                                    </p>
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