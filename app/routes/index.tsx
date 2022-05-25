import { Heading } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

const markdown = `# Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`;

export default function IndexRoute() {
  return (
    <div>
      <h1>Landing Lawful</h1>
      <ReactMarkdown
        children={markdown}
        components={{
          h1: (props) => <Heading as="h1" size="xl" {...props} />,
        }}
      />
    </div>
  );
}
