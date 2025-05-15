import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB3UMXpG2mt0feWC8K9SOkzR8VIUqgCUDY",
  authDomain: "notasdepedido.firebaseapp.com",
  projectId: "notasdepedido",
  storageBucket: "notasdepedido.firebasestorage.app",
  messagingSenderId: "74167398468",
  appId: "1:74167398468:web:4fee46f74b466de40a4c11"
};


const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }