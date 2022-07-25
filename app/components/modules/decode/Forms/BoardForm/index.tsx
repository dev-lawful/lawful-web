import { Button, FormLabel, Input, Stack } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import type { Board } from "~/_types";

interface Props {
  defaultValues?: Partial<Board>;
}

export const BoardForm = ({
  defaultValues = {
    name: "",
  },
}: Props) => {
  return (
    <Form method="post">
      <Stack spacing={4}>
        {defaultValues["teamId"] ? (
          <Input type="hidden" name="teamId" value={defaultValues["teamId"]} />
        ) : null}
        {defaultValues["id"] ? (
          <Input type="hidden" name="id" value={defaultValues["id"]} />
        ) : null}
        <FormLabel htmlFor="name">
          Name
          <Input
            required
            placeholder="Some name"
            type="text"
            name="name"
            id="name"
            defaultValue={defaultValues["name"]}
          />
        </FormLabel>
        <Stack direction="row">
          <Button type="submit">Submit</Button>
          <Button variant="outline" type="reset">
            Reset
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
};
