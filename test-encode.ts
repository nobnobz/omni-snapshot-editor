import { encodeConfig } from "./src/lib/config-utils";

const current = { hide_spoilers: true };
const original = {};
const disabled = new Set<string>();

const res = encodeConfig(current, original, disabled);
console.log(JSON.stringify(res, null, 2));
