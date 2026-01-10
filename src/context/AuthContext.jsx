import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userType, setUserType] = useState(null); // 'employee' or 'admin'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Only check if user is admin (employees don't use Firebase Auth)
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (adminDoc.exists()) {
                    setUserType('admin');
                    setCurrentUser({ ...user, isAdmin: true });
                } else {
                    // Not an admin, sign out
                    await firebaseSignOut(auth);
                    setCurrentUser(null);
                    setUserType(null);
                }
            } else {
                setCurrentUser(null);
                setUserType(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Employee login with ID, Name, and CURP
    const loginEmployee = async (employeeId, name, curp) => {
        try {
            // Look for employee by document ID
            const employeeDocRef = doc(db, 'employees', `emp_${employeeId}`);
            const employeeSnap = await getDoc(employeeDocRef);

            if (!employeeSnap.exists()) {
                throw new Error('Empleado no encontrado. Verifica tu ID.');
            }

            const employeeData = employeeSnap.data();

            // Verify CURP matches
            if (employeeData.curp.toUpperCase() !== curp.toUpperCase()) {
                throw new Error('CURP incorrecta');
            }

            // Verify name matches (case insensitive, allowing partial match)
            const normalizedInputName = name.trim().toUpperCase();
            const normalizedEmployeeName = employeeData.name.toUpperCase();

            if (!normalizedEmployeeName.includes(normalizedInputName) &&
                !normalizedInputName.includes(normalizedEmployeeName)) {
                throw new Error('El nombre no coincide con el registrado');
            }

            // Check if survey is already completed
            if (employeeData.surveyCompleted) {
                return {
                    success: true,
                    surveyCompleted: true,
                    employeeData: employeeData
                };
            }

            // Create session for employee (no Firebase Auth needed for employees)
            setUserType('employee');
            setCurrentUser({
                uid: employeeSnap.id,
                isAdmin: false,
                employeeData: employeeData
            });

            return {
                success: true,
                surveyCompleted: false,
                employeeData: employeeData
            };
        } catch (error) {
            console.error('Error logging in employee:', error);
            throw error;
        }
    };

    // Admin login with email and password
    const loginAdmin = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Verify user is admin
            const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
            if (!adminDoc.exists()) {
                await firebaseSignOut(auth);
                throw new Error('No tienes permisos de administrador');
            }

            setUserType('admin');
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error logging in admin:', error);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setCurrentUser(null);
            setUserType(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Check if employee has completed survey
    const checkSurveyStatus = async (employeeDocId) => {
        try {
            const employeeDoc = await getDoc(doc(db, 'employees', employeeDocId));
            if (employeeDoc.exists()) {
                return employeeDoc.data().surveyCompleted || false;
            }
            return false;
        } catch (error) {
            console.error('Error checking survey status:', error);
            return false;
        }
    };

    // Verify employee ID only (for step 1 of login)
    // Security: Only returns first name to prevent full data exposure
    const verifyEmployeeId = async (employeeId) => {
        try {
            // Sanitize input
            const sanitizedId = employeeId.trim().replace(/[^0-9]/g, '');

            if (!sanitizedId || sanitizedId.length < 1) {
                throw new Error('ID de empleado inválido.');
            }

            const employeeDocRef = doc(db, 'employees', `emp_${sanitizedId}`);
            const employeeSnap = await getDoc(employeeDocRef);

            if (!employeeSnap.exists()) {
                // Generic error to prevent ID enumeration
                throw new Error('No se pudo verificar el empleado. Verifica tu número.');
            }

            const employeeData = employeeSnap.data();

            // Only return first name for privacy
            const firstName = employeeData.name.split(' ')[0];

            return {
                success: true,
                name: firstName, // Only first name shown in UI
                fullName: employeeData.name // Full name stored internally for validation
            };
        } catch (error) {
            console.error('Error verifying employee ID:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userType,
        loading,
        loginEmployee,
        loginAdmin,
        signOut,
        checkSurveyStatus,
        verifyEmployeeId
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
