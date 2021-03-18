import FirebaseService from './firebase.service';

import S3Service from 'common/s3/s3.service';
import { ServiceAccount } from 'firebase-admin';

export const firebaseFactory = {
  provide: FirebaseService,
  useFactory: async (s3Service: S3Service) => {
    const serviceAccount = await s3Service.getDataFromS3(
      'firebase_account_key.json',
    );

    return new FirebaseService(
      JSON.parse(serviceAccount.toString()) as ServiceAccount,
    );
  },
  inject: [S3Service],
};
