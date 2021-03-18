import { Injectable } from '@nestjs/common';

import * as firabseAdmin from 'firebase-admin';

@Injectable()
export default class FirebaseService {
  private firebaseApplication;

  constructor(serviceAccount: firabseAdmin.ServiceAccount) {
    this.firebaseApplication = firabseAdmin.initializeApp({
      credential: firabseAdmin.credential.cert(serviceAccount),
    });
  }

  public async sendNotification(tokens: string[], message: any) {
    const options = {
      contentAvailable: true,
      priority: 'high',
    };

    return firabseAdmin
      .messaging(this.firebaseApplication)
      .sendToDevice(tokens, message, options);
  }
}
