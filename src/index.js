/**
 * サーバを起動するモジュール
 */

import app from './app.js';
import config from './config.js';

(async() => {
  try {
    const address = await app.listen(config.server.port, config.server.address);
    console.log(`game-guess-number listening on ${address}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
