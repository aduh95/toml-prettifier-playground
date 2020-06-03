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
    worker = new Worker("./highlight.worker.js");
    worker.onmessage = (event) => {
      const { id, value } = event.data;
      solvePromises[id]?.(value);
    };
    worker.onerror = reject;
    worker.onmessageerror = reject;
  }
  return worker;
}

export default function hightlight(code) {
  const id = idCounter++;
  return new Promise((resolve, reject) => {
    solvePromises[id] = resolve;
    rejectPromises[id] = reject;
    getWorker().postMessage({ id, code });
  });
}
