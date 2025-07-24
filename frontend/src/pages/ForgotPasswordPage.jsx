import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import api from '../api';
import { toast } from 'react-toastify';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.post('/api/forgot-password', { email });
            setMessage(response.data.message);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan.");
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
                            <h3 className="text-center mb-4">Lupa Password</h3>
                            <p className="text-muted text-center mb-4">
                                Masukkan alamat email Anda. Kami akan mengirimkan link untuk mereset password Anda.
                            </p>
                            {message && <Alert variant="success">{message}</Alert>}
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
                                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ForgotPasswordPage;
