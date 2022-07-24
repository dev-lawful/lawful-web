import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
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
import { Form, Link as RemixLink, useParams } from "@remix-run/react";
import type { FC, PropsWithChildren } from "react";
import { useSupabaseClient } from "~/db";

const useNavbarLinks = () => {
  const params = useParams();
  if (!params.product || !params.teamSlug || !params.orgSlug) return [];

  switch (params.product) {
    case "decode": {
      return [
        {
          label: "Kanban",
          to: `${params.product}/${params.orgSlug}/${params.teamSlug}/kanban`,
        },
        {
          label: "Initiatives",
          to: `${params.product}/${params.orgSlug}/${params.teamSlug}/initiatives`,
        },
      ];
    }
    case "network": {
      return [
        {
          label: "Chat",
          to: `${params.product}/${params.orgSlug}/${params.teamSlug}/chat`,
        },
        {
          label: "Initiatives",
          to: `${params.product}/${params.orgSlug}/${params.teamSlug}/initiatives`,
        },
      ];
    }
    default: {
      return [];
    }
  }
};

const NavLink = ({ children }: PropsWithChildren<{}>) => (
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

export const Navbar: FC = () => {
  const { user } = useSupabaseClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { product } = useParams();
  const links = useNavbarLinks();

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
          <RemixLink to="/">
            <Image
              src={`/images/logos/${product ?? "lawful"}-logo-white.svg`}
              height={10}
            />
          </RemixLink>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {links.map(({ label, to }) => (
              <Link to={to} as={RemixLink} key={label}>
                {label}
              </Link>
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
            {getLinksByProduct.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
