import hljs from "highlight.js/lib/core.js";
import toml from "highlight.js/lib/languages/ini.js";

const TOML = "toml";
hljs.registerLanguage(TOML, toml);

export default (code) => hljs.highlight(TOML, code).value;
