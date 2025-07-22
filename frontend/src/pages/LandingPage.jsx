import { Container, Row, Col } from 'react-bootstrap';
import InfoSidebar from './InfoSidebar';
import RegisterForm from './RegisterPage';

function LandingPage() {
    return (
        <Container className="mt-4">
            <Row>
                <Col md={5}>
                    <InfoSidebar />
                </Col>
                <Col md={7}>
                    <RegisterForm />
                </Col>
            </Row>
        </Container>
    );
}

export default LandingPage;