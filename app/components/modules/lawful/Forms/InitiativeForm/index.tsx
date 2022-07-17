import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { Editor } from "~/components/ui";
import { Initiative } from "~/_types";

interface Props {
  defaultValues?: Partial<Initiative>;
}

export const InitiativeForm: React.VFC<Props> = ({
  defaultValues = {
    content: `{"_nodeMap":[["root",{"__children":["5"],"__dir":null,"__format":0,"__indent":0,"__key":"root","__parent":null,"__type":"root"}],["5",{"__type":"paragraph","__parent":"root","__key":"5","__children":[],"__format":0,"__indent":0,"__dir":null}]],"_selection":{"anchor":{"key":"5","offset":0,"type":"element"},"focus":{"key":"5","offset":0,"type":"element"},"type":"range"}}`,
    description: "",
    dueDate: new Date(),
    title: "",
  },
}) => {
  return (
    <VStack
      as={Form}
      method="post"
      maxW="container.md"
      spacing={3}
      align="start"
    >
      <FormControl>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input id="title" type="text" defaultValue={defaultValues.title} />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Input
          id="description"
          type="text"
          defaultValue={defaultValues.description}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="dueDate">Due date</FormLabel>
        <Input
          id="dueDate"
          type="date"
          defaultValue={defaultValues.dueDate?.toString()}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="dueDate">Content</FormLabel>
        <Editor
          inputMeta={{
            name: "content",
            id: "content",
          }}
          initialState={defaultValues.content}
        />
        <FormHelperText>
          💡 Remember you can use markdown-like syntax for writing the
          initiative's content!
        </FormHelperText>
      </FormControl>
      <Button type="submit">
        <HStack>
          <AddIcon />
          <Text>Submit</Text>
        </HStack>
      </Button>
    </VStack>
  );
};
