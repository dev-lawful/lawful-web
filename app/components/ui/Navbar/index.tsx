import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Img,
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
import { useProduct } from "~/utils";

const useNavbarLinks = () => {
  const params = useParams();

  const baseLinks = [
    {
      label: "Network",
      to: "/network",
    },
    {
      label: "Decode",
      to: "/decode",
    },
  ];

  if (!params.product || !params.teamSlug || !params.orgSlug) return baseLinks;

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
        {
          label: "Meeting",
          to: `${params.product}/${params.orgSlug}/${params.teamSlug}/meeting`,
        },
      ];
    }
    default: {
      return baseLinks;
    }
  }
};

const NavLink = ({ children, to }: PropsWithChildren<{ to: string }>) => (
  <Link
    as={RemixLink}
    to={to}
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
  >
    {children}
  </Link>
);

export const Navbar: FC = () => {
  const { user } = useSupabaseClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const product = useProduct();

  const links = useNavbarLinks();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          colorScheme={product}
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <RemixLink to="/">
            <Img src={`/images/logos/${product}-logo-white.svg`} height={10} />
          </RemixLink>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {links.map(({ label, to }) => (
              <NavLink to={to} key={label}>
                {label}
              </NavLink>
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
                <Avatar size="sm" name={user.email} />
              </MenuButton>
              <MenuList zIndex={2}>
                {["decode", "network"].includes(product) ? (
                  <MenuItem as={RemixLink} to={`./${product}/organizations`}>
                    Switch organization
                  </MenuItem>
                ) : null}
                <MenuItem as={RemixLink} to="/me">
                  Profile
                </MenuItem>
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
                bg={`${product}.300`}
                _hover={{
                  bg: `${product}.400`,
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
            {links.map(({ label, to }) => (
              <NavLink to={to} key={label}>
                {label}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
