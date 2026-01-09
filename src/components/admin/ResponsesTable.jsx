import { useState } from 'react';
import { motion } from 'framer-motion';
import { categoryInfo } from '../../data/surveyQuestions';
import '../../styles/components/ResponsesTable.css';

const ResponsesTable = ({ responses }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name'); // date, score, name - default to name for alphabetical
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc - ascending for alphabetical

    const filteredResponses = responses.filter(response =>
        response.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedResponses = [...filteredResponses].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'date':
                comparison = (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0);
                break;
            case 'score':
                comparison = a.overallScore - b.overallScore;
                break;
            case 'name':
                comparison = a.employeeName.localeCompare(b.employeeName);
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 4) return 'score-high';
        if (score >= 3) return 'score-medium';
        return 'score-low';
    };

    return (
        <div className="responses-table-container">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Respuestas Individuales</h3>
                    <div className="table-controls">
                        <div className="search-box">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {sortedResponses.length === 0 ? (
                        <div className="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                            <p>No se encontraron respuestas</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('name')} className="sortable">
                                            Empleado
                                            {sortBy === 'name' && (
                                                <span className="sort-indicator">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th>ID</th>
                                        <th onClick={() => handleSort('date')} className="sortable">
                                            Fecha
                                            {sortBy === 'date' && (
                                                <span className="sort-indicator">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th onClick={() => handleSort('score')} className="sortable">
                                            Promedio
                                            {sortBy === 'score' && (
                                                <span className="sort-indicator">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </th>
                                        <th>Categorías</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedResponses.map((response, index) => (
                                        <motion.tr
                                            key={response.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td data-label="Empleado">
                                                <strong>{response.employeeName}</strong>
                                            </td>
                                            <td data-label="ID">
                                                <span className="badge badge-primary">{response.employeeId}</span>
                                            </td>
                                            <td data-label="Fecha">
                                                {new Date(response.submittedAt.seconds * 1000).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td data-label="Promedio">
                                                <span className={`score-badge ${getScoreColor(response.overallScore)}`}>
                                                    {response.overallScore.toFixed(2)}
                                                </span>
                                            </td>
                                            <td data-label="Categorías">
                                                <div className="category-scores">
                                                    {Object.entries(response.categoryScores || {}).map(([cat, score]) => (
                                                        <div key={cat} className="category-score-item">
                                                            <span
                                                                className="category-dot"
                                                                style={{ backgroundColor: categoryInfo[cat]?.color }}
                                                            ></span>
                                                            <span className="category-name">{categoryInfo[cat]?.name}:</span>
                                                            <span className="category-value">{score.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="card-footer">
                    <p className="table-summary">
                        Mostrando {sortedResponses.length} de {responses.length} respuestas
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResponsesTable;
