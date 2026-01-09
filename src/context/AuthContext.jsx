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
                // Check if user is admin
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (adminDoc.exists()) {
                    setUserType('admin');
                    setCurrentUser({ ...user, isAdmin: true });
                } else {
                    // Check if user is employee
                    const employeeDoc = await getDoc(doc(db, 'employees', user.uid));
                    if (employeeDoc.exists()) {
                        setUserType('employee');
                        setCurrentUser({
                            ...user,
                            isAdmin: false,
                            employeeData: employeeDoc.data()
                        });
                    }
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
            // Check if employee exists in Firestore
            const employeesRef = collection(db, 'employees');
            const q = query(employeesRef, where('employeeId', '==', employeeId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Create new employee
                const email = `employee${employeeId}@climalaboral.local`;
                const userCredential = await createUserWithEmailAndPassword(auth, email, curp);

                // Store employee data
                await setDoc(doc(db, 'employees', userCredential.user.uid), {
                    employeeId,
                    name,
                    curp, // In production, hash this!
                    surveyCompleted: false,
                    completedAt: null,
                    createdAt: new Date()
                });

                setUserType('employee');
                return { success: true, user: userCredential.user };
            } else {
                // Employee exists, try to login
                const employeeDoc = querySnapshot.docs[0];
                const employeeData = employeeDoc.data();

                // Verify CURP matches
                if (employeeData.curp !== curp) {
                    throw new Error('CURP incorrecta');
                }

                const email = `employee${employeeId}@climalaboral.local`;
                const userCredential = await signInWithEmailAndPassword(auth, email, curp);

                setUserType('employee');
                return {
                    success: true,
                    user: userCredential.user,
                    surveyCompleted: employeeData.surveyCompleted
                };
            }
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
    const checkSurveyStatus = async (userId) => {
        try {
            const employeeDoc = await getDoc(doc(db, 'employees', userId));
            if (employeeDoc.exists()) {
                return employeeDoc.data().surveyCompleted || false;
            }
            return false;
        } catch (error) {
            console.error('Error checking survey status:', error);
            return false;
        }
    };

    const value = {
        currentUser,
        userType,
        loading,
        loginEmployee,
        loginAdmin,
        signOut,
        checkSurveyStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
