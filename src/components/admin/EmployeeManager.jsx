import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/components/EmployeeManager.css';

const EmployeeManager = ({ employees, onAdd, onEdit, onDelete, failedImports = [], onResolveFailed, onDismissFailed }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        employeeId: '',
        name: '',
        curp: '',
        department: '',
        area: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const ITEMS_PER_PAGE = 10;

    // Get unique departments and areas
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))].sort();
    const areas = [...new Set(employees.map(emp => emp.area).filter(Boolean))].sort();

    // CURP validation regex (formato mexicano)
    const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;

    // Validate form
    const validateForm = () => {
        const errors = {};

        // ID validation
        if (!formData.employeeId.trim()) {
            errors.employeeId = 'El ID es requerido';
        } else if (!/^\d+$/.test(formData.employeeId.trim())) {
            errors.employeeId = 'El ID debe contener solo números';
        } else if (!editingEmployee) {
            // Check if ID already exists (only for new employees)
            const existingEmployee = employees.find(
                emp => emp.employeeId === formData.employeeId.trim()
            );
            if (existingEmployee) {
                errors.employeeId = 'Este ID ya está registrado';
            }
        }

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 5) {
            errors.name = 'El nombre debe tener al menos 5 caracteres';
        } else if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(formData.name.trim())) {
            errors.name = 'El nombre solo debe contener letras';
        }

        // CURP validation
        if (!formData.curp.trim()) {
            errors.curp = 'El CURP es requerido';
        } else if (formData.curp.trim().length !== 18) {
            errors.curp = 'El CURP debe tener exactamente 18 caracteres';
        } else if (!CURP_REGEX.test(formData.curp.trim())) {
            errors.curp = 'El formato del CURP no es válido';
        } else if (!editingEmployee) {
            // Check if CURP already exists
            const existingCurp = employees.find(
                emp => emp.curp.toUpperCase() === formData.curp.trim().toUpperCase()
            );
            if (existingCurp) {
                errors.curp = 'Este CURP ya está registrado';
            }
        }

        // Department validation
        if (!formData.department.trim()) {
            errors.department = 'El departamento es requerido';
        }

        // Area validation
        if (!formData.area.trim()) {
            errors.area = 'El área es requerida';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.includes(searchTerm) ||
            emp.curp.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
        return matchesSearch && matchesDepartment;
    }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleDepartmentChange = (value) => {
        setFilterDepartment(value);
        setCurrentPage(1);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                employeeId: employee.employeeId,
                name: employee.name,
                curp: employee.curp,
                department: employee.department,
                area: employee.area
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                employeeId: '',
                name: '',
                curp: '',
                department: '',
                area: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setFormErrors({});
        setFormData({
            employeeId: '',
            name: '',
            curp: '',
            department: '',
            area: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (editingEmployee) {
            onEdit(editingEmployee.id, formData);
        } else {
            onAdd(formData);
        }

        handleCloseModal();
    };

    const handleDelete = (employee) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${employee.name}?`)) {
            onDelete(employee.id);
        }
    };

    return (
        <div className="employee-manager">
            <div className="manager-header">
                <h3>Gestión de Empleados</h3>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Agregar Empleado
                </button>
            </div>

            <div className="manager-filters">
                <div className="search-box">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ID o CURP..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="search-input"
                    />
                </div>

                <select
                    value={filterDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos los departamentos</option>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>

            <div className="employees-table-container">
                <table className="employees-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>CURP</th>
                            <th>Departamento</th>
                            <th>Área</th>
                            <th>Encuesta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map(employee => (
                            <tr key={employee.id}>
                                <td>{employee.employeeId}</td>
                                <td>{employee.name}</td>
                                <td><code>{employee.curp}</code></td>
                                <td>{employee.department}</td>
                                <td>{employee.area}</td>
                                <td>
                                    {employee.surveyCompleted ? (
                                        <span className="badge badge-success">✓ Completada</span>
                                    ) : employee.hasProgress ? (
                                        <span className="badge badge-warning">⏳ En progreso</span>
                                    ) : (
                                        <span className="badge badge-pending">Pendiente</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon btn-icon-primary"
                                            onClick={() => handleOpenModal(employee)}
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-danger"
                                            onClick={() => handleDelete(employee)}
                                            title="Eliminar"
                                            disabled={employee.surveyCompleted}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredEmployees.length === 0 && (
                    <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <p>No se encontraron empleados</p>
                    </div>
                )}
            </div>

            <div className="manager-footer">
                <p>Total: {filteredEmployees.length} de {employees.length} empleados</p>
            </div>

            {filteredEmployees.length > 0 && (
                <div className="pagination-controls">
                    <div className="pagination-info">
                        <p>
                            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} de {filteredEmployees.length} empleados
                            {filteredEmployees.length < employees.length && ` (${employees.length} totales)`}
                        </p>
                    </div>
                    <div className="pagination-buttons">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="btn btn-outline btn-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            Anterior
                        </button>
                        <span className="page-indicator">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="btn btn-outline btn-sm"
                        >
                            Siguiente
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Failed Imports Section */}
            {failedImports && failedImports.length > 0 && (
                <div className="failed-imports-section">
                    <div className="failed-imports-header">
                        <div className="failed-imports-alert">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <h4>Empleados con Errores de Importación</h4>
                                <p>{failedImports.length} empleado(s) no se pudieron cargar correctamente</p>
                            </div>
                        </div>
                    </div>

                    <div className="failed-imports-table-container">
                        <table className="employees-table failed-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>CURP</th>
                                    <th>Error</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failedImports.map(failed => (
                                    <tr key={failed.id} className="failed-row">
                                        <td>{failed.employeeId || 'Sin ID'}</td>
                                        <td>{failed.name || 'Sin nombre'}</td>
                                        <td><code>{failed.curp || 'Sin CURP'}</code></td>
                                        <td className="error-cell">
                                            <span className="error-badge">{failed.error}</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-icon-success"
                                                    onClick={() => {
                                                        // Pre-fill form with failed data
                                                        setFormData({
                                                            employeeId: failed.employeeId || '',
                                                            name: failed.name || '',
                                                            curp: failed.curp || '',
                                                            department: failed.department || '',
                                                            area: failed.area || ''
                                                        });
                                                        setShowModal(true);
                                                        if (onResolveFailed) onResolveFailed(failed.id);
                                                    }}
                                                    title="Usar estos datos"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn-icon btn-icon-danger"
                                                    onClick={() => onDismissFailed && onDismissFailed(failed.id)}
                                                    title="Descartar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>{editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}</h3>
                                <button className="modal-close" onClick={handleCloseModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className={`form-group ${formErrors.employeeId ? 'has-error' : ''}`}>
                                    <label className="form-label">ID de Empleado *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        placeholder="Ej: 3204"
                                        disabled={!!editingEmployee}
                                    />
                                    {formErrors.employeeId && <span className="error-text">{formErrors.employeeId}</span>}
                                </div>

                                <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
                                    <label className="form-label">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                        placeholder="NOMBRE APELLIDO APELLIDO"
                                    />
                                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                                </div>

                                <div className={`form-group ${formErrors.curp ? 'has-error' : ''}`}>
                                    <label className="form-label">CURP *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.curp}
                                        onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                                        placeholder="AAAA000000HAAAAA00"
                                        maxLength="18"
                                    />
                                    <small>{formData.curp.length}/18 caracteres</small>
                                    {formErrors.curp && <span className="error-text">{formErrors.curp}</span>}
                                </div>

                                <div className={`form-group ${formErrors.department ? 'has-error' : ''}`}>
                                    <label className="form-label">Departamento *</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Seleccionar departamento...</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                        <option value="__new__">+ Agregar nuevo departamento</option>
                                    </select>
                                    {formData.department === '__new__' && (
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ marginTop: '0.5rem' }}
                                            placeholder="Escribir nuevo departamento..."
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value.toUpperCase() })}
                                            autoFocus
                                        />
                                    )}
                                    {formErrors.department && <span className="error-text">{formErrors.department}</span>}
                                </div>

                                <div className={`form-group ${formErrors.area ? 'has-error' : ''}`}>
                                    <label className="form-label">Área *</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    >
                                        <option value="">Seleccionar área...</option>
                                        {areas.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                        <option value="__new__">+ Agregar nueva área</option>
                                    </select>
                                    {formData.area === '__new__' && (
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ marginTop: '0.5rem' }}
                                            placeholder="Escribir nueva área..."
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value.toUpperCase() })}
                                            autoFocus
                                        />
                                    )}
                                    {formErrors.area && <span className="error-text">{formErrors.area}</span>}
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeManager;
