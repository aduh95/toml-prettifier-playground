import prettify from "./prettify.js";

const getSelectedLine = (value, selectionStart, selectionEnd) =>
  value.substring(
    Math.max(0, value.lastIndexOf("\n", selectionStart)),
    Math.max(value.length, value.indexOf("\n", selectionEnd))
  );

const stringOpening = /((?<!\\)"""|''')/g;
const isInsideMultilineString = ({ value, selectionStart }) => {
  let crawlString;
  let currentStringDelimiter;
  let result = false;
  stringOpening.lastIndex = 0;
  value = value.substring(0, selectionStart);
  while ((crawlString = stringOpening.exec(value))) {
    if (currentStringDelimiter && currentStringDelimiter === crawlString[0]) {
      result = false;
      currentStringDelimiter = null;
    } else {
      result = stringOpening.lastIndex;
      currentStringDelimiter = crawlString[0];
    }
  }
  return [result, currentStringDelimiter];
};

const getCurrentTOMLExpression = ({ value, selectionStart }) => {
  const [multilineExpressionStartIndex, delimiter] = isInsideMultilineString({
    value,
    selectionStart,
  });
  if (multilineExpressionStartIndex) {
    const expressionEnd = value.substring(selectionStart).search(delimiter);
    return getSelectedLine(value, multilineExpressionStartIndex, expressionEnd);
  } else {
    const currentLine = getSelectedLine(value, selectionStart, selectionStart);
    if (!keyValueDeclaration.test(currentLine)) {
    }
  }
};

new ReadableStream({
  start(controller) {
    const input = document.createElement("textarea");
    input.autofocus = true;
    input.addEventListener("input", (event) => controller.enqueue(event));
    document.body.append(input);
  },
})
  .pipeThrough(
    new TransformStream({
      start() {},
      transform(event, controller) {
        const { data, inputType, target: textarea } = event;
        console.log(event);
        if (
          inputType === "insertLineBreak" ||
          (inputType === "insertText" && data === null)
        ) {
          const { value, selectionStart } = textarea;
          controller.enqueue(
            value.substring(
              Math.max(0, value.lastIndexOf("\n", selectionStart - 2)),
              value.length - 1
            )
          );
        }
      },
    })
  )
  .pipeThrough(prettify())
  .pipeTo(
    new WritableStream({
      start() {
        this.output = document.createElement("output");
        document.body.append(this.output);
      },
      write(chunk) {
        this.output.innerHTML += chunk + "\n";
      },
    })
  );
