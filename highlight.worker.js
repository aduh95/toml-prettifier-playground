import hljs from "highlight.js/lib/core.js";
import toml from "highlight.js/lib/languages/ini.js";

const TOML = "toml";
hljs.registerLanguage(TOML, toml);

onmessage = (event) => {
  const { id, code } = event.data;
  const { value } = hljs.highlight(TOML, code);
  postMessage({ id, value });
};
