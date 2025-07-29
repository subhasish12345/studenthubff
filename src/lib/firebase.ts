// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studenthub-icqzd",
  "appId": "1:827186646715:web:ccd8a8ba5dc568c370639e",
  "storageBucket": "studenthub-icqzd.firebasestorage.app",
  "apiKey": "AIzaSyDXUUNnV-yBe7XJvTKaEWC0fU_up_ixsvE",
  "authDomain": "studenthub-icqzd.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "827186646715"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
