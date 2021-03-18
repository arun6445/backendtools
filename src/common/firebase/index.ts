import FirebaseService from './firebase.service';

import * as serviceAccount from './config/serviceAccountKey.json';
import { ServiceAccount } from 'firebase-admin';

export const firebaseFactory = {
  provide: FirebaseService,
  useFactory: () => {
    return new FirebaseService(serviceAccount as ServiceAccount);
  },
  inject: [],
};
