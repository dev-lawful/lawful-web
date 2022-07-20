import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Form, Link as RemixLink } from "@remix-run/react";
import type { FC, VFC } from "react";
import { useSupabaseClient } from "~/db";

const Links = ["Initiatives", "Kanban", "Chat", "🔜"];

const NavLink: FC = ({ children }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={"#"}
  >
    {children}
  </Link>
);

export const Navbar: VFC = () => {
  const { user } = useSupabaseClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box>Logo</Box>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  src="https://avatars.githubusercontent.com/u/103387285?v=4"
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Switch Org / Team</MenuItem>
                <MenuItem>Profile</MenuItem>
                <MenuDivider />
                <Form action="/signout" method="post">
                  <MenuItem role="button" type="submit">
                    Sign out
                  </MenuItem>
                </Form>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Link as={RemixLink} to="/signin" fontSize={"sm"}>
                Sign in
              </Link>
              <Link
                as={RemixLink}
                to="/signup"
                display={{ base: "none", md: "inline-flex" }}
                p={2}
                ml={5}
                borderRadius="5"
                fontSize={"sm"}
                bg="pink.400"
                _hover={{
                  bg: "pink.300",
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
