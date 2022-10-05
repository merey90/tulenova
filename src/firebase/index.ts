import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';

import { IFirebaseConfigs } from './types';

const firebaseConfig: IFirebaseConfigs = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

class Firebase {
  firebaseApp: FirebaseApp;
  analytics: Analytics | undefined;

  constructor() {
    this.firebaseApp ??= initializeApp(firebaseConfig);
  }

  init() {
    this.analytics = getAnalytics();
  }

  log(message: string, params: Record<string, unknown>) {
    !!this.analytics && logEvent(this.analytics, message, params);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
let firebaseInstance = { init: () => {} };
if (process.env.NODE_ENV === 'production') {
  firebaseInstance = new Firebase();
}
export default firebaseInstance;
