import { Amplify } from "aws-amplify";
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

// Cognito user pool from infra/lib/auth-stack.ts (Phase 5). IDs come from
// .env.local, never hardcoded — see .env.example.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    },
  },
});

export async function signIn(email: string, password: string) {
  return amplifySignIn({ username: email, password });
}

export async function signOut() {
  return amplifySignOut();
}

export async function getSession() {
  return fetchAuthSession();
}

export async function getSignedInUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
