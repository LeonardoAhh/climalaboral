import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCM1r2Rg4ObfReMgOHKLePuJVfD-xPa2Eg",
    authDomain: "climalaboral-81365.firebaseapp.com",
    projectId: "climalaboral-81365",
    storageBucket: "climalaboral-81365.firebasestorage.app",
    messagingSenderId: "666665814040",
    appId: "1:666665814040:web:d75899c619289516c6db6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
