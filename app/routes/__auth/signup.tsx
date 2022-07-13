import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useTransition,
} from "@remix-run/react";
import { useState } from "react";
import { supabase } from "~/db";
import { createProfile, findProfileByEmail } from "~/models/profiles.models";
import { commitSession, getSession } from "~/sessions";

interface SignUpForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<SignUpForm>;
  //TODO use Chat type
  fields?: SignUpForm;
};

//TODO: Repeated
const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof firstName !== "string" ||
    typeof lastName !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    email: !email ? "Email is required" : undefined,
    password: !password ? "Password is required" : undefined,
    firstName: !firstName ? "First name is required" : undefined,
    lastName: !lastName ? "Last name is required" : undefined,
  };
  const fields = { email, password, firstName, lastName };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  await supabase.auth.signOut();
  const {
    session: sessionData,
    user,
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
  });

  const userAlreadyExists = await findProfileByEmail(email);
  if (userAlreadyExists) {
    return badRequest({
      formError: "Email already taken!",
    });
  }

  if (!signUpError && user?.id) {
    const { error: profileError } = await createProfile({
      firstName,
      lastName,
      email,
      id: user?.id,
    });
    if (profileError) {
      return badRequest({
        formError: "Oops! An unexpected error ocurred",
      });
    }
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("access_token", sessionData?.access_token);
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const SignUpRoute = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();
  const [showPassword, setShowPassword] = useState(false);

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
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Form method="post">
            <Stack spacing={4}>
              {shouldShowAlert ? (
                <Alert status="error" borderRadius={5}>
                  <AlertIcon />
                  {actionData.formError}
                </Alert>
              ) : null}
              <HStack>
                <Box>
                  <FormControl id="firstName" isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      type="text"
                      defaultValue={actionData?.fields?.firstName}
                    />
                    <FormErrorMessage>
                      {actionData?.fieldErrors?.firstName}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
                <Box>
                  <FormControl id="lastName">
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      type="text"
                      defaultValue={actionData?.fields?.lastName}
                    />
                    <FormErrorMessage>
                      {actionData?.fieldErrors?.lastName}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </HStack>
              <FormControl id="email" isRequired>
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
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputRightElement h="full">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {actionData?.fieldErrors?.password}
                </FormErrorMessage>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  disabled={transition.state === "submitting"}
                  loadingText="Submitting"
                  type="submit"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={"center"}>
                  Already a user?{" "}
                  <Link as={RemixLink} to="/signin" color={"blue.400"}>
                    Login
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

export default SignUpRoute;
