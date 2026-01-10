import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EmployeeLogin from './pages/EmployeeLogin';
import AdminLogin from './pages/AdminLogin';
import Survey from './pages/Survey';
import SurveyComplete from './pages/SurveyComplete';
import AdminDashboard from './pages/AdminDashboard';
import './styles/index.css';
import './styles/components.css';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/employee/login" element={<EmployeeLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    <Route
                        path="/employee/survey"
                        element={
                            <ProtectedRoute requireEmployee>
                                <Survey />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/employee/complete"
                        element={
                            <ProtectedRoute requireEmployee>
                                <SurveyComplete />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
