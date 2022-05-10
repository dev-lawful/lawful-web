import ExampleTheme from "./themes/ExampleTheme";
import LexicalComposer from "@lexical/react/LexicalComposer";
import LexicalRichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import LexicalContentEditable from "@lexical/react/LexicalContentEditable";
import LexicalAutoFocusPlugin from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import LexicalLinkPlugin from "@lexical/react/LexicalLinkPlugin";
import LexicalListPlugin from "@lexical/react/LexicalListPlugin";
import LexicalOnChangePlugin from "@lexical/react/LexicalOnChangePlugin";
import LexicalMarkdownShortcutPlugin from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";

// import "./styles/index.css";
import { useRef } from "react";
import { EditorState } from "lexical";
import { Button } from "@chakra-ui/react";
import { Form } from "@remix-run/react";

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

export default function Editor({ initialState }: { initialState: string }) {
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
          <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}
