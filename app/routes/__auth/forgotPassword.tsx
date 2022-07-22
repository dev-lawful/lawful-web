import {
  Button,
  FormControl,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { supabase } from "~/db";

interface ForgotPasswordForm {
  email: string;
}
type ActionData = {
  formResult?: {
    status: "error" | "success";
    message: string;
  };
  fieldErrors?: Partial<ForgotPasswordForm>;
  fields?: ForgotPasswordForm;
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (typeof email !== "string") {
    return badRequest({
      formResult: {
        status: "error",
        message: `Form not submitted correctly.`,
      },
    });
  }
  const fieldErrors = {
    email: !email ? "Email is required" : undefined,
  };
  const fields = { email };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const { data, error } = await supabase.auth.api.resetPasswordForEmail(email);
  if (error || !data) {
    return badRequest({
      formResult: {
        status: "error",
        message: error?.message || "Oops, an unexpected error occurred",
      },
    });
  }

  return json<ActionData>({
    formResult: {
      status: "success",
      message: "Great, We've sent you an email!",
    },
  });
};

const ForgotPasswordPage = () => {
  const transition = useTransition();
  const actionData = useActionData<ActionData>();

  const alert = actionData?.formResult;

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
          Forgot your password?
        </Heading>
        {alert ? (
          <Alert status={alert.status} borderRadius={5}>
            <AlertIcon />
            {alert.message}
          </Alert>
        ) : null}
        <Text
          fontSize={{ base: "sm", sm: "md" }}
          color={useColorModeValue("gray.800", "gray.400")}
        >
          You&apos;ll get an email with a reset link
        </Text>
        <Form method="post">
          <Stack spacing={6}>
            <FormControl
              id="email"
              isInvalid={!!actionData?.fieldErrors?.email}
            >
              <Input
                name="email"
                placeholder="your-email@example.com"
                _placeholder={{ color: "gray.500" }}
                type="email"
                defaultValue={actionData?.fields?.email}
              />
              <FormErrorMessage>
                {actionData?.fieldErrors?.email}
              </FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              disabled={
                transition.state === "submitting" ||
                actionData?.formResult?.status === "success"
              }
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
            >
              Request Reset
            </Button>
          </Stack>
        </Form>
      </Stack>
    </Flex>
  );
};

export default ForgotPasswordPage;
