import * as firebase from 'firebase/app';
import 'firebase/analytics';

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
  firebaseApp: firebase.app.App;
  analytics?: firebase.analytics.Analytics;

  constructor() {
    this.firebaseApp = !firebase.apps.length
      ? firebase.initializeApp(firebaseConfig)
      : firebase.app();
  }

  init() {
    this.analytics = this.firebaseApp.analytics();
  }

  killFirebase() {
    this.firebaseApp.delete();
  }
}

const firebaseInstance = new Firebase();
export default firebaseInstance;
