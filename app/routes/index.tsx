import { MarkdownViewer } from "~/components/ui/MarkdownViewer";

const markdown = `
# Here is some JavaScript code:
## Sub header

~~~js
console.log('It works!')
~~~
- Hola
- Chau
`;
export default function IndexRoute() {
  return (
    <div>
      <h1>Landing Lawful</h1>
      <MarkdownViewer markdown={markdown} />
    </div>
  );
}
