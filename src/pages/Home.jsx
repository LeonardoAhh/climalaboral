import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/Home.css';

const Home = () => {
    const [isAdminView, setIsAdminView] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();

    // Admin form state
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Employee form state
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [employeeCurp, setEmployeeCurp] = useState('');

    const handleToggle = () => {
        setIsAdminView(!isAdminView);
        setError('');
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            setCurrentUser(userCredential.user);
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Admin login error:', err);
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Search for employee in database
            const employeesRef = collection(db, 'employees');
            const q = query(employeesRef, where('employeeId', '==', employeeId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('No se encontró el empleado. Verifica tu número de empleado.');
                setLoading(false);
                return;
            }

            const employeeDoc = querySnapshot.docs[0];
            const employeeData = employeeDoc.data();

            // Verify name and CURP
            if (employeeData.name.toUpperCase() !== employeeName.toUpperCase()) {
                setError('El nombre no coincide con el registro.');
                setLoading(false);
                return;
            }

            if (employeeData.curp.toUpperCase() !== employeeCurp.toUpperCase()) {
                setError('El CURP no coincide con el registro.');
                setLoading(false);
                return;
            }

            // Create user object for context
            const user = {
                uid: employeeDoc.id,
                ...employeeData
            };
            setCurrentUser(user);

            // Check if survey is already completed
            if (employeeData.surveyCompleted) {
                navigate('/employee/complete');
            } else {
                navigate('/employee/survey');
            }
        } catch (err) {
            console.error('Employee login error:', err);
            setError('Error al verificar credenciales. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="split-container">
            <AnimatePresence mode="wait">
                {isAdminView ? (
                    <motion.div
                        key="admin-view"
                        className="split-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Hero Left Side */}
                        <div className="hero-section hero-left">
                            <div className="hero-overlay"></div>
                            <div className="hero-content">
                                <motion.img
                                    src="/logo-vinoplastic.png"
                                    alt="Vino Plastic"
                                    className="hero-logo"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                />
                                <motion.h1
                                    className="hero-title"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Encuesta de<br />Clima Laboral
                                </motion.h1>
                                <motion.p
                                    className="hero-subtitle"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Tu opinión construye un mejor ambiente de trabajo
                                </motion.p>
                                <motion.div
                                    className="hero-features"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>100% Confidencial</span>
                                    </div>
                                    <div className="feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Solo 10 minutos</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Toggle Button */}
                        <button className="toggle-button" onClick={handleToggle} aria-label="Cambiar a login de empleado">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </button>

                        {/* Admin Login Right Side */}
                        <div className="form-section form-right">
                            <motion.div
                                className="form-card"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="form-header">
                                    <div className="form-icon admin-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    <h2>Panel de Administración</h2>
                                    <p>Accede para ver los resultados de las encuestas</p>
                                </div>

                                <form onSubmit={handleAdminLogin} className="login-form">
                                    {error && (
                                        <motion.div
                                            className="error-message"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="admin-email">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            id="admin-email"
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                            placeholder="correo@vinoplastic.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="admin-password">Contraseña</label>
                                        <input
                                            type="password"
                                            id="admin-password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn-submit admin-btn" disabled={loading}>
                                        {loading ? (
                                            <span className="loading-spinner"></span>
                                        ) : (
                                            <>
                                                Iniciar Sesión
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="form-footer">
                                    <button onClick={handleToggle} className="switch-link">
                                        ¿Eres empleado? <span>Ingresa aquí</span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="employee-view"
                        className="split-wrapper reversed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Employee Login Left Side */}
                        <div className="form-section form-left">
                            <motion.div
                                className="form-card"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="form-header">
                                    <div className="form-icon employee-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <h2>Acceso Empleado</h2>
                                    <p>Ingresa tus datos para responder la encuesta</p>
                                </div>

                                <form onSubmit={handleEmployeeLogin} className="login-form">
                                    {error && (
                                        <motion.div
                                            className="error-message"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="employee-id">Número de Empleado</label>
                                        <input
                                            type="text"
                                            id="employee-id"
                                            value={employeeId}
                                            onChange={(e) => setEmployeeId(e.target.value)}
                                            placeholder="Ej: 3204"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="employee-name">Nombre Completo</label>
                                        <input
                                            type="text"
                                            id="employee-name"
                                            value={employeeName}
                                            onChange={(e) => setEmployeeName(e.target.value.toUpperCase())}
                                            placeholder="NOMBRE APELLIDO APELLIDO"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="employee-curp">CURP</label>
                                        <input
                                            type="text"
                                            id="employee-curp"
                                            value={employeeCurp}
                                            onChange={(e) => setEmployeeCurp(e.target.value.toUpperCase())}
                                            placeholder="XXXX000000XXXXXX00"
                                            maxLength={18}
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="btn-submit employee-btn" disabled={loading}>
                                        {loading ? (
                                            <span className="loading-spinner"></span>
                                        ) : (
                                            <>
                                                Continuar a la Encuesta
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="form-footer">
                                    <button onClick={handleToggle} className="switch-link">
                                        ¿Eres administrador? <span>Ingresa aquí</span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Toggle Button */}
                        <button className="toggle-button" onClick={handleToggle} aria-label="Cambiar a login de administrador">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </button>

                        {/* Hero Right Side */}
                        <div className="hero-section hero-right">
                            <div className="hero-overlay"></div>
                            <div className="hero-content">
                                <motion.img
                                    src="/logo-vinoplastic.png"
                                    alt="Vino Plastic"
                                    className="hero-logo"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                />
                                <motion.h1
                                    className="hero-title"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Tu Voz<br />Importa
                                </motion.h1>
                                <motion.p
                                    className="hero-subtitle"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Juntos construimos el mejor lugar para trabajar
                                </motion.p>
                                <motion.div
                                    className="hero-features"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <div className="feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                        <span>Respuestas Anónimas</span>
                                    </div>
                                    <div className="feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                        </svg>
                                        <span>Mejora Continua</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
