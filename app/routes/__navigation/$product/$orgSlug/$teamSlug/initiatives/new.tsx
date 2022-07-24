import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  HStack,
} from "@chakra-ui/react";
import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useState } from "react";
import { InitiativeForm } from "~/components/modules/lawful/";
import {
  editorLinks,
  CustomCatchBoundary,
  CustomErrorBoundary,
} from "~/components/ui";
import { createInitiative } from "~/models";
import type { Option } from "~/_types";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const content = formData.get("content") ?? "";
  const title = formData.get("title") ?? "";
  const description = formData.get("description") ?? "";
  const dueDate = formData.get("dueDate") ?? "";

  const options: Array<Omit<Option, "id" | "created_at">> = Object.entries(
    Object.fromEntries(formData)
  )
    .filter(([key]) => key.includes("option"))
    .map(([, value]) => ({
      content: value as string,
    }));

  if (
    typeof content !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof dueDate !== "string"
  ) {
    throw new Response("Form not submitted correcty", { status: 400 });
  }

  const { error } = await createInitiative({
    initiativeData: {
      content,
      title,
      description,
      dueDate,
    },
    options,
  });

  if (error) {
    throw new Error(error);
  }

  const { pathname, origin } = new URL(request.url);

  const initiativesPath = pathname.split("/").slice(0, -1).join("/");

  return redirect(`${origin}${initiativesPath}`);
};

export const links: LinksFunction = () => {
  return [...editorLinks()];
};

const InitiativesNewRoute = () => {
  const [options, setOptions] = useState<
    Array<{ id: number; content: string }>
  >([
    {
      id: 0,
      content: "Yes",
    },
    {
      id: 1,
      content: "No",
    },
  ]);

  return (
    <InitiativeForm>
      <>
        <Heading>Options</Heading>
        {options.map(({ id, content }, index) => {
          return (
            <HStack key={id}>
              <Editable defaultValue={content}>
                <EditablePreview />
                <EditableInput
                  name={`option-${index}`}
                  defaultValue={content ?? "New option"}
                />
              </Editable>
              {options.length !== 1 ? (
                <DeleteIcon
                  onClick={() => {
                    setOptions((previousState) =>
                      previousState.filter((item) => item.id !== id)
                    );
                  }}
                >
                  Delete
                </DeleteIcon>
              ) : null}
              {index === options.length - 1 ? (
                <AddIcon
                  onClick={() => {
                    setOptions((previousState) => [
                      ...previousState,
                      {
                        id: previousState[previousState.length - 1].id + 1,
                        content: "New option",
                      },
                    ]);
                  }}
                >
                  Add a new option
                </AddIcon>
              ) : null}
            </HStack>
          );
        })}
      </>
    </InitiativeForm>
  );
};

export default InitiativesNewRoute;

export const ErrorBoundary = CustomErrorBoundary;

export const CatchBoundary = CustomCatchBoundary;
