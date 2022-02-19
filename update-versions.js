#!/usr/bin/env node

const { writeFileSync } = require("fs");
const { version } = require("./package.json");

require.resolve("./src/errorhandler/manifest.json");

manifest["sap.app"].applicationVersion.version = version;

writeFileSync(path, JSON.stringify(manifest, null, 2) + "\n");
