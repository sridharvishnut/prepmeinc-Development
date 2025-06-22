// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBHhs3dpYBjBzg2uzHST33RsZkdT6PVd2g",
  authDomain: "prepmeinc.firebaseapp.com",
  projectId: "prepmeinc",
  storageBucket: "prepmeinc.firebasestorage.app",
  messagingSenderId: "754952038912",
  appId: "1:754952038912:web:c253d7d5807462704906e5",
  measurementId: "G-410BRJBQY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized app instance
export default app;