import TOMLPrettifier from "@aduh95/toml-prettifier";
import initTOML from "@aduh95/toml";

const waitingMessages = [];
function waitForInit(event) {
  waitingMessages.push(event.data);
}
addEventListener("message", waitForInit);
async function* getUserInput() {
  const stream = new ReadableStream({
    start(controller) {
      self.addEventListener("message", (event) =>
        controller.enqueue(event.data)
      );
      self.removeEventListener("message", waitingMessages);
      for (const message of waitingMessages) {
        controller.enqueue(message);
      }
    },
  }).getReader();
  while (true) {
    const { done, value } = await stream.read();
    if (done) return;
    yield value;
  }
}

const userInput = getUserInput();
initTOML()
  .then(async () => {
    for await (const line of TOMLPrettifier(userInput)) {
      postMessage(line);
    }

    close();
  })
  .catch((e) => {
    console.error(e);
    close();
  });
