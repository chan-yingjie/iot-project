// lib/firebase.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCIHkTK_SSNpPbjU3FLSGu8fDg7gR38q-s",
  authDomain: "smart-medi-v0.firebaseapp.com",
  projectId: "smart-medi-v0",
  storageBucket: "smart-medi-v0.appspot.com", // 
  messagingSenderId: "408519227808",
  appId: "1:408519227808:web:a97b1d379ff8b1821a4cc5",
  measurementId: "G-FGDH82W8K4"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log("✅ Firebase initialized")

// Export Firestore DB
export const db = getFirestore(app)
