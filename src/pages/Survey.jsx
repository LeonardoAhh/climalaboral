import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { defaultSurveyQuestions, scaleLabels, categoryInfo } from '../data/surveyQuestions';
import '../styles/pages/Survey.css';

const Survey = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentCategory, setCurrentCategory] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    // Get unique categories
    const categories = [...new Set(questions.map(q => q.category))];
    const currentCategoryQuestions = questions.filter(
        q => q.category === categories[currentCategory]
    );

    useEffect(() => {
        loadQuestions();
        checkSurveyStatus();
        loadProgress();
    }, []);

    // Auto-save progress
    useEffect(() => {
        if (Object.keys(answers).length > 0 && currentUser?.uid) {
            saveProgress();
        }
    }, [answers, currentCategory]);

    const loadQuestions = async () => {
        try {
            // Try to load questions from Firestore (admin can edit them)
            const questionsSnapshot = await getDocs(collection(db, 'surveyQuestions'));

            if (!questionsSnapshot.empty) {
                const loadedQuestions = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setQuestions(loadedQuestions.sort((a, b) => a.id.localeCompare(b.id)));
            } else {
                // Use default questions
                setQuestions(defaultSurveyQuestions);
            }
        } catch (err) {
            console.error('Error loading questions:', err);
            setQuestions(defaultSurveyQuestions);
        } finally {
            setLoading(false);
        }
    };

    const checkSurveyStatus = async () => {
        try {
            const employeeDoc = await getDoc(doc(db, 'employees', currentUser.uid));
            if (employeeDoc.exists() && employeeDoc.data().surveyCompleted) {
                navigate('/employee/complete');
            }
        } catch (err) {
            console.error('Error checking survey status:', err);
        }
    };

    const loadProgress = async () => {
        try {
            const progressDoc = await getDoc(doc(db, 'surveyProgress', currentUser.uid));
            if (progressDoc.exists()) {
                const data = progressDoc.data();
                setAnswers(data.answers || {});
                setCurrentCategory(data.currentCategory || 0);
            }
        } catch (err) {
            console.error('Error loading progress:', err);
        }
    };

    const saveProgress = async () => {
        try {
            await setDoc(doc(db, 'surveyProgress', currentUser.uid), {
                answers,
                currentCategory,
                lastUpdated: new Date()
            });
        } catch (err) {
            console.error('Error saving progress:', err);
        }
    };

    const handleAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
        setError('');
    };

    const getCurrentCategoryProgress = () => {
        const answered = currentCategoryQuestions.filter(q => answers[q.id]).length;
        return (answered / currentCategoryQuestions.length) * 100;
    };

    const getTotalProgress = () => {
        const answered = Object.keys(answers).length;
        return (answered / questions.length) * 100;
    };

    const canGoNext = () => {
        return currentCategoryQuestions.every(q => answers[q.id]);
    };

    const handleNext = () => {
        if (!canGoNext()) {
            setError('Por favor responde todas las preguntas de esta sección');
            return;
        }

        if (currentCategory < categories.length - 1) {
            setCurrentCategory(currentCategory + 1);
            setError('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (currentCategory > 0) {
            setCurrentCategory(currentCategory - 1);
            setError('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const calculateCategoryScores = () => {
        const scores = {};

        categories.forEach(category => {
            const categoryQuestions = questions.filter(q => q.category === category);
            const categoryAnswers = categoryQuestions.map(q => answers[q.id] || 0);
            const average = categoryAnswers.reduce((a, b) => a + b, 0) / categoryAnswers.length;
            scores[category] = parseFloat(average.toFixed(2));
        });

        return scores;
    };

    const handleSubmit = async () => {
        if (!canGoNext()) {
            setError('Por favor responde todas las preguntas de esta sección');
            return;
        }

        // Check if all questions are answered
        if (Object.keys(answers).length !== questions.length) {
            setError('Por favor responde todas las preguntas antes de enviar');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const categoryScores = calculateCategoryScores();
            const overallScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.values(categoryScores).length;

            // Get employee data
            const employeeDoc = await getDoc(doc(db, 'employees', currentUser.uid));
            const employeeData = employeeDoc.data();

            // Save response
            await setDoc(doc(db, 'responses', currentUser.uid), {
                employeeId: employeeData.employeeId,
                employeeName: employeeData.name,
                answers,
                categoryScores,
                overallScore: parseFloat(overallScore.toFixed(2)),
                submittedAt: new Date()
            });

            // Mark survey as completed
            await setDoc(doc(db, 'employees', currentUser.uid), {
                ...employeeData,
                surveyCompleted: true,
                completedAt: new Date()
            });

            navigate('/employee/complete');
        } catch (err) {
            console.error('Error submitting survey:', err);
            setError('Error al enviar la encuesta. Por favor intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="survey-loading">
                <div className="spinner spinner-lg"></div>
                <p>Cargando encuesta...</p>
            </div>
        );
    }

    const categoryData = categoryInfo[categories[currentCategory]];

    return (
        <div className="survey-container">
            <div className="survey-header">
                <div className="container">
                    <div className="survey-header-content">
                        <div className="header-left-survey">
                            <img src="/logo-vinoplastic.png" alt="Vino Plastic" className="survey-logo" />
                            <div>
                                <h1>Encuesta de Clima Laboral</h1>
                                <p className="survey-subtitle">
                                    Sección {currentCategory + 1} de {categories.length}: {categoryData?.name}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn-logout" title="Salir">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>

                    <div className="progress-section">
                        <div className="progress-info">
                            <span>Progreso total</span>
                            <span className="progress-percentage">{Math.round(getTotalProgress())}%</span>
                        </div>
                        <div className="progress">
                            <motion.div
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${getTotalProgress()}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="survey-content container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="category-section"
                    >
                        <div className="category-header">
                            <div
                                className="category-badge"
                                style={{ backgroundColor: categoryData?.color }}
                            >
                                {currentCategory + 1}
                            </div>
                            <div>
                                <h2>{categoryData?.name}</h2>
                                <p className="category-description">{categoryData?.description}</p>
                            </div>
                        </div>

                        <div className="category-progress">
                            <div className="progress-info">
                                <span>Progreso de esta sección</span>
                                <span className="progress-percentage">
                                    {currentCategoryQuestions.filter(q => answers[q.id]).length} de {currentCategoryQuestions.length}
                                </span>
                            </div>
                            <div className="progress">
                                <motion.div
                                    className="progress-bar"
                                    style={{ backgroundColor: categoryData?.color }}
                                    animate={{ width: `${getCurrentCategoryProgress()}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                className="alert alert-warning"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="questions-list">
                            {currentCategoryQuestions.map((question, index) => (
                                <motion.div
                                    key={question.id}
                                    className="question-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="question-header">
                                        <span className="question-number">
                                            Pregunta {questions.indexOf(question) + 1}
                                        </span>
                                        {answers[question.id] && (
                                            <span className="badge badge-success">Respondida</span>
                                        )}
                                    </div>

                                    <p className="question-text">{question.question}</p>

                                    <div className="radio-group">
                                        {[1, 2, 3, 4, 5].map(value => (
                                            <div key={value} className="radio-option">
                                                <input
                                                    type="radio"
                                                    id={`${question.id}-${value}`}
                                                    name={question.id}
                                                    value={value}
                                                    checked={answers[question.id] === value}
                                                    onChange={() => handleAnswer(question.id, value)}
                                                />
                                                <label
                                                    htmlFor={`${question.id}-${value}`}
                                                    className="radio-label"
                                                >
                                                    <span className="radio-value">{value}</span>
                                                    <span className="radio-text">{scaleLabels[value]}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="survey-navigation">
                            <button
                                onClick={handlePrevious}
                                className="btn btn-outline"
                                disabled={currentCategory === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                                Anterior
                            </button>

                            {currentCategory < categories.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-primary"
                                    disabled={!canGoNext()}
                                >
                                    Siguiente
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-secondary"
                                    disabled={!canGoNext() || submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner spinner-sm"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Enviar Encuesta
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Survey;
