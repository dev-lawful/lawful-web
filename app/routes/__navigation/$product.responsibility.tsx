import {
  AspectRatio,
  Badge,
  Box, Container,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  VStack
} from "@chakra-ui/react";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { FaTwitter, FaYoutube } from "react-icons/fa";

interface RseData {
  [product: string]: {
    illustrativeImageHref: string;
    socialLinks: {
      twitter: string;
      youtube: {
        channel: string;
        videoEmbedId: string;
      };
    };
  };
}

export const loader = () => {
  const res: RseData = {
    decode: {
      illustrativeImageHref:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80",
      socialLinks: {
        twitter: "https://twitter.com/DevDecode",
        youtube: {
          channel: "https://www.youtube.com/@decode.tfi.2022",
          videoEmbedId: "6S4t4VlkLi8",
        },
      },
    },
    network: {
      illustrativeImageHref:
        "https://images.unsplash.com/photo-1554200876-56c2f25224fa?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      socialLinks: {
        twitter: "https://twitter.com/DevNetwork2",
        youtube: {
          channel: "https://www.youtube.com/@network.tfi.2022",
          videoEmbedId: "v5KCYzO4e5Q",
        },
      },
    },
  } as const;

  return json<typeof res>(res);
};

const ResponsibilityPage = () => {
  const { product } = useParams();
  const resources = useLoaderData<typeof loader>();

  return (
    <Container maxW={"5xl"} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stack spacing={4}>
          <Text
            textTransform={"uppercase"}
            color={`${product}.400`}
            fontWeight={600}
            fontSize={"sm"}
            bg={useColorModeValue(`${product}.50`, `${product}.900`)}
            p={2}
            alignSelf={"flex-start"}
            rounded={"md"}
          >
            {product === "decode"
              ? "Decode | "
              : product === "network"
              ? "Network | "
              : ""}
            Responsabilidad Social Empresarial
          </Text>
          <Heading>Nuestro compromiso social con la comunidad</Heading>
          <Text color={"gray.500"} fontSize={"lg"}>
            {product === "decode"
              ? "Una app, muchas herramientas de gestión colaborativa."
              : product === "network"
              ? "Trabajar en red, es trabajar inteligente."
              : ""}
          </Text>
          <Stack
            spacing={4}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.100", "gray.700")}
              />
            }
          >
            <Text>
              {product === "decode" ? (
                <VStack>
                  <Text>
                    Desde Decode consideramos al trabajo colaborativo y a la
                    programación como habilidades esenciales para cualquier
                    trabajador del Siglo 21.
                  </Text>
                  <Text>
                    Es por esto que nos comprometemos a devolver a la comunidad
                    mediante conocimiento, utilizando las herramientas que con
                    tanto esfuerzo hemos logrado fabricar.
                  </Text>
                  <Text>
                    Es por esto que planificamos realizar diversos cursos
                    presenciales para alumnos de secundarias públicas en las
                    ciudades de Rosario, Santa Fe capital y Arroyo Seco,
                    absolutamente libres y gratuitos.
                  </Text>
                  <Text>
                    Utilizando una cuenta premium de Decode podrán acceder a
                    todas nuestras características más relevantes y poder
                    aprender a crear el futuro de la programación Argentina
                    colaborando juntos.
                  </Text>
                </VStack>
              ) : product === "network" ? (
                <VStack>
                  <Text>
                    Desde Network consideramos a la comunicación
                    interdisciplinaria y al trabajo ágil en equipo como
                    habilidades claves para la era moderna de trabajo digital.
                  </Text>
                  <Text>
                    En consecuencia, sentimos que debemos retribuir a la
                    comunidad enseñando acerca del trabajo en red, utilizando el
                    software que creamos exclusivamente con este fin.
                  </Text>
                  <Text>
                    Nuestro plan es dictar seminarios virtuales de metodologías
                    ágiles y comunicación empresarial para alumnos, graduados y
                    trabajadores digitales, con foco en las ciudades de Rosario,
                    Santa Fe capital y Arroyo Seco, gratuitos y accesibles.
                  </Text>
                  <Text>
                    Se les brindará una cuenta premium de Network para acceder a
                    todas nuestras características más relevantes y poder
                    aprender a crear el futuro del trabajo colaborativo
                    argentino, juntos.
                  </Text>
                </VStack>
              ) : (
                ""
              )}
            </Text>
          </Stack>
        </Stack>
        <Flex>
          <Image
            rounded={"md"}
            alt={"feature image"}
            src={resources[product]["illustrativeImageHref"]}
            objectFit={"cover"}
          />
        </Flex>
        <Stack>
          <Heading>Redes sociales</Heading>
          <Link
            isExternal
            maxW={"max-content"}
            href={resources[product]["socialLinks"]["twitter"]}
          >
            <HStack maxW={"max-content"}>
              <FaTwitter />
              <Text>Twitter</Text>
            </HStack>
          </Link>
          <Link
            isExternal
            maxW={"max-content"}
            href={resources[product]["socialLinks"]["youtube"]["channel"]}
          >
            <HStack maxW={"max-content"}>
              <FaYoutube />
              <Text>YouTube</Text>
            </HStack>
          </Link>
        </Stack>
        <Stack>
          <Box>
            <Badge>NEW</Badge>
            <Heading>¡Mirá nuestro spot de RSE 2022!</Heading>
          </Box>
          <AspectRatio>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${resources[product]["socialLinks"]["youtube"]["videoEmbedId"]}`}
              title="Spot Responsabilidad Social Empresarial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </AspectRatio>
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default ResponsibilityPage;
