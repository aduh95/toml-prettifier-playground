import { fileURLToPath } from "url";
import resolve from "@rollup/plugin-node-resolve";
import cjs2esm from "./rollup-plugin-cjs2esm.mjs";
import { rollup } from "rollup";

let cache;
const plugins = [resolve({ browser: true }), cjs2esm()];

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
