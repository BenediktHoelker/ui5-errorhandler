#!/usr/bin/env node

const { writeFileSync } = require("fs");
const { version } = require("../package.json");
const manifestPath = "./src/errorhandler/manifest.json";
const argv = require("minimist")(process.argv?.slice(2));
const manifest = require(manifestPath);

if (argv.btpCloudService) {
  manifest["sap.cloud"].service = argv.btpCloudService;
}

manifest["sap.app"].applicationVersion.version = version;

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log(argv);
