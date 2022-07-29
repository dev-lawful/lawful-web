import {
  Box,
  Button,
  Heading,
  Icon,
  Img,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";

const IndexPage = () => {
  const bg = useColorModeValue("white", "gray.800");
  return (
    <Box pos="relative" overflow="hidden" bg={bg}>
      <Box maxW="7xl" mx="auto">
        <Box
          pos="relative"
          pb={{
            base: 8,
            sm: 16,
            md: 20,
            lg: 28,
            xl: 32,
          }}
          maxW={{
            lg: "2xl",
          }}
          w={{
            lg: "full",
          }}
          zIndex={1}
          bg={bg}
          border="solid 1px transparent"
        >
          <Icon
            display={{
              base: "none",
              lg: "block",
            }}
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            h="full"
            w={48}
            color={bg}
            transform="translateX(50%)"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </Icon>
          <Box
            mx="auto"
            maxW={{
              base: "7xl",
            }}
            px={{
              base: 4,
              sm: 6,
              lg: 8,
            }}
            mt={{
              base: 10,
              sm: 12,
              md: 16,
              lg: 20,
              xl: 28,
            }}
          >
            <Box
              w="full"
              textAlign={{
                sm: "center",
                lg: "left",
              }}
              justifyContent="center"
              alignItems="center"
            >
              <Heading
                fontWeight={600}
                fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
                lineHeight={"110%"}
              >
                One app. <br />
                <Text as={"span"} color={"lawful.400"}>
                  Many collaboration tools.
                </Text>
              </Heading>
              <Text
                mt={{
                  base: 3,
                  sm: 5,
                  md: 5,
                }}
                fontSize={{
                  sm: "lg",
                  md: "xl",
                }}
                maxW={{
                  sm: "xl",
                }}
                mx={{
                  sm: "auto",
                  lg: 0,
                }}
                color="gray.500"
              >
                Lawful re-invents collaboration tooling allowing your
                organization to move <strong>fast</strong>, spend{" "}
                <strong>less</strong> and get more things <strong>done</strong>.
              </Text>
              <Box
                gap={3}
                mt={{
                  base: 5,
                  sm: 8,
                }}
                display={{
                  sm: "flex",
                }}
                justifyContent={{
                  sm: "center",
                  lg: "start",
                }}
                fontWeight="extrabold"
              >
                <Button as={Link} to="/signup" variant="solid" size="lg">
                  Sign up
                </Button>
                <Button as={Link} to="/signin" variant="outline" size="lg">
                  Sign in
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        position={{
          lg: "absolute",
        }}
        top={{
          lg: 0,
        }}
        bottom={{
          lg: 0,
        }}
        right={{
          lg: 0,
        }}
        w={{
          lg: "50%",
        }}
        border="solid 1px transparent"
      >
        <Img
          h={[56, 72, 96, "full"]}
          w="full"
          objectFit="cover"
          src="/images/illustrative/lawful-hero.avif"
          loading="lazy"
        />
      </Box>
    </Box>
  );
};

export default IndexPage;
