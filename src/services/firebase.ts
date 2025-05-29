import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCodzZgY3j8SMeXo3YhPUK3p_1aRYo_Ub0",
  authDomain: "english-course-7588e.firebaseapp.com",
  projectId: "english-course-7588e",
  storageBucket: "english-course-7588e.appspot.com",
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

export { app, auth, db, storage, functions };