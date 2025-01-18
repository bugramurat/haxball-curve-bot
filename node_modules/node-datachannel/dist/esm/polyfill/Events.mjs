var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
var _candidate, _channel;
class RTCPeerConnectionIceEvent extends Event {
  constructor(candidate) {
    super("icecandidate");
    __privateAdd(this, _candidate);
    __privateSet(this, _candidate, candidate);
  }
  get candidate() {
    return __privateGet(this, _candidate);
  }
}
_candidate = new WeakMap();
class RTCDataChannelEvent extends Event {
  constructor(type, eventInitDict) {
    super(type);
    __privateAdd(this, _channel);
    if (type && !eventInitDict.channel) throw new TypeError("channel member is required");
    __privateSet(this, _channel, eventInitDict?.channel);
  }
  get channel() {
    return __privateGet(this, _channel);
  }
}
_channel = new WeakMap();

export { RTCDataChannelEvent, RTCPeerConnectionIceEvent };
//# sourceMappingURL=Events.mjs.map
