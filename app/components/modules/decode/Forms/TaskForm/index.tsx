import { Button, FormLabel, Input, Select, Stack } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { getDateInputFormattedDateString } from "~/components/modules/utils";
import type { BoardState, Profile, Task } from "~/_types";

interface Props {
  defaultValues?: Partial<Task>;
  states: Array<BoardState>;
  profiles: Array<Profile>;
}

export const TaskForm: React.FC<Props> = ({
  states,
  defaultValues = {
    id: "",
    dueDate: new Date(),
    name: "",
    description: "",
    stateId: null,
    asignee: null,
  },
  profiles,
}) => {
  // Date input expects "yyyy-MM-ddThh:mm" format
  const formattedDueDate = getDateInputFormattedDateString(
    defaultValues["dueDate"]?.toString()!
  );

  return (
    <Form method="post">
      <Stack spacing={4}>
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
        <FormLabel htmlFor="description">
          Description
          <Input
            required
            type="text"
            placeholder="Some description"
            name="description"
            id="description"
            defaultValue={defaultValues["description"]}
          />
        </FormLabel>
        {/* "yyyy-MM-ddThh:mm" */}
        <FormLabel htmlFor="dueDate">
          Due date
          <Input
            required
            type="datetime-local"
            name="dueDate"
            id="dueDate"
            defaultValue={formattedDueDate}
          />
        </FormLabel>
        <FormLabel>
          Asignee
          <Select
            placeholder="Choose an asignee"
            name="asignee"
            defaultValue={defaultValues["asignee"] ?? undefined}
          >
            {profiles.map(({ id, lastName, firstName }) => {
              return (
                <option key={id} value={id}>
                  {firstName} {lastName}
                </option>
              );
            })}
          </Select>
        </FormLabel>
        <Input required type="hidden" name="asignee" id="asignee" />
        <FormLabel htmlFor="stateId">
          Initial state
          <Select
            name="stateId"
            id="stateId"
            placeholder="Select the task's state"
            defaultValue={defaultValues["stateId"]?.toString()}
          >
            {states.map((state) => {
              return (
                <option value={state.id} key={state.id}>
                  {state.description}
                </option>
              );
            })}
          </Select>
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
