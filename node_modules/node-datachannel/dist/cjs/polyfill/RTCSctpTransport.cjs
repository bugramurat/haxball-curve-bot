'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var RTCDtlsTransport = require('./RTCDtlsTransport.cjs');

var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _pc, _extraFunctions, _transport;
class RTCSctpTransport extends EventTarget {
  constructor(initial) {
    super();
    __privateAdd(this, _pc, null);
    __privateAdd(this, _extraFunctions, null);
    __privateAdd(this, _transport, null);
    __publicField(this, "onstatechange", null);
    __privateSet(this, _pc, initial.pc);
    __privateSet(this, _extraFunctions, initial.extraFunctions);
    __privateSet(this, _transport, new RTCDtlsTransport.default({ pc: initial.pc, extraFunctions: initial.extraFunctions }));
    __privateGet(this, _pc).addEventListener("connectionstatechange", () => {
      this.dispatchEvent(new Event("statechange"));
    });
    this.addEventListener("statechange", (e) => {
      if (this.onstatechange) this.onstatechange(e);
    });
  }
  get maxChannels() {
    if (this.state !== "connected") return null;
    return __privateGet(this, _pc) ? __privateGet(this, _extraFunctions).maxDataChannelId() : 0;
  }
  get maxMessageSize() {
    if (this.state !== "connected") return null;
    return __privateGet(this, _pc) ? __privateGet(this, _extraFunctions).maxMessageSize() : 0;
  }
  get state() {
    let state = __privateGet(this, _pc).connectionState;
    if (state === "new" || state === "connecting") {
      state = "connecting";
    } else if (state === "disconnected" || state === "failed" || state === "closed") {
      state = "closed";
    }
    return state;
  }
  get transport() {
    return __privateGet(this, _transport);
  }
}
_pc = new WeakMap();
_extraFunctions = new WeakMap();
_transport = new WeakMap();

exports.default = RTCSctpTransport;
//# sourceMappingURL=RTCSctpTransport.cjs.map
