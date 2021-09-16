import { parse as parseArgs } from "https://deno.land/std@0.107.0/flags/mod.ts";
import { parse as parseIni } from "https://deno.land/x/ini@v2.1.0/mod.ts";

function die(msg: string, exit = 1) {
  console.error(msg);
  Deno.exit(exit);
}

// Parse args
const homeDir = Deno.env.get("HOME") || Deno.env.get("USERPROFILE");
const configDefaultLocation = `${homeDir}/.urlswitcher.ini`;
const parseOpts = {
  "default": { "config": configDefaultLocation, "verbose": false },
  "boolean": ["help", "verbose"],
  "alias": { "c": "config", "h": "help", "v": "verbose" },
};
const ARGS = parseArgs(Deno.args, parseOpts);
const VERBOSE = ARGS.verbose;
//VERBOSE && console.dir(ARGS);
if (ARGS.help) die("Usage: urlswitcher [--config CONFIG.INI] [--help] URL");

// Parse argument URL
const targetUrl = <string> ARGS._[0];

// Get and parse config
const configFile = Deno.readTextFileSync(ARGS.config);
const config = parseIni(configFile);
//VERBOSE && console.dir(config);

// Sanity check config
const defaultBrowser = config.default && config.default.browser;
if (!defaultBrowser || !config[defaultBrowser]) {
  die(`Error: No default specified or default refers to unknown browser`);
}

// Match URL against config
// If it is regexp(SOMETHING), treat as regex, other treat as plain character regex
const regexRegex = /^regexp\((.*)\)/gi;
const regexify = (s: string): RegExp | string => {
  const r = regexRegex.exec(s);
  return (r ? new RegExp(r[1]) : s);
};
const matched = new Set();
for (const browser in config) {
  if (browser == "default") continue;
  VERBOSE && console.log(`Testing for ${browser}`);
  if (!config[browser].command) {
    die(`Error: Browser has no command param: '${browser}`);
  }

  let localmatch = false;

  const regexMatches = (config[browser].match || []).map(regexify);
  //VERBOSE && console.dir(regexMatches);
  regexMatches.forEach((p: RegExp | string) => {
    console.debug(` Testing match ${p}`);
    if ((p instanceof RegExp) ? p.test(targetUrl) : targetUrl.includes(p)) {
      console.debug(`  PROVISIONAL MATCH: ${p}`);
      localmatch = true;
    }
  });
  if (!localmatch) continue;

  const regexIgnores = (config[browser].ignore || []).map(regexify);
  //VERBOSE && console.dir(regexIgnores);
  regexIgnores.forEach((p: RegExp | string) => {
    console.debug(` Testing ignore ${p}`);
    if ((p instanceof RegExp) ? p.test(targetUrl) : targetUrl.includes(p)) {
      console.debug(`  IGNORE MATCH: ${p}`);
      localmatch = false;
    }
  });
  if (!localmatch) continue;

  VERBOSE && console.log(` Adding for ${browser}`);
  matched.has(browser) || matched.add(browser);
}

// Set which browser we're using
VERBOSE && console.log(`Matched set size: ${matched.size}`);
let browser = null;
if (matched.size == 0) {
  VERBOSE && console.log(`No matches, using default browser ${defaultBrowser}`);
  browser = defaultBrowser;
} else {
  if (matched.size > 1) {
    const browserList = Array.from(matched.entries()).join(",");
    console.warn(
      `Warning: Multiple browsers matched, using first (${browserList})`,
    );
  }
  browser = matched.keys().next().value;
}

// Start that browser with the target URL
console.debug(browser);
const commandAry = [config[browser].command];
config[browser].args && commandAry.push(config[browser].args);
commandAry.push(targetUrl);
console.debug(commandAry);
const r = Deno.run({ cmd: commandAry });
console.dir(await r.status());
console.log(`Started ${browser} with command ${commandAry.join(" ")}`);
r.close();
