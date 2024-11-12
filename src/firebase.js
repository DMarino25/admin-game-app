// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBz51zP2GyGXNCPhJNq7TyVYOnjRItRXfg",
  authDomain: "gameapp-c4851.firebaseapp.com",
  databaseURL: "https://gameapp-c4851-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gameapp-c4851",
  storageBucket: "gameapp-c4851.firebasestorage.app",
  messagingSenderId: "26786737807",
  appId: "1:26786737807:web:50927f98d50ce8ad7a8afa",
  measurementId: "G-YSQZLLDFDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };