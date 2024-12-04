"use client";

import {
  PasswordInput,
  Container,
  TextInput,
  Stack,
  Button,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/app/lib/actions";
import { useSession } from "next-auth/react";

export default function Login() {
  const { update } = useSession();
  const router = useRouter();
  // const [errorMessage, formAction, isPending] = useActionState(
  //   authenticate,
  //   undefined
  // );

  const [error, setError] = useState();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    const values = form.getValues();
    const fd = new FormData();
    fd.set("username", values.username.trim());
    fd.set("password", values.password.trim());

    await authenticate(fd).then((res) => {
      if (!!res) {
        setError(res);
        return;
      }

      update();
      router.push("/");
    });
  };

  return (
    <Container py="md">
      <form onSubmit={handleLogin}>
        <Stack>
          <TextInput
            label="Username"
            placeholder="Username"
            required
            key={form.key("username")}
            {...form.getInputProps("username")}
          />
          <PasswordInput
            placeholder="Your password"
            label="Password"
            required
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
          {!!error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
          <Button type="submit">Log In</Button>
        </Stack>
      </form>
    </Container>
  );
}
