
// -- Shims --
import cjsUrl from 'node:url';
import cjsPath from 'node:path';
import cjsModule from 'node:module';
const __filename = cjsUrl.fileURLToPath(import.meta.url);
const __dirname = cjsPath.dirname(__filename);
const require = cjsModule.createRequire(import.meta.url);
let nodeDataChannel = require("../../../build/Release/node_datachannel.node");

export { nodeDataChannel as default };
//# sourceMappingURL=node-datachannel.mjs.map
