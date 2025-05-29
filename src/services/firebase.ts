import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCodzZgY3j8SMeXo3YhPUK3p_1aRYo_Ub0",
  authDomain: "english-course-7588e.firebaseapp.com",
  projectId: "english-course-7588e",
  storageBucket: "english-course-7588e.firebasestorage.app",
  messagingSenderId: "1045396951345",
  appId: "1:1045396951345:web:2e04a7ab7346f52056a010",
  measurementId: "G-9303SYTDLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators if in development mode
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions };