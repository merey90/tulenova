import  { FirebaseApp, initializeApp } from 'firebase/app';
import { getAnalytics, Analytics, logEvent  } from 'firebase/analytics';

import { IFirebaseConfigs } from './types';

let firebaseConfig: IFirebaseConfigs;
if (process.env.NODE_ENV === 'test') {
  firebaseConfig = {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain',
    databaseURL: 'mock-database-url',
    projectId: 'mock-project-id',
    storageBucket: 'mock-storage-bucket',
    messagingSenderId: 'mock-messaging-sender-id',
    appId: 'mock-app-id',
    measurementId: 'mock-measurement-id',
  };
} else {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };
}

class Firebase {
  firebaseApp: FirebaseApp;
  analytics: Analytics | undefined;

  constructor() {
    this.firebaseApp ??= initializeApp(firebaseConfig)
  }

  init() {
    this.analytics = getAnalytics();
  }

  log(message: string, params: {}) {
    !!this.analytics && logEvent(this.analytics, message, params)
  }
}

const firebaseInstance = new Firebase();
export default firebaseInstance;
