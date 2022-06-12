import { Button, FormLabel, Input, Select, Stack } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { getDateInputFormattedDateString } from "./getDateInputFormattedDateString";
import type { BoardState, Task } from "~/_types";

interface Props {
  defaultValues?: Partial<Task>;
  states: Array<BoardState>;
}

export const TaskForm: React.VFC<Props> = ({
  states,
  defaultValues = {
    id: "",
    dueDate: new Date(),
    name: "",
    description: "",
    stateId: null,
    asignee: null,
  },
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
        {/* //TODO: Create asignee users dropdown  */}
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
          <Button type="reset">Reset</Button>
        </Stack>
      </Stack>
    </Form>
  );
};
