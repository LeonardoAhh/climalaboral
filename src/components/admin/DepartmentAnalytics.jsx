import { useMemo, useState } from 'react';
import { categoryInfo } from '../../data/surveyQuestions';
import '../../styles/components/DepartmentAnalytics.css';

const DepartmentAnalytics = ({ employees, responses }) => {
    const [expandedDept, setExpandedDept] = useState(null);
    const analytics = useMemo(() => {
        // Group by department
        const departmentStats = {};
        const areaStats = {};

        // Initialize stats
        employees.forEach(emp => {
            const dept = emp.department || 'SIN DEPARTAMENTO';
            const area = emp.area || 'SIN ÁREA';

            if (!departmentStats[dept]) {
                departmentStats[dept] = {
                    total: 0,
                    completed: 0,
                    responses: [],
                    areas: new Set()
                };
            }

            if (!areaStats[area]) {
                areaStats[area] = {
                    department: dept,
                    total: 0,
                    completed: 0,
                    responses: []
                };
            }

            departmentStats[dept].total++;
            departmentStats[dept].areas.add(area);
            areaStats[area].total++;

            if (emp.surveyCompleted) {
                departmentStats[dept].completed++;
                areaStats[area].completed++;
            }
        });

        // Add responses to stats
        responses.forEach(response => {
            const employee = employees.find(e => e.employeeId === response.employeeId);
            if (employee) {
                const dept = employee.department || 'SIN DEPARTAMENTO';
                const area = employee.area || 'SIN ÁREA';

                if (departmentStats[dept]) {
                    departmentStats[dept].responses.push(response);
                }

                if (areaStats[area]) {
                    areaStats[area].responses.push(response);
                }
            }
        });

        // Calculate metrics for each department
        const departmentMetrics = Object.entries(departmentStats).map(([name, stats]) => {
            const participationRate = stats.total > 0
                ? ((stats.completed / stats.total) * 100).toFixed(1)
                : 0;

            // Calculate category averages
            const categoryAverages = {};
            Object.keys(categoryInfo).forEach(category => {
                const scores = stats.responses.map(r => r.categoryScores?.[category] || 0);
                const average = scores.length > 0
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : 0;
                categoryAverages[category] = parseFloat(average.toFixed(2));
            });

            const sortedCategories = Object.entries(categoryAverages)
                .sort(([, a], [, b]) => b - a);

            return {
                name,
                total: stats.total,
                completed: stats.completed,
                participationRate,
                categoryAverages,
                bestCategory: sortedCategories[0],
                worstCategory: sortedCategories[sortedCategories.length - 1],
                areasCount: stats.areas.size
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

        // Calculate metrics for each area
        const areaMetrics = Object.entries(areaStats).map(([name, stats]) => {
            const participationRate = stats.total > 0
                ? ((stats.completed / stats.total) * 100).toFixed(1)
                : 0;

            // Calculate category averages
            const categoryAverages = {};
            Object.keys(categoryInfo).forEach(category => {
                const scores = stats.responses.map(r => r.categoryScores?.[category] || 0);
                const average = scores.length > 0
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : 0;
                categoryAverages[category] = parseFloat(average.toFixed(2));
            });

            const sortedCategories = Object.entries(categoryAverages)
                .sort(([, a], [, b]) => b - a);

            return {
                name,
                department: stats.department,
                total: stats.total,
                completed: stats.completed,
                participationRate,
                categoryAverages,
                bestCategory: sortedCategories[0],
                worstCategory: sortedCategories[sortedCategories.length - 1]
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

        return { departmentMetrics, areaMetrics };
    }, [employees, responses]);

    return (
        <div className="department-analytics">
            {/* Department Analytics */}
            <div className="analytics-section">
                <h3 className="section-title">Análisis por Departamento</h3>
                <p className="section-subtitle">Haz click en un departamento para ver sus métricas</p>
                <div className="analytics-grid">
                    {analytics.departmentMetrics.map(dept => (
                        <div
                            key={dept.name}
                            className={`analytics-card ${expandedDept === dept.name ? 'expanded' : ''}`}
                            onClick={() => setExpandedDept(expandedDept === dept.name ? null : dept.name)}
                        >
                            <div className="card-header-dept">
                                <div>
                                    <h4>{dept.name}</h4>
                                    <span className="areas-count">{dept.areasCount} área{dept.areasCount !== 1 ? 's' : ''}</span>
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className={`expand-icon ${expandedDept === dept.name ? 'rotated' : ''}`}
                                    style={{ width: 24, height: 24 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>

                            {expandedDept === dept.name && (
                                <div className="metrics-row">
                                    <div className="metric">
                                        <span className="metric-label">Participación</span>
                                        <span className="metric-value">{dept.participationRate}%</span>
                                        <span className="metric-detail">{dept.completed}/{dept.total}</span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">Mejor Categoría</span>
                                        <span className="metric-value category-name">
                                            {dept.bestCategory ? categoryInfo[dept.bestCategory[0]]?.name : 'N/A'}
                                        </span>
                                        <span className="metric-detail score-high">
                                            {dept.bestCategory ? dept.bestCategory[1].toFixed(2) : '-'}
                                        </span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">Oportunidad</span>
                                        <span className="metric-value category-name">
                                            {dept.worstCategory ? categoryInfo[dept.worstCategory[0]]?.name : 'N/A'}
                                        </span>
                                        <span className="metric-detail score-low">
                                            {dept.worstCategory ? dept.worstCategory[1].toFixed(2) : '-'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Area Analytics */}
            <div className="analytics-section">
                <h3 className="section-title">Análisis por Área</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Departamento</th>
                                <th>Participación</th>
                                <th>Mejor Categoría</th>
                                <th>Área de Oportunidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.areaMetrics.map(area => (
                                <tr key={area.name}>
                                    <td className="area-name">{area.name}</td>
                                    <td className="dept-name">{area.department}</td>
                                    <td>
                                        <div className="participation-cell">
                                            <span className="participation-rate">{area.participationRate}%</span>
                                            <span className="participation-count">({area.completed}/{area.total})</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="category-cell">
                                            <span className="category-label">
                                                {area.bestCategory ? categoryInfo[area.bestCategory[0]]?.name : 'N/A'}
                                            </span>
                                            <span className="score-badge score-high">
                                                {area.bestCategory ? area.bestCategory[1].toFixed(2) : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="category-cell">
                                            <span className="category-label">
                                                {area.worstCategory ? categoryInfo[area.worstCategory[0]]?.name : 'N/A'}
                                            </span>
                                            <span className="score-badge score-low">
                                                {area.worstCategory ? area.worstCategory[1].toFixed(2) : '-'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepartmentAnalytics;
