"use client";

import { signIn, signOut } from "next-auth/react";

export function GoogleLoginButton() {
  return (
    <button className="action" type="button" onClick={() => signIn("google")}>
      Continue with Google
    </button>
  );
}

export function LogoutButton() {
  return (
    <button className="action secondary" type="button" onClick={() => signOut()}>
      Log out
    </button>
  );
}
