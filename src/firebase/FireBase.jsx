import { initializeApp } from "firebase/app";
import {
  child,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3E6_Y37FSFQ5pDUDEripfBbutKOWzSQU",
  authDomain: "money-manager-22821.firebaseapp.com",
  databaseURL:
    "https://money-manager-22821-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "money-manager-22821",
  storageBucket: "money-manager-22821.appspot.com",
  messagingSenderId: "212755374736",
  appId: "1:212755374736:web:e0d66884403e78b850ae15",
  measurementId: "G-4W0WF12EX8",
};

initializeApp(firebaseConfig);

export const listenTransactions = (callback) => {
  const db = getDatabase();
  const starCountRef = ref(db, "transactions");
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const createTransaction = (title, amount, type) => {
  const db = getDatabase();
  //const key = Math.floor(Math.random()*100000)

  const key = push(child(ref(db), "transactions")).key;

  set(ref(db, `transactions/${key}`), {
    title,
    amount,
    type,
  });
};

export const updateTransaction = (uid, title, amount, type) => {
  const db = getDatabase();
  let updates = {};
  updates["/transactions/" + uid] = {
    title,
    amount,
    type,
  };
  update(ref(db), updates);
};

export const deleteTransaction = (key) => {
  const db = getDatabase();
  remove(ref(db, `transactions/${key}`));
};

export const getUserData = ()=>{
    const auth = getAuth();
    return auth
}

export const signInFirebase = (email, password) => {
  const auth = getAuth();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log("user ", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
};