
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

export function initAdmin() {
  if (!getApps().length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON');
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
}

export function getDb() {
  initAdmin();
  return getFirestore();
}

export function getAdmin() {
  initAdmin();
  return getAdminAuth();
}
