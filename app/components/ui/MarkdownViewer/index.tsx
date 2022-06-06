import {
  Code,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

export const MarkdownViewer: React.VFC<{ markdown: string }> = ({
  markdown,
}) => {
  return (
    <ReactMarkdown
      children={markdown}
      components={{
        h1: ({ node, level, ...props }) => (
          <Heading as="h1" size="xl" {...props} />
        ),
        h2: ({ node, level, ...props }) => (
          <Heading as="h2" size="lg" {...props} />
        ),
        code: ({ node, ...props }) => <Code {...props} />,
        p: ({ node, ...props }) => <Text {...props} />,
        ul: ({ node, depth, ordered, ...props }) => (
          <UnorderedList {...props} />
        ),
        ol: ({ node, depth, ordered, ...props }) => <OrderedList {...props} />,
        li: ({ node, index, ordered, ...props }) => <ListItem {...props} />,
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        a: ({ node, ...props }) => <Link {...props} />,
        strong: ({ node, ...props }) => <Text as="strong" {...props} />,
        em: ({ node, ...props }) => <Text as="em" {...props} />,
        // @ts-ignore
        blockquote: ({ node, ...props }) => <Text as="blockquote" {...props} />,
        br: () => <br />,
      }}
    />
  );
};
