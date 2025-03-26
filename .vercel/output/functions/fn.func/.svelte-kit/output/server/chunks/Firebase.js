import { initializeApp, FirebaseError } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, updateDoc } from "firebase/firestore";
const PUBLIC_FIREBASE_API_KEY = "AIzaSyClUsulRQAF6asTgqVjOtPhpJ25j8I2oBM";
const PUBLIC_FIREBASE_AUTH_DOMAIN = "popit-wheel.firebaseapp.com";
const PUBLIC_FIREBASE_PROJECT_ID = "popit-wheel";
const PUBLIC_FIREBASE_STORAGE_BUCKET = "popit-wheel.appspot.com";
const PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "468322161095";
const PUBLIC_FIREBASE_APP_ID = "1:468322161095:web:a9f0cfeacd1017938109e2";
const PUBLIC_FIREBASE_MEASUREMENT_ID = "G-3MYLWE081P";
const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID,
  measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};
try {
  initializeApp(firebaseConfig);
} catch (error) {
  if (error instanceof FirebaseError && error.code !== "app/duplicate-app") {
    console.error(error);
  }
}
const db = getFirestore();
const auth = getAuth();
const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await setDoc(doc(collection(db, "users"), userCredential.user.uid), {
    email,
    createdAt: /* @__PURE__ */ new Date(),
    lastActive: /* @__PURE__ */ new Date(),
    uid: userCredential.user.uid,
    wheels: []
  });
  return userCredential.user;
};
const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  updateUserLastActive(userCredential.user.uid);
  return userCredential.user;
};
const updateUserLastActive = (uid) => updateDoc(doc(db, "users", uid), { lastActive: /* @__PURE__ */ new Date() });
const getCurrentUser = () => auth.currentUser;
export {
  PUBLIC_FIREBASE_MEASUREMENT_ID as P,
  firebaseConfig as f,
  getCurrentUser as g,
  registerUser as r,
  signIn as s
};
