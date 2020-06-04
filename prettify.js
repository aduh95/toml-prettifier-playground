export default function prettifyStream() {
  return new TransformStream({
    start(controller) {
      this.worker = new Worker("./prettify.worker.js", { type: "module" });
      this.worker.onmessage = (message) => {
        controller.enqueue(message.data);
      };
      this.worker.onerror = (reason) => {
        controller.error(reason);
      };
      this.worker.onmessageerror = this.worker.onerror;
    },
    transform(chunk) {
      this.worker.postMessage(chunk);
    },
    flush() {
      this.worker.terminate();
    },
  });
}
