import hljs from "highlight.js/lib/core.js";
import toml from "highlight.js/lib/languages/ini.js";

const TOML = "toml";
hljs.registerLanguage(TOML, toml);

let cache;
export default (code) => {
  const result = hljs.highlight(TOML, code, true, cache);
  cache = result.top;
  return result.value;
};
