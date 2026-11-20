"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: true },
        plan: { type: "string", required: true, input: false },
      },
    }),
  ],
});

export const { signIn, signUp, useSession } = createAuthClient();