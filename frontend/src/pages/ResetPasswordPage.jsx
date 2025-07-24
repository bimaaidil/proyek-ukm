import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../api';
import { toast } from 'react-toastify';

function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Password dan konfirmasi password tidak cocok.");
        }
        setLoading(true);
        try {
            const response = await api.post(`/api/reset-password/${token}`, { password });
            toast.success(response.data.message + " Anda akan diarahkan ke halaman login.");
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gagal mereset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="w-100">
                <Col md={6} lg={5} xl={4} className="mx-auto">
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <h3 className="text-center mb-4">Reset Password</h3>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formNewPassword">
                                    <Form.Label>Password Baru</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Masukkan password baru"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formConfirmPassword">
                                    <Form.Label>Konfirmasi Password Baru</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Konfirmasi password baru"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Reset Password'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ResetPasswordPage;
