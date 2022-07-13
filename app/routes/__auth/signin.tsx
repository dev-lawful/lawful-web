import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from "@chakra-ui/react";
import { ActionFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import type { FormEventHandler } from "react";
import { useRef } from "react";
import { supabase, useSupabaseClient } from "~/db";
import { commitSession, getSession } from "~/sessions";

interface SignInForm {
  email: string;
  password: string;
}

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<SignInForm>;
  //TODO use Chat type
  fields?: SignInForm;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    email: !email ? "Email is required" : undefined,
    password: !password ? "Password is required" : undefined,
  };
  const fields = { email, password };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const { session: userSession } = await supabase.auth.signIn({
    email,
    password,
  });
  if (userSession) {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("access_token", userSession.access_token);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

const SignInRoute = () => {
  const supabase = useSupabaseClient();
  const transition = useTransition();
  const actionData = useActionData<ActionData>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSignIn: FormEventHandler<HTMLFormElement> = async (e) => {
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    await supabase.auth.signIn({
      email,
      password,
    });
  };

  const shouldShowAlert = !!actionData?.formError;

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool <Link color={"blue.400"}>features</Link> ✌️
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Form method="post" onSubmit={handleSignIn}>
            <Stack spacing={4}>
              {shouldShowAlert ? (
                <Alert status="error" borderRadius={5}>
                  <AlertIcon />
                  {actionData.formError}
                </Alert>
              ) : null}
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input
                  ref={emailRef}
                  name="email"
                  type="email"
                  defaultValue={actionData?.fields?.email}
                />
                <FormErrorMessage>
                  {actionData?.fieldErrors?.email}
                </FormErrorMessage>
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input ref={passwordRef} name="password" type="password" />
                <FormErrorMessage>
                  {actionData?.fieldErrors?.password}
                </FormErrorMessage>
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link color={"blue.400"}>Forgot password?</Link>
                </Stack>
                <Button
                  disabled={transition.state === "submitting"}
                  type="submit"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignInRoute;
