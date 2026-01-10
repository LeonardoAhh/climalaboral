import { useState } from 'react';
import { motion } from 'framer-motion';
import { categoryInfo } from '../../data/surveyQuestions';
import '../../styles/components/QuestionEditor.css';

const QuestionEditor = ({ questions, onSave }) => {
    const [editedQuestions, setEditedQuestions] = useState([...questions]);
    const [hasChanges, setHasChanges] = useState(false);

    const handleQuestionChange = (index, field, value) => {
        const updated = [...editedQuestions];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
        setEditedQuestions(updated);
        setHasChanges(true);
    };

    const handleAddQuestion = (category) => {
        const newId = `q${Date.now()}`; // ID único basado en timestamp
        const newQuestion = {
            id: newId,
            category: category,
            categoryName: categoryInfo[category].name,
            question: 'Nueva pregunta - Editar texto aquí'
        };
        setEditedQuestions([...editedQuestions, newQuestion]);
        setHasChanges(true);
    };

    const handleDeleteQuestion = (questionId) => {
        if (window.confirm('¿Seguro que deseas eliminar esta pregunta? Esta acción no se puede deshacer.')) {
            const filtered = editedQuestions.filter(q => q.id !== questionId);
            setEditedQuestions(filtered);
            setHasChanges(true);
        }
    };

    const handleSave = () => {
        if (window.confirm('¿Estás seguro de guardar los cambios? Esto afectará a todas las nuevas encuestas.')) {
            onSave(editedQuestions);
            setHasChanges(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('¿Estás seguro de descartar los cambios?')) {
            setEditedQuestions([...questions]);
            setHasChanges(false);
        }
    };

    // Group questions by category
    const questionsByCategory = {};
    editedQuestions.forEach(q => {
        if (!questionsByCategory[q.category]) {
            questionsByCategory[q.category] = [];
        }
        questionsByCategory[q.category].push(q);
    });

    return (
        <div className="question-editor-container">
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Editor de Preguntas</h3>
                        <p className="card-subtitle">
                            Edita las preguntas de la encuesta. Los cambios se aplicarán a nuevas encuestas.
                        </p>
                    </div>
                    <div className="editor-actions">
                        {hasChanges && (
                            <>
                                <button onClick={handleReset} className="btn btn-outline btn-sm">
                                    Descartar
                                </button>
                                <button onClick={handleSave} className="btn btn-primary btn-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Guardar Cambios
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="card-body">
                    {hasChanges && (
                        <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            Tienes cambios sin guardar
                        </div>
                    )}

                    <div className="categories-list">
                        {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
                            <motion.div
                                key={category}
                                className="category-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="category-header">
                                    <div
                                        className="category-badge"
                                        style={{ backgroundColor: categoryInfo[category]?.color }}
                                    >
                                        {categoryQuestions.length}
                                    </div>
                                    <div>
                                        <h4>{categoryInfo[category]?.name}</h4>
                                        <p>{categoryInfo[category]?.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddQuestion(category)}
                                        className="btn btn-outline btn-sm"
                                        title="Agregar nueva pregunta a esta categoría"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Agregar Pregunta
                                    </button>
                                </div>

                                <div className="questions-list">
                                    {categoryQuestions.map((question, catIndex) => {
                                        const globalIndex = editedQuestions.findIndex(q => q.id === question.id);
                                        return (
                                            <div key={question.id} className="question-edit-card">
                                                <div className="question-header">
                                                    <div>
                                                        <span className="question-number">
                                                            Pregunta {globalIndex + 1}
                                                        </span>
                                                        <span className="question-id">{question.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(question.id)}
                                                        className="btn-icon btn-danger-outline"
                                                        title="Eliminar pregunta"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Texto de la pregunta</label>
                                                    <textarea
                                                        className="form-input"
                                                        rows="3"
                                                        value={question.question}
                                                        onChange={(e) => handleQuestionChange(globalIndex, 'question', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionEditor;
