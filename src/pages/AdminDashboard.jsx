import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { categoryInfo, defaultSurveyQuestions } from '../data/surveyQuestions';
import KPICard from '../components/admin/KPICard';
import CategoryChart from '../components/admin/CategoryChart';
import ResponsesTable from '../components/admin/ResponsesTable';
import QuestionEditor from '../components/admin/QuestionEditor';
import EmployeeManager from '../components/admin/EmployeeManager';
import DepartmentAnalytics from '../components/admin/DepartmentAnalytics';
import '../styles/pages/AdminDashboard.css';

const AdminDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, responses, questions, employees
    const { signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load responses
            const responsesSnapshot = await getDocs(collection(db, 'responses'));
            const responsesData = responsesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setResponses(responsesData);

            // Load employees
            const employeesSnapshot = await getDocs(collection(db, 'employees'));
            const employeesData = employeesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load survey progress
            const progressSnapshot = await getDocs(collection(db, 'surveyProgress'));
            const progressMap = {};
            progressSnapshot.docs.forEach(doc => {
                progressMap[doc.id] = true;
            });

            // Map progress to employees
            const employeesWithProgress = employeesData.map(emp => ({
                ...emp,
                hasProgress: !emp.surveyCompleted && progressMap[emp.id]
            }));

            setEmployees(employeesWithProgress);

            // Load questions
            const questionsSnapshot = await getDocs(collection(db, 'surveyQuestions'));
            if (!questionsSnapshot.empty) {
                const questionsData = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setQuestions(questionsData.sort((a, b) => a.id.localeCompare(b.id)));
            } else {
                setQuestions(defaultSurveyQuestions);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const handleSaveQuestions = async (updatedQuestions) => {
        try {
            // Delete all existing questions
            const questionsSnapshot = await getDocs(collection(db, 'surveyQuestions'));
            const deletePromises = questionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Save new questions
            const savePromises = updatedQuestions.map(question =>
                setDoc(doc(db, 'surveyQuestions', question.id), question)
            );
            await Promise.all(savePromises);

            setQuestions(updatedQuestions);
            alert('Preguntas actualizadas correctamente');
        } catch (error) {
            console.error('Error saving questions:', error);
            alert('Error al guardar las preguntas');
        }
    };

    // Employee CRUD operations
    const handleAddEmployee = async (employeeData) => {
        try {
            const newEmployee = {
                ...employeeData,
                surveyCompleted: false,
                completedAt: null,
                createdAt: new Date(),
                createdBy: 'admin'
            };

            await setDoc(doc(db, 'employees', `emp_${employeeData.employeeId}`), newEmployee);
            await loadData(); // Reload data
            alert('Empleado creado correctamente');
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Error al crear empleado: ' + error.message);
        }
    };

    const handleEditEmployee = async (employeeId, employeeData) => {
        try {
            await updateDoc(doc(db, 'employees', employeeId), employeeData);
            await loadData(); // Reload data
            alert('Empleado actualizado correctamente');
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Error al actualizar empleado');
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            await deleteDoc(doc(db, 'employees', employeeId));
            await loadData(); // Reload data
            alert('Empleado eliminado correctamente');
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Error al eliminar empleado');
        }
    };

    // Calculate KPIs
    const totalEmployees = employees.length;
    const completedSurveys = employees.filter(e => e.surveyCompleted).length;
    const participationRate = totalEmployees > 0
        ? ((completedSurveys / totalEmployees) * 100).toFixed(1)
        : 0;

    const overallAverage = responses.length > 0
        ? (responses.reduce((sum, r) => sum + r.overallScore, 0) / responses.length).toFixed(2)
        : 0;

    // Calculate category averages
    const categoryAverages = {};
    Object.keys(categoryInfo).forEach(category => {
        const scores = responses.map(r => r.categoryScores?.[category] || 0);
        const average = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
        categoryAverages[category] = parseFloat(average.toFixed(2));
    });

    // Find highest and lowest categories
    const sortedCategories = Object.entries(categoryAverages)
        .sort(([, a], [, b]) => b - a);
    const highestCategory = sortedCategories[0];
    const lowestCategory = sortedCategories[sortedCategories.length - 1];

    const exportToCSV = () => {
        if (responses.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const headers = ['ID Empleado', 'Nombre', 'Fecha', 'Promedio General'];
        Object.keys(categoryInfo).forEach(cat => {
            headers.push(categoryInfo[cat].name);
        });

        const rows = responses.map(r => {
            const row = [
                r.employeeId,
                r.employeeName,
                new Date(r.submittedAt.seconds * 1000).toLocaleDateString('es-MX'),
                r.overallScore
            ];
            Object.keys(categoryInfo).forEach(cat => {
                row.push(r.categoryScores?.[cat] || 0);
            });
            return row;
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `clima-laboral-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner spinner-lg"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <img src="/logo-vinoplastic.png" alt="Vino Plastic" className="dashboard-logo" />
                            <div>
                                <h1>Panel de Administración</h1>
                                <p className="dashboard-subtitle">
                                    Resultados de la Encuesta de Clima Laboral
                                </p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            Cerrar Sesión
                        </button>
                    </div>

                    <div className="dashboard-tabs">
                        <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                            Resumen
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'responses' ? 'active' : ''}`}
                            onClick={() => setActiveTab('responses')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            </svg>
                            Respuestas
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
                            onClick={() => setActiveTab('employees')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            Empleados
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('questions')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Editar Preguntas
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content container">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="kpi-grid">
                            <KPICard
                                title="Tasa de Participación"
                                value={`${participationRate}%`}
                                subtitle={`${completedSurveys} de ${totalEmployees} empleados`}
                                icon="users"
                                color="primary"
                                trend={participationRate >= 70 ? 'up' : 'down'}
                            />
                            <KPICard
                                title="Promedio General"
                                value={overallAverage}
                                subtitle="Escala de 1 a 5"
                                icon="star"
                                color="secondary"
                                trend={overallAverage >= 3.5 ? 'up' : 'down'}
                            />
                            <KPICard
                                title="Categoría Mejor Valorada"
                                value={highestCategory ? categoryInfo[highestCategory[0]]?.name : 'N/A'}
                                subtitle={highestCategory ? `${highestCategory[1]} puntos` : ''}
                                icon="trophy"
                                color="success"
                            />
                            <KPICard
                                title="Área de Oportunidad"
                                value={lowestCategory ? categoryInfo[lowestCategory[0]]?.name : 'N/A'}
                                subtitle={lowestCategory ? `${lowestCategory[1]} puntos` : ''}
                                icon="alert"
                                color="warning"
                            />
                        </div>

                        <div className="charts-section">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Resultados por Categoría</h3>
                                    <button onClick={exportToCSV} className="btn btn-outline btn-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Exportar CSV
                                    </button>
                                </div>
                                <div className="card-body">
                                    <CategoryChart data={categoryAverages} />
                                </div>
                            </div>
                        </div>

                        {/* Department and Area Analytics */}
                        <DepartmentAnalytics employees={employees} responses={responses} />
                    </motion.div>
                )}

                {activeTab === 'responses' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ResponsesTable responses={responses} />
                    </motion.div>
                )}

                {activeTab === 'employees' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <EmployeeManager
                            employees={employees}
                            onAdd={handleAddEmployee}
                            onEdit={handleEditEmployee}
                            onDelete={handleDeleteEmployee}
                        />
                    </motion.div>
                )}

                {activeTab === 'questions' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <QuestionEditor
                            questions={questions}
                            onSave={handleSaveQuestions}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
