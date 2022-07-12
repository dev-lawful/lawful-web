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
} from "@chakra-ui/react";
import { Form, useNavigate } from "@remix-run/react";
import type { FormEventHandler } from "react";
import { useState, useRef } from "react";
import { useSupabaseClient } from "~/db";

type FormState = "submitting" | "idle" | "error";

const SignInRoute = () => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSignIn: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setFormState("submitting");

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const { error, user } = await supabase.auth.signIn({ email, password });
    if (error) {
      setFormState("error");
    }
    if (user) {
      navigate("/", { replace: true });
    }
  };

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
              {formState === "error" ? (
                <Alert status={formState} borderRadius={5}>
                  <AlertIcon />
                  Oops. There has been an error!
                </Alert>
              ) : null}
              <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input ref={emailRef} name="email" type="email" />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input ref={passwordRef} name="password" type="password" />
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
                  disabled={formState === "submitting"}
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
