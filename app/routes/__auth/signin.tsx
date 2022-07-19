import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { supabase } from "~/db";
import { commitSession, getSession } from "~/sessions";

interface SignInForm {
  email: string;
  password: string;
}

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<SignInForm>;
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

  const { data, error } = await supabase.auth.api.signInWithEmail(
    email,
    password
  );

  if (error) {
    return badRequest({ formError: error.message });
  }
  const userSession = data &&
    data.user && {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? "",
      user: data.user,
      expiresIn: data.expires_in ?? -1,
      expiresAt: data.expires_at ?? -1,
    };

  if (userSession) {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("authenticated", userSession);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return badRequest({
    formError: "Oops! We coudn't sign you in, please try again",
  });
};

const SignInRoute = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();

  const shouldShowAlert = !!actionData?.formError;

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.800">
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Sign in to your account</Heading>
          <Text fontSize="lg" color="gray.600">
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          <Form method="post">
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
                <Input name="password" type="password" />
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
                  bg="blue.400"
                  color="white"
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
