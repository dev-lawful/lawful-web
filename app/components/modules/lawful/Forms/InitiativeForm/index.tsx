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
import type { PropsWithChildren } from "react";
import { getDateInputFormattedDateString } from "~/components/modules/utils";
import { Editor } from "~/components/ui";
import { useSupabaseClient } from "~/db";
import type { Initiative } from "~/_types";

interface Props {
  defaultValues?: Partial<Initiative>;
}

export const InitiativeForm = ({
  defaultValues = {
    content: "",
    description: "",
    dueDate: new Date().toString(),
    title: "",
  },
  children,
}: PropsWithChildren<Props>) => {
  const supabase = useSupabaseClient();
  return (
    <VStack
      as={Form}
      method="post"
      maxW="container.md"
      spacing={3}
      align="start"
    >
      <Input
        name="owner"
        id="owner"
        type="hidden"
        defaultValue={supabase.user?.id}
      />

      <FormControl isRequired>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input
          name="title"
          id="title"
          type="text"
          defaultValue={defaultValues.title}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Input
          name="description"
          id="description"
          type="text"
          defaultValue={defaultValues.description}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel htmlFor="dueDate">Due date</FormLabel>
        <Input
          name="dueDate"
          id="dueDate"
          type="datetime-local"
          defaultValue={getDateInputFormattedDateString(
            defaultValues.dueDate?.toString()!
          )}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel htmlFor="content">Content</FormLabel>
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
      {children}
      <Button type="submit">
        <HStack>
          <AddIcon />
          <Text>Submit</Text>
        </HStack>
      </Button>
    </VStack>
  );
};
