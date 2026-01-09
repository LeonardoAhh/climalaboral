import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Login.css';

const EmployeeLogin = () => {
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        curp: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginEmployee } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.employeeId || !formData.name || !formData.curp) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (formData.curp.length !== 18) {
            setError('El CURP debe tener 18 caracteres');
            return;
        }

        setLoading(true);

        try {
            const result = await loginEmployee(
                formData.employeeId,
                formData.name,
                formData.curp.toUpperCase()
            );

            if (result.surveyCompleted) {
                navigate('/employee/complete');
            } else {
                navigate('/employee/survey');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.message.includes('CURP')) {
                setError('CURP incorrecta. Por favor verifica tus datos.');
            } else {
                setError('Error al iniciar sesión. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link to="/" className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver
                </Link>

                <div className="login-header">
                    <div className="login-icon employee-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h1>Acceso de Empleado</h1>
                    <p>Ingresa tus datos para responder la encuesta</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <motion.div
                            className="alert alert-danger"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="form-group">
                        <label htmlFor="employeeId" className="form-label">
                            ID de Empleado
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            name="employeeId"
                            className="form-input"
                            placeholder="Ej: 12345"
                            value={formData.employeeId}
                            onChange={handleChange}
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            placeholder="Tu nombre completo"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="curp" className="form-label">
                            CURP
                        </label>
                        <input
                            type="text"
                            id="curp"
                            name="curp"
                            className="form-input"
                            placeholder="18 caracteres"
                            value={formData.curp}
                            onChange={handleChange}
                            maxLength={18}
                            disabled={loading}
                            style={{ textTransform: 'uppercase' }}
                        />
                        <div className="form-help">
                            Tu CURP será utilizada como contraseña
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            'Continuar a la Encuesta'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="footer-note">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        Solo podrás responder la encuesta una vez
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default EmployeeLogin;
