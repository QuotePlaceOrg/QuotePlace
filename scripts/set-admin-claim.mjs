#!/usr/bin/env node

/**
 * Grant or revoke the "admin" custom claim used by Firestore rules.
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs <firebase-auth-uid>
 *   node scripts/set-admin-claim.mjs <firebase-auth-uid> --revoke
 *
 * Use a trusted service account locally. Never commit credential JSON.
 */

import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const uid = args.find((arg) => !arg.startsWith("--"));
const revoke = args.includes("--revoke");

if (!uid) {
  console.error("Usage: node scripts/set-admin-claim.mjs <firebase-auth-uid> [--revoke]");
  process.exit(2);
}

let credential = applicationDefault();
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  } catch (error) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:", error.message);
    process.exit(2);
  }
}

const app = initializeApp({
  credential,
  projectId: process.env.FIREBASE_PROJECT_ID || "stoicbare-86bfa",
});

try {
  const auth = getAuth(app);
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims || {}) };

  if (revoke) {
    delete claims.admin;
  } else {
    claims.admin = true;
  }

  await auth.setCustomUserClaims(uid, claims);
  console.log(
    (revoke ? "Revoked" : "Granted") +
    " StoicBare admin access for " +
    (user.email || user.uid) +
    ". The user must sign in again or refresh their ID token.",
  );
} catch (error) {
  console.error("Could not update admin claim:", error?.message || error);
  process.exitCode = 1;
} finally {
  await app.delete();
}
