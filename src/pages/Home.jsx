import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/pages/Home.css';

// Constantes para rutas
const ROUTES = {
    EMPLOYEE_LOGIN: '/employee/login',
    ADMIN_LOGIN: '/admin/login'
};

// Variantes de animación reutilizables
const fadeInUp = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
};

const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
};

const Home = () => {
    return (
        <div className="home-container">
            <motion.div
                className="home-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="home-header"
                    initial={fadeInUp.initial}
                    animate={fadeInUp.animate}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <img
                        src="/logo-vinoplastic.png"
                        alt="Logo de Vino Plastic"
                        className="home-logo"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <h1 className="home-title">Clima Laboral</h1>
                    <p className="home-subtitle">Selecciona tu perfil para continuar</p>
                </motion.div>

                <div className="home-options">
                    <motion.div
                        initial={scaleIn.initial}
                        animate={scaleIn.animate}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to={ROUTES.EMPLOYEE_LOGIN}
                            className="option-card employee-option"
                            aria-label="Acceso para empleados - Responder encuesta de clima laboral"
                        >
                            <div className="option-icon" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <h2>Empleado</h2>
                            <p>Responder encuesta</p>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={scaleIn.initial}
                        animate={scaleIn.animate}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to={ROUTES.ADMIN_LOGIN}
                            className="option-card admin-option"
                            aria-label="Acceso para administradores - Ver resultados de encuestas"
                        >
                            <div className="option-icon" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <h2>Administrador</h2>
                            <p>Ver resultados</p>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    className="home-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <p>🔒 Tus respuestas son confidenciales</p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Home;
