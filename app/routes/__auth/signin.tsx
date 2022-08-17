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
import {
  Form,
  useActionData,
  useTransition,
  Link as RemixLink,
} from "@remix-run/react";
import { supabase } from "~/db";
import { commitSession, getSession } from "~/sessions";
import { z } from "zod";

//TODO: move, will be used everywhere
type inferSafeParseErrors<T extends z.ZodType<any, any, any>, U = string> = {
  formErrors: U[];
  //TODO: should this be optional??
  fieldErrors: {
    [P in keyof z.infer<T>]?: U[];
  };
};

const SignInFormSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInForm = { fields?: z.infer<typeof SignInFormSchema> };
type SignInFormErrors = inferSafeParseErrors<typeof SignInFormSchema>;

type ActionData = SignInFormErrors & SignInForm;

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const fields = Object.fromEntries(formData.entries());
  const result = SignInFormSchema.safeParse(fields);
  if (!result.success) {
    return badRequest({
      ...result.error.flatten(),
    });
  }
  const { email, password } = result.data;
  const { data, error } = await supabase.auth.api.signInWithEmail(
    email,
    password
  );
  if (error) {
    return badRequest({ formErrors: [error.message], fieldErrors: {} });
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
    formErrors: ["Oops! We coudn't sign you in, please try again"],
    fieldErrors: {},
  });
};

const SignInRoute = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();

  const shouldShowAlert = !!actionData?.formErrors?.length;

  //TODO: move this too
  const formatErrors = (error: string, index: number, array: Array<string>) =>
    index === array.length - 1 ? error : `${error}. `;

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
                  {actionData.formErrors.map(formatErrors)}
                </Alert>
              ) : null}
              <FormControl
                id="email"
                isInvalid={!!actionData?.fieldErrors?.email}
              >
                <FormLabel>Email address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  defaultValue={actionData?.fields?.email}
                />
                <FormErrorMessage>
                  {actionData?.fieldErrors?.email?.map(formatErrors)}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                id="password"
                isInvalid={!!actionData?.fieldErrors?.password}
              >
                <FormLabel>Password</FormLabel>
                <Input name="password" type="password" />
                <FormErrorMessage>
                  {actionData?.fieldErrors?.password?.map(formatErrors)}
                </FormErrorMessage>
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link as={RemixLink} to="/forgotPassword" color={"blue.400"}>
                    Forgot password?
                  </Link>
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
              <Stack pt={6}>
                <Text align="center">
                  I you haven't registered yet{" "}
                  <Link as={RemixLink} to="/signup" color={"blue.400"}>
                    Sign up
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default SignInRoute;
