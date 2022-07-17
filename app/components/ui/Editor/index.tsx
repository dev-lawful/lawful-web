import { Box } from "@chakra-ui/react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import LexicalAutoFocusPlugin from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalComposer from "@lexical/react/LexicalComposer";
import LexicalContentEditable from "@lexical/react/LexicalContentEditable";
import LexicalLinkPlugin from "@lexical/react/LexicalLinkPlugin";
import LexicalListPlugin from "@lexical/react/LexicalListPlugin";
import LexicalMarkdownShortcutPlugin from "@lexical/react/LexicalMarkdownShortcutPlugin";
import LexicalOnChangePlugin from "@lexical/react/LexicalOnChangePlugin";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { LinksFunction } from "@remix-run/node";
import type { ComponentProps, FC } from "react";
import { forwardRef, useState } from "react";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import styles from "./styles/index.css";
import ExampleTheme from "./themes/ExampleTheme";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  // Handling of errors during update
  onError(error: any) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

// TODO: Add preload links for each asset
export const editorLinks: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

//Not sure why i need a ref here, https://remix.run/docs/en/v1/guides/styling#shared-component-styles
const EditorComponent = ({
  ref,
  inputMeta,
  initialState = "",
}: {
  inputMeta: { name: string; id: string };
  initialState?: string;
  ref?: any;
}) => {
  const [editorState, setEditorState] = useState(initialState);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <Box
        m="1rem"
        maxW="37.5rem"
        color="blackAlpha.900"
        position="relative"
        lineHeight="1.25rem"
        textAlign="left"
        borderTopLeftRadius="0.625"
        borderTopRightRadius="0.625"
      >
        <ToolbarPlugin />
        <Box
          bgColor="white"
          position="relative"
          borderBottomRightRadius={"10px"}
          borderBottomLeftRadius={"10px"}
          className="editor-inner"
        >
          <LexicalRichTextPlugin
            initialEditorState={() => {
              $convertFromMarkdownString(initialState, TRANSFORMERS);
            }}
            contentEditable={
              <LexicalContentEditable className="editor-input" />
            }
            placeholder={<Placeholder />}
          />
          <LexicalOnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                setEditorState($convertToMarkdownString(TRANSFORMERS));
              });
            }}
          />
          <input
            type="hidden"
            name={inputMeta.name}
            id={inputMeta.id}
            value={editorState}
          />
          <LexicalAutoFocusPlugin />
          <CodeHighlightPlugin />
          <LexicalListPlugin />
          <LexicalLinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          {/* @ts-ignore */}
          <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </Box>
      </Box>
    </LexicalComposer>
  );
};

//Not sure why i need a ref here, https://remix.run/docs/en/v1/guides/styling#shared-component-styles
export const Editor: FC<ComponentProps<typeof EditorComponent>> = forwardRef(
  ({ children, ...props }, ref) => {
    return <EditorComponent {...props} ref={ref} />;
  }
);

Editor.displayName = "Editor";
