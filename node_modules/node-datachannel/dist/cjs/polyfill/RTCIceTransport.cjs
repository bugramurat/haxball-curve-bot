'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var RTCIceCandidate = require('./RTCIceCandidate.cjs');

var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _pc, _extraFunctions;
class RTCIceTransport extends EventTarget {
  constructor(init) {
    super();
    __privateAdd(this, _pc, null);
    __privateAdd(this, _extraFunctions, null);
    __publicField(this, "ongatheringstatechange", null);
    __publicField(this, "onselectedcandidatepairchange", null);
    __publicField(this, "onstatechange", null);
    __privateSet(this, _pc, init.pc);
    __privateSet(this, _extraFunctions, init.extraFunctions);
    __privateGet(this, _pc).addEventListener("icegatheringstatechange", () => {
      this.dispatchEvent(new Event("gatheringstatechange"));
    });
    __privateGet(this, _pc).addEventListener("iceconnectionstatechange", () => {
      this.dispatchEvent(new Event("statechange"));
    });
    this.addEventListener("gatheringstatechange", (e) => {
      if (this.ongatheringstatechange) this.ongatheringstatechange(e);
    });
    this.addEventListener("statechange", (e) => {
      if (this.onstatechange) this.onstatechange(e);
    });
  }
  get component() {
    const cp = this.getSelectedCandidatePair();
    if (!cp) return null;
    return cp.local.component;
  }
  get gatheringState() {
    return __privateGet(this, _pc) ? __privateGet(this, _pc).iceGatheringState : "new";
  }
  get role() {
    return __privateGet(this, _pc).localDescription.type == "offer" ? "controlling" : "controlled";
  }
  get state() {
    return __privateGet(this, _pc) ? __privateGet(this, _pc).iceConnectionState : "new";
  }
  getLocalCandidates() {
    return __privateGet(this, _pc) ? __privateGet(this, _extraFunctions).localCandidates() : [];
  }
  getLocalParameters() {
  }
  getRemoteCandidates() {
    return __privateGet(this, _pc) ? __privateGet(this, _extraFunctions).remoteCandidates() : [];
  }
  getRemoteParameters() {
  }
  getSelectedCandidatePair() {
    const cp = __privateGet(this, _extraFunctions).selectedCandidatePair();
    if (!cp) return null;
    return {
      local: new RTCIceCandidate.default({
        candidate: cp.local.candidate,
        sdpMid: cp.local.mid
      }),
      remote: new RTCIceCandidate.default({
        candidate: cp.remote.candidate,
        sdpMid: cp.remote.mid
      })
    };
  }
}
_pc = new WeakMap();
_extraFunctions = new WeakMap();

exports.default = RTCIceTransport;
//# sourceMappingURL=RTCIceTransport.cjs.map
