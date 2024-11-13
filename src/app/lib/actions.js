"use server";

import { signIn } from "@/auth";

export async function authenticate(formData) {
  try {
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });
    console.log("res", result);
  } catch (error) {
    if (error && !!error.type) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
  }
}
