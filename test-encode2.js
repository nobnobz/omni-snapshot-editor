"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_utils_1 = require("./src/lib/config-utils");
var current = { hide_spoilers: true, hide_external_playback_prompt: false, mdblist_enabled_ratings: ["tomatoes"] };
var original = {};
var disabled = new Set();
var res = (0, config_utils_1.encodeConfig)(current, original, disabled);
console.log(JSON.stringify(res, null, 2));
