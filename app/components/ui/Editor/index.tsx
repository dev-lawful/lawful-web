import { Button } from "@chakra-ui/react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
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
import { Form } from "@remix-run/react";
import type { EditorState } from "lexical";
import { useRef, forwardRef } from "react";
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
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

//Not sure why i need a ref here, https://remix.run/docs/en/v1/guides/styling#shared-component-styles
const EditorComponent = ({
  initialState,
  ref,
}: {
  initialState?: string;
  ref?: any;
}) => {
  const editorStateRef = useRef<EditorState | undefined>();

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <LexicalRichTextPlugin
            initialEditorState={initialState}
            contentEditable={
              <LexicalContentEditable className="editor-input" />
            }
            placeholder={<Placeholder />}
          />
          <LexicalOnChangePlugin
            onChange={(editorState) => (editorStateRef.current = editorState)}
          />
          <Form method="post">
            <input
              type="hidden"
              name="data"
              value={JSON.stringify(editorStateRef.current?.toJSON() || "")}
            />
            <Button
              onClick={() => {
                if (editorStateRef.current) {
                  // console.log(JSON.stringify(editorStateRef.current.toJSON()));
                }
              }}
              type="submit"
            >
              Save
            </Button>
          </Form>
          <LexicalAutoFocusPlugin />
          <CodeHighlightPlugin />
          <LexicalListPlugin />
          <LexicalLinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          {/* TODO: fix ts error */}
          <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
};

//Not sure why i need a ref here, https://remix.run/docs/en/v1/guides/styling#shared-component-styles
// TODO: add ts to Editor component
export const Editor = forwardRef(({ children, ...props }, ref) => {
  return <EditorComponent {...props} ref={ref} />;
});
export default Editor;
Editor.displayName = "Editor";
