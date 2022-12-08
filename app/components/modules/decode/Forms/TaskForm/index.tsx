import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { getDateInputFormattedDateString } from "~/components/modules/utils";
import type { BoardState, Profile, Task } from "~/_types";

interface Props {
  defaultValues?: Partial<Task>;
  states: Array<BoardState>;
  profiles: Array<Profile>;
}

export const TaskForm = ({
  states,
  profiles,
  defaultValues = {
    id: 0,
    dueDate: new Date().toISOString().toLocaleString(),
    name: "",
    description: "",
    stateId: undefined,
    asignee: undefined,
  },
}: Props) => {
  return (
    <Form method="post">
      <Stack spacing={4}>
        {defaultValues["id"] ? (
          <Input type="hidden" name="id" value={defaultValues["id"]} />
        ) : null}

        <FormControl isRequired>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            name="name"
            placeholder="Some name"
            id="name"
            type="text"
            defaultValue={defaultValues?.name}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Input
            name="description"
            placeholder="Some description"
            id="description"
            type="text"
            defaultValue={defaultValues?.description}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="dueDate">Due date</FormLabel>
          <Input
            required
            type="datetime-local"
            name="dueDate"
            id="dueDate"
            defaultValue={getDateInputFormattedDateString(
              defaultValues.dueDate?.toString()!
            )}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="asignee">Asignee</FormLabel>
          <Select
            isRequired
            placeholder="Select an asignee"
            name="asignee"
            id="asignee"
            defaultValue={defaultValues?.asignee ?? profiles[0]?.id}
          >
            {profiles.map(({ id, lastName, firstName }) => {
              return (
                <option key={id} value={id}>
                  {firstName} {lastName}
                </option>
              );
            })}
          </Select>
        </FormControl>

        <Input required type="hidden" name="asignee" id="asignee" />
        <FormControl isRequired>
          <FormLabel htmlFor="stateId">Initial state</FormLabel>
          <Select
            name="stateId"
            id="stateId"
            placeholder="Select the task's state"
            defaultValue={defaultValues.stateId?.toString() ?? states[0]?.id}
          >
            {states.map((state) => {
              return (
                <option value={state.id} key={state.id}>
                  {state.description}
                </option>
              );
            })}
          </Select>
        </FormControl>

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
