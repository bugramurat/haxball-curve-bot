'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _type, _sdp;
class RTCSessionDescription {
  constructor(init) {
    __privateAdd(this, _type);
    __privateAdd(this, _sdp);
    __privateSet(this, _type, init ? init.type : null);
    __privateSet(this, _sdp, init ? init.sdp : null);
  }
  get type() {
    return __privateGet(this, _type);
  }
  get sdp() {
    return __privateGet(this, _sdp);
  }
  toJSON() {
    return {
      sdp: __privateGet(this, _sdp),
      type: __privateGet(this, _type)
    };
  }
}
_type = new WeakMap();
_sdp = new WeakMap();

exports.default = RTCSessionDescription;
//# sourceMappingURL=RTCSessionDescription.cjs.map
