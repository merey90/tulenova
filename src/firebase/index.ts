import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { config } from '../utils/config';

class Firebase {
  firebaseApp: FirebaseApp;
  analytics: Analytics | undefined;

  constructor() {
    this.firebaseApp ??= initializeApp(config.firebaseConfig);
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
