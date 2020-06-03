import { promises as fs, constants, createReadStream } from "fs";
import rollup from "./rollup.mjs";

const PROJECT_ROOT = new URL("..", import.meta.url);

const requestListener = async (req, res) => {
  let fileURL = new URL(
    req.url === "/" ? "index.html" : req.url.slice(1),
    PROJECT_ROOT
  );
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  } else if (req.url.endsWith(".wasm")) {
    res.setHeader("Content-Type", "application/wasm");
    fileURL = new URL(
      "node_modules/@aduh95/toml/web/toml2js_bg.wasm",
      PROJECT_ROOT
    );
  }

  if (req.url.endsWith(".worker.js")) {
    rollup(fileURL)
      .then(({ output }) => {
        const [{ code, map }] = output;
        res.write(code);

        // Appends Source map to help debugging
        delete map.sourcesContent;
        res.write("\n//# sourceMappingURL=data:application/json,");
        res.end(encodeURI(JSON.stringify(map)));
      })
      .catch((e) => {
        console.error(e, fileURL);
        res.statusCode = 500;
        res.end(`Error while loading '${req.url}' on this server.`);
      });
  } else {
    fs.access(fileURL, constants.R_OK)
      .then(() => {
        createReadStream(fileURL).pipe(res);
      })
      .catch((e) => {
        console.error(e, fileURL);
        res.statusCode = 404;
        res.end(`Cannot find '${req.url}' on this server.`);
      });
  }
};

const PORT_NUMBER = 8080;
export const startServer = () =>
  Promise.all([import("http")])
    .then((_) => _.map((module) => module.default))
    .then(([{ createServer }]) => {
      const server = createServer(requestListener).listen(
        PORT_NUMBER,
        "localhost",
        () => {
          console.log(`Server started on http://localhost:${PORT_NUMBER}`);
        }
      );

      //   new Server({ server }).on("connection", (connection) => {
      //     connections.add(connection);

      //     connection.ping(1);
      //   });

      return () =>
        new Promise((done) => {
          for (const connection of connections) {
            connection.terminate();
          }
          server.unref().close(done);
        });
    });

startServer();
