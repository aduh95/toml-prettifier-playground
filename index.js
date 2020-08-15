import prettify from "./prettify.js";

const TEMP_SAVED_DATA = "savedData";

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

function saveAndReload() {
  location.reload();
}

new ReadableStream({
  start(controller) {
    const input = document.createElement("textarea");
    input.autofocus = true;
    input.addEventListener("input", (event) =>
      controller.desiredSize
        ? controller.enqueue(event)
        : sessionStorage.setItem(TEMP_SAVED_DATA, event.target.value)
    );
    input.value = sessionStorage.getItem(TEMP_SAVED_DATA);
    document.body.append(input);
  },
  cancel() {
    const dialog = document.createElement("dialog");
    const form = document.createElement("form");
    const button = document.createElement("button");

    form.method = "dialog";

    button.type = "submit";
    button.textContent = "Prettify";

    form.append(button);
    dialog.append(form);

    dialog.addEventListener("close", saveAndReload);
    dialog.open = true;

    document.body.append(dialog);
  },
})
  .pipeThrough(
    new TransformStream({
      start(controller) {
        const savedData = sessionStorage.getItem(TEMP_SAVED_DATA);
        if (savedData) {
          savedData
            .split("\n")
            .slice(0, -1)
            .forEach((line) => controller.enqueue(line));
          sessionStorage.removeItem(TEMP_SAVED_DATA);
        }
      },
      transform(event, controller) {
        const { data, inputType, target: textarea } = event;
        console.log(event);
        if (
          textarea.selectionStart !== textarea.value.length &&
          textarea.value.substring(textarea.selectionStart).trim().length === 0
        ) {
          textarea.setSelectionRange(
            textarea.selectionStart,
            textarea.value.length
          );
        } else if (
          inputType === "insertFromPaste" ||
          textarea.selectionStart !== textarea.value.length
        ) {
          sessionStorage.setItem(TEMP_SAVED_DATA, event.target.value);
          controller.error(new Error("Input is not streamed."));
        } else if (
          inputType === "insertLineBreak" ||
          (inputType === "insertText" && data === null)
        ) {
          const { value, selectionStart } = textarea;
          controller.enqueue(
            value.substring(
              value.lastIndexOf("\n", selectionStart - 2) + 1,
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
        const tpl = document.createElement("template");
        tpl.innerHTML = chunk + "\n";
        this.output.appendChild(tpl.content);
      },
    })
  );
