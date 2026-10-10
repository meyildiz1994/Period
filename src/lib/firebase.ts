import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseAuthModule from '@firebase/auth';
import { initializeAuth, type Auth, type Persistence } from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase project "nilemy-app" (Spark plan). Only used when the user opens an account: sign-in
// (Firebase Authentication) and the end-to-end encrypted backup (Cloud Firestore, eur3).
// These values identify the project; they aren't secrets. Access is limited by the Firestore
// rules (users/{uid}/** is readable and writable only by that user).
// apiKey and appId belong to the "Nilemy web" app registered in Project settings.
export const FIREBASE = {
  apiKey: 'AIzaSyD3b8XG-vD78YUg-glphANDcJ4_DWjP6oo',
  authDomain: 'nilemy-app.firebaseapp.com',
  projectId: 'nilemy-app',
  storageBucket: 'nilemy-app.firebasestorage.app',
  messagingSenderId: '745565714522',
  appId: '1:745565714522:web:6e9689ff172ed952d74063',
};

/** OAuth clients for Google sign-in. webClientId is the "Web client ID" of the Google provider. */
export const GOOGLE = {
  webClientId: '745565714522-33r5oar512mr0t8klb1obae0lp31h1a5.apps.googleusercontent.com',
  iosClientId: '745565714522-lsre4asflclkglu912qbp1875psrj36i.apps.googleusercontent.com',
};

// Only the React Native build of @firebase/auth has this; its published types don't list it.
const { getReactNativePersistence } = firebaseAuthModule as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

let auth: Auth | null = null;

/** Started on first use, so people without an account never load Firebase. */
export function firebaseAuth() {
  if (!auth) {
    const app = getApps()[0] ?? initializeApp(FIREBASE);
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return auth;
}

export function firestore() {
  firebaseAuth();
  return getFirestore(getApp());
}
