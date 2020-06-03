import { fileURLToPath } from "url";
import resolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";

let cache;
const plugins = [resolve.default({ browser: true })];

async function buildWithCache(input) {
  const bundle = await rollup({
    input,
    plugins,
    cache,
  });
  cache = bundle.cache;

  return bundle;
}

export default (input) =>
  buildWithCache(fileURLToPath(input)).then((bundle) =>
    bundle.generate({ sourcemap: "hidden", format: "esm" })
  );
