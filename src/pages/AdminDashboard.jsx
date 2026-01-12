import { useState, useEffect, useMemo } from 'react';
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/pages/AdminDashboard.css';

const AdminDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, responses, questions, employees
    const [showExportMenu, setShowExportMenu] = useState(false);
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

    // Memoize expensive calculations
    const metrics = useMemo(() => {
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

        return {
            totalEmployees,
            completedSurveys,
            participationRate,
            overallAverage,
            categoryAverages,
            highestCategory,
            lowestCategory
        };
    }, [employees, responses]);

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

    const exportToExcel = () => {
        if (responses.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Prepare data
        const headers = ['ID Empleado', 'Nombre', 'Fecha', 'Promedio General'];
        Object.keys(categoryInfo).forEach(cat => {
            headers.push(categoryInfo[cat].name);
        });

        const data = responses.map(r => {
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

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, // ID
            { wch: 30 }, // Nombre
            { wch: 12 }, // Fecha
            { wch: 18 }, // Promedio
            ...Object.keys(categoryInfo).map(() => ({ wch: 20 }))
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
        XLSX.writeFile(wb, `clima-laboral-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportToPDF = () => {
        if (responses.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

        // Header
        doc.setFontSize(18);
        doc.setTextColor(26, 109, 162); // Primary blue
        doc.text('Reporte de Clima Laboral', 14, 15);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 22);
        doc.text(`Total de respuestas: ${responses.length}`, 14, 27);

        // Prepare table data
        const headers = [['ID', 'Nombre', 'Fecha', 'Promedio', ...Object.values(categoryInfo).map(c => c.name)]];

        const data = responses.map(r => [
            r.employeeId,
            r.employeeName,
            new Date(r.submittedAt.seconds * 1000).toLocaleDateString('es-MX'),
            r.overallScore.toFixed(2),
            ...Object.keys(categoryInfo).map(cat => (r.categoryScores?.[cat] || 0).toFixed(2))
        ]);

        // Add table
        doc.autoTable({
            head: headers,
            body: data,
            startY: 35,
            theme: 'grid',
            headStyles: {
                fillColor: [26, 109, 162], // Primary blue
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 8
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 50 },
                2: { cellWidth: 25 },
                3: { cellWidth: 20, halign: 'center' }
            },
            didParseCell: (data) => {
                // Color code scores
                if (data.section === 'body' && data.column.index >= 3) {
                    const value = parseFloat(data.cell.text[0]);
                    if (!isNaN(value)) {
                        if (value >= 4.0) {
                            data.cell.styles.textColor = [34, 197, 94]; // Green
                        } else if (value >= 3.0) {
                            data.cell.styles.textColor = [234, 179, 8]; // Yellow
                        } else {
                            data.cell.styles.textColor = [239, 68, 68]; // Red
                        }
                    }
                }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`clima-laboral-${new Date().toISOString().split('T')[0]}.pdf`);
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
                        <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
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
                                value={`${metrics.participationRate}%`}
                                subtitle={`${metrics.completedSurveys} de ${metrics.totalEmployees} empleados`}
                                icon="users"
                                color="primary"
                                trend={metrics.participationRate >= 70 ? 'up' : 'down'}
                            />
                            <KPICard
                                title="Promedio General"
                                value={metrics.overallAverage}
                                subtitle="Escala de 1 a 5"
                                icon="star"
                                color="secondary"
                                trend={metrics.overallAverage >= 3.5 ? 'up' : 'down'}
                            />
                            <KPICard
                                title="Categoría Mejor Valorada"
                                value={metrics.highestCategory ? categoryInfo[metrics.highestCategory[0]]?.name : 'N/A'}
                                subtitle={metrics.highestCategory ? `${metrics.highestCategory[1]} puntos` : ''}
                                icon="trophy"
                                color="success"
                            />
                            <KPICard
                                title="Área de Oportunidad"
                                value={metrics.lowestCategory ? categoryInfo[metrics.lowestCategory[0]]?.name : 'N/A'}
                                subtitle={metrics.lowestCategory ? `${metrics.lowestCategory[1]} puntos` : ''}
                                icon="alert"
                                color="warning"
                            />
                        </div>

                        {/* Charts */}
                        <div className="charts-grid">
                            <div className="chart-card">
                                <div className="card-header">
                                    <h3>Promedio por Categoría</h3>
                                    <div className="export-dropdown-container">
                                        <button
                                            onClick={() => setShowExportMenu(!showExportMenu)}
                                            className="btn btn-outline btn-sm export-dropdown-btn"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            Exportar
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14, marginLeft: 4 }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </button>
                                        {showExportMenu && (
                                            <div className="export-dropdown-menu">
                                                <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="export-option">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    CSV - Datos Básicos
                                                </button>
                                                <button onClick={() => { exportToExcel(); setShowExportMenu(false); }} className="export-option">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                                                    </svg>
                                                    Excel - Formato Avanzado
                                                </button>
                                                <button onClick={() => { exportToPDF(); setShowExportMenu(false); }} className="export-option">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    PDF - Reporte Profesional
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="card-body">
                                    <CategoryChart data={metrics.categoryAverages} />
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
