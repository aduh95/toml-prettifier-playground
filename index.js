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

async function* getUserInput() {
  const input = document.createElement("textarea");
  input.autofocus = true;

  document.body.append(input);
  const stream = new ReadableStream({
    start(controller) {
      input.addEventListener("input", (event) => controller.enqueue(event));
    },
  }).getReader();
  while (true) {
    const { done, value } = await stream.read();
    if (done) return;
    yield value;
  }
}

(async () => {
  let previousSelection;
  let buffer = "";
  let prettifier, terminatePrettifier;
  const output = document.createElement("output");
  document.body.append(output);
  for await (const event of getUserInput()) {
    let { data, inputType, target: textarea } = event;
    console.log(event);
    if (inputType === "insertText" && data === null) {
      inputType = "insertLineBreak";
    }
    switch (inputType) {
      case "insertText":
        buffer += data;
        break;
      case "insertLineBreak":
        if (!prettifier) {
          prettifier = prettify();
          terminatePrettifier = (await prettifier.next()).value;
        }
        const { done, value } = await prettifier.next(buffer);
        if (done) throw new Error("cannot prettify");
        output.innerHTML += value.data + "\n";
        buffer = "";
        break;
    }
  }
})().catch(console.error);
