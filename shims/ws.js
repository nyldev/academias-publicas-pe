// Shim: usa o WebSocket nativo do React Native no lugar do pacote ws (Node.js)
const WS = global.WebSocket;

module.exports = WS;
module.exports.WebSocket = WS;
module.exports.default = WS;
