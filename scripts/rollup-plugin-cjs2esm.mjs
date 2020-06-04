/**
 * Converts highlight.js CJS modules to ESM as they have only a default export.
 */
export default function plugin() {
  return {
    name: "cjs2esm",
    resolveId(source) {
      // This signals that rollup should not ask other plugins or check the file
      // system to find this id.
      return source.includes("highlight.js") ? source : null;
    },
    transform(code, id) {
      if (id.includes("highlight.js")) {
        code = code.replace("module.exports =", "export default");
      }
      return {
        code,
        map: null,
      };
    },
  };
}
