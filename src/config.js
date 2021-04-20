/**
 * サーバ設定を保持するモジュール。
  */

import fs from 'fs';

/**
 * @typedef ServerConfig 
 * @property {String} address default: "127.0.0.1"
 * @property {Number} port default: 3000
 */

/**
 * @typedef Config
 * @property {ServerConfig} server
 */

/** @type {Config} */
let config;
try {
  config = JSON.parse(fs.readFileSync('./config.json'));
} catch (err) {
  console.error(err.toString());
  console.error(`failed to load config.json.`);
  console.error(`use default values for config.`);
  config = {
    server: {
    },
  };
}

// set default values
if (!config.server?.address) {
  config.server.address = "127.0.0.1";
}
if (!config.server.port) {
  config.server.port = 3000;
}

export default config;