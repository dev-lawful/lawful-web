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
import { getDateInputFormattedDateString } from "~/components/modules/decode/Forms/TaskForm/getDateInputFormattedDateString";
import { Editor } from "~/components/ui";
import type { Initiative } from "~/_types";

interface Props {
  defaultValues?: Partial<Initiative>;
}

export const InitiativeForm: React.VFC<Props> = ({
  defaultValues = {
    content: ``,
    description: "",
    dueDate: new Date(),
    title: "",
  },
}) => {
  const formattedDueDate = getDateInputFormattedDateString(
    defaultValues.dueDate?.toString()!
  );
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
        <Input
          name="title"
          id="title"
          type="text"
          defaultValue={defaultValues.title}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Input
          name="description"
          id="description"
          type="text"
          defaultValue={defaultValues.description}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="dueDate">Due date</FormLabel>
        <Input
          name="dueDate"
          id="dueDate"
          type="datetime-local"
          defaultValue={formattedDueDate}
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
