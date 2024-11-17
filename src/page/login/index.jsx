"use client";

import {
  PasswordInput,
  Container,
  TextInput,
  Stack,
  Button,
  Alert,
} from "@mantine/core";
import useAuth_deprecated from "../../hooks/use-auth";
import { useForm } from "@mantine/form";
import React, { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/app/lib/actions";
import { useSession } from "next-auth/react";

export default function Login() {
  const { data: session, status } = useSession();
  const { login } = useAuth_deprecated();
  const router = useRouter();
  // const [errorMessage, formAction, isPending] = useActionState(
  //   authenticate,
  //   undefined,
  // );

  const [errors, setErrors] = React.useState();

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
      router.push("/");
    });
    // login(values.username.trim(), values.password)
    //   .then((data) => {
    //     form.reset();
    //     if (data?.username) {
    //       router.push("/");
    //     }
    //   })
    //   .catch((e) => {
    //     setErrors(e.message);
    //   });
  };

  useEffect(() => {
    console.log(session);
  }, [session]);

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
          {/*{errorMessage && (*/}
          {/*  <>*/}
          {/*    <p className="text-sm text-red-500">{errorMessage}</p>*/}
          {/*  </>*/}
          {/*)}*/}
          {/*{!!errors && (*/}
          {/*  <Alert color="red" variant="light">*/}
          {/*    {errors}*/}
          {/*  </Alert>*/}
          {/*)}*/}
          <Button type="submit">Log In</Button>
        </Stack>
      </form>
    </Container>
  );
}
