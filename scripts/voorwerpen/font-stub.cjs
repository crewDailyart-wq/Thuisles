module.exports = new Proxy({}, { get: (_, k) => k === "__esModule" ? true : () => ({ className: "", style: {}, variable: "" }) });
