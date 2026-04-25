// Web-API polyfills for jsdom that have to load before modules under test.
const { TextEncoder, TextDecoder } = require('node:util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

// next/server reaches for fetch-spec globals (Request/Response/Headers) at
// import time; jsdom doesn't provide them, so reuse Node 18+'s undici-backed
// implementations exposed on globalThis.
if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  global.Request = globalThis.Request;
  global.Response = globalThis.Response;
  global.Headers = globalThis.Headers;
  global.fetch = globalThis.fetch;
}
