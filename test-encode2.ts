import { encodeConfig } from "./src/lib/config-utils";

const current = { hide_spoilers: true, hide_external_playback_prompt: false, mdblist_enabled_ratings: ["tomatoes"] };
const original = {};
const disabled = new Set<string>();

const res = encodeConfig(current, original, disabled);
console.log(JSON.stringify(res, null, 2));
