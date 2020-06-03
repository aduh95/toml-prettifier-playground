let worker;
const solvePromises = [];
const rejectPromises = [];
let idCounter = 0;

function reject(reason) {
  for (const reject of rejectPromises) {
    reject(reason);
  }
  worker = null;
}

function getWorker() {
  if (!worker) {
    worker = new Worker("./prettify.worker.js");
    worker.onmessage = (event) => {
      const { id, value } = event.data;
      solvePromises[id]?.(value);
    };
    worker.onerror = reject;
    worker.onmessageerror = reject;
  }
  return worker;
}

export default async function* prettify() {
  const worker = new Worker("./prettify.worker.js", { type: "module" });
  let keepOn = true;
  let line;

  line = yield () => {
    keepOn = false;
  };

  while (keepOn) {
    worker.postMessage(line);
    line = yield await new Promise((resolve, reject) => {
      worker.onmessage = resolve;
      worker.onerror = reject;
      worker.onmessageerror = reject;
    });
  }
  return worker.terminate();
}
