import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLocation,
  useTransition,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { CustomCatchBoundary, CustomErrorBoundary } from "~/components/ui";
import { supabase } from "~/db";

interface ActionData {
  formResult?: FormResult;
}
interface FormResult {
  status: "error" | "success";
  message: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const accessToken = formData.get("accessToken");

  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string" ||
    !accessToken ||
    typeof accessToken !== "string"
  ) {
    return json<ActionData>(
      {
        formResult: {
          status: "error",
          message: "Form not submitted correctly.",
        },
      },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.api.updateUser(accessToken, {
    password,
  });

  if (error) {
    return json<ActionData>(
      {
        formResult: {
          status: "error",
          message: error?.message,
        },
      },
      { status: 400 }
    );
  }

  return json<ActionData>({
    formResult: {
      status: "success",
      message: "Congrats! Your password has been changed correctly.",
    },
  });
};

const ResetPasswordPage = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();
  const [accessToken, setAccessToken] = useState("");

  const { hash } = useLocation();
  useEffect(() => {
    //TODO: This can be done without useEffect but SSR doesn't have the hash so I get a dissabled button and an error always
    const [, fromAccessTokenToEndHash] = hash.split("access_token=", 2);
    const [token] = fromAccessTokenToEndHash?.split("&", 1) || [
      fromAccessTokenToEndHash,
    ];
    setAccessToken(token);
  }, [hash]);

  const accessTokenAlert: FormResult | undefined = accessToken
    ? undefined
    : {
        status: "error",
        message: "Access token not found",
      };
  const formAlert = actionData?.formResult || accessTokenAlert;

  const buttonDisabled =
    transition.state === "submitting" ||
    actionData?.formResult?.status === "success" ||
    !accessToken;

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
          Enter new password
        </Heading>
        {formAlert ? (
          <Alert status={formAlert.status} borderRadius={5}>
            <AlertIcon />
            {formAlert.message}
          </Alert>
        ) : null}
        <Form method="post">
          <Input type="hidden" name="accessToken" value={accessToken || ""} />
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                name="email"
                placeholder="your-email@example.com"
                _placeholder={{ color: "gray.500" }}
                type="email"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" name="password" />
            </FormControl>
            <Button
              type="submit"
              disabled={buttonDisabled}
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
            >
              Submit
            </Button>
          </Stack>
        </Form>
      </Stack>
    </Flex>
  );
};

export default ResetPasswordPage;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
