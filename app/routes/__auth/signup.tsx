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
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useTransition,
} from "@remix-run/react";
import { useState } from "react";
import { supabase } from "~/db";
import {
  addUserToOrganization,
  addUserToTeam,
  createProfile,
  createTeam,
  findProfileByEmail,
  suscribeToProduct,
} from "~/models";
import { createOrganization } from "~/models";

interface SignUpForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

type ActionData = {
  formResult?: {
    status: "error" | "success";
    message: string;
  };
  fieldErrors?: Partial<SignUpForm>;
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
      formResult: {
        status: "error",
        message: `Form not submitted correctly.`,
      },
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

  const { data: profiles, error: profileError } = await findProfileByEmail(
    email
  );

  const [userAlreadyExists] = profiles;
  if (profileError) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! There has been an error finding the profile by email.",
      },
    });
  }
  if (userAlreadyExists) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Email already taken",
      },
    });
  }

  const { user, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpError || !user?.id) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! Sign up error or there is no user ID.",
      },
    });
  }

  const { error: creationError } = await createProfile({
    firstName,
    lastName,
    email,
    id: user?.id,
  });
  if (creationError) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! There has been an error creating your Profile.",
      },
    });
  }

  const { data: firstOrgData, error: firstOrgError } = await createOrganization(
    {
      ownerId: user.id,
      slug: `${firstName}${lastName}-NET`.toLowerCase(),
      description:
        "Automatically created organization with a Network subscription",
      name: `${firstName} ${lastName}'s NET trial organization`,
    }
  );
  const [firstOrg] = firstOrgData;
  if (firstOrgError || !firstOrg) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred creating automatic organizations",
      },
    });
  }
  const { data: addToFirstOrgData, error: addToFirstOrgError } =
    await addUserToOrganization({
      userId: user.id,
      organizationId: firstOrg.id,
    });
  const [addToFirstOrg] = addToFirstOrgData;
  if (addToFirstOrgError || !addToFirstOrg) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred adding user to an organization",
      },
    });
  }

  const { data: firstSubData, error: firstSubError } = await suscribeToProduct({
    organizationId: firstOrg.id,
    product: "network",
  });
  const [firstSub] = firstSubData;
  if (firstSubError || !firstSub) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred creating automatic subscriptions",
      },
    });
  }
  const { data: firstTeamData, error: firstTeamError } = await createTeam({
    organizationId: firstOrg.id,
    name: "Team Network",
    description: "Automatically created team",
    slug: "teamnet",
  });
  const [firstTeam] = firstTeamData;
  if (firstTeamError || !firstTeam) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! An unexpected error ocurred creating automatic team",
      },
    });
  }
  const { data: addToFirstTeamData, error: addToFirstTeamError } =
    await addUserToTeam({
      userId: user.id,
      teamId: firstTeam.id,
    });
  const [addToFirstTeam] = addToFirstTeamData;
  if (addToFirstTeamError || !addToFirstTeam) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! An unexpected error ocurred adding user to a team",
      },
    });
  }

  const { data: secondOrgData, error: secondOrgError } =
    await createOrganization({
      ownerId: user.id,
      slug: `${firstName}${lastName}-DEC`.toLowerCase(),
      description:
        "Automatically created organization with a Decode subscription",
      name: `${firstName} ${lastName}'s DEC trial organization`,
    });
  const [secondOrg] = secondOrgData;
  if (secondOrgError || !secondOrg) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred creating automatic organizations",
      },
    });
  }
  const { data: addToSecondOrgData, error: addToSecondOrgError } =
    await addUserToOrganization({
      userId: user.id,
      organizationId: secondOrg.id,
    });
  const [addToSecondOrg] = addToSecondOrgData;
  if (addToSecondOrgError || !addToSecondOrg) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred adding user to an organization",
      },
    });
  }

  const { data: secondSubData, error: secondSubError } =
    await suscribeToProduct({
      organizationId: secondOrg.id,
      product: "decode",
    });
  const [secondSub] = secondSubData;
  if (secondSubError || !secondSub) {
    return badRequest({
      formResult: {
        status: "error",
        message:
          "Oops! An unexpected error ocurred creating automatic subscriptions",
      },
    });
  }
  const { data: secondTeamData, error: secondTeamError } = await createTeam({
    organizationId: secondOrg.id,
    name: "Team Decode",
    description: "Automatically created team",
    slug: "teamdec",
  });
  const [secondTeam] = secondTeamData;
  if (secondTeamError || !secondTeam) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! An unexpected error ocurred creating automatic team",
      },
    });
  }

  const { data: addToSecondTeamData, error: addToSecondTeamError } =
    await addUserToTeam({
      userId: user.id,
      teamId: secondTeam.id,
    });
  const [addToSecondTeam] = addToSecondTeamData;
  if (addToSecondTeamError || !addToSecondTeam) {
    return badRequest({
      formResult: {
        status: "error",
        message: "Oops! An unexpected error ocurred adding user to a team",
      },
    });
  }

  return json<ActionData>({
    formResult: {
      status: "success",
      message: "Great, We've sent you a confirmation email!",
    },
  });
};

const SignUpRoute = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();
  const [showPassword, setShowPassword] = useState(false);

  const alert = actionData?.formResult;

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.800">
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl" textAlign="center">
            Sign up
          </Heading>
          <Text fontSize="lg" color="gray.600">
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          <Form method="post">
            <Stack spacing={4}>
              {alert ? (
                <Alert status={alert.status} borderRadius={5}>
                  <AlertIcon />
                  {alert.message}
                </Alert>
              ) : null}
              <HStack>
                <Box>
                  <FormControl
                    id="firstName"
                    isRequired
                    isInvalid={!!actionData?.fieldErrors?.firstName}
                  >
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
                  <FormControl
                    id="lastName"
                    isRequired
                    isInvalid={!!actionData?.fieldErrors?.lastName}
                  >
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
              <FormControl
                id="email"
                isRequired
                isInvalid={!!actionData?.fieldErrors?.email}
              >
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
              <FormControl
                id="password"
                isRequired
                isInvalid={!!actionData?.fieldErrors?.password}
              >
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
                <Text align="center">
                  Already a user?{" "}
                  <Link as={RemixLink} to="/signin" color={"blue.400"}>
                    Sign in
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
