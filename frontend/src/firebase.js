import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null, auth = null, provider = null
const missing = Object.entries(cfg).filter(([, v]) => !v)
if (missing.length) {
  console.warn('[Firebase] Missing envs:', missing.map(([k])=>k).join(', '))
} else {
  app = initializeApp(cfg)
  auth = getAuth(app)
  provider = new GoogleAuthProvider()
}
export { app, auth, provider }
