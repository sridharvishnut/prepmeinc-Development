import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyBHhs3dpYBjBzg2uzHST33RsZkdT6PVd2g",
  authDomain: "prepmeinc.firebaseapp.com",
  projectId: "prepmeinc",
  storageBucket: "prepmeinc.firebasestorage.app",
  messagingSenderId: "754952038912",
  appId: "1:754952038912:web:c253d7d5807462704906e5",
  measurementId: "G-410BRJBQY7"
};

const app = initializeApp(firebaseConfig);

export default app;