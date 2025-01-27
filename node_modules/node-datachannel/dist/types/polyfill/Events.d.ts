import RTCDataChannel from './RTCDataChannel.js';
import RTCIceCandidate from './RTCIceCandidate.js';

declare class RTCPeerConnectionIceEvent extends Event implements globalThis.RTCPeerConnectionIceEvent {
    #private;
    constructor(candidate: RTCIceCandidate);
    get candidate(): RTCIceCandidate;
}
declare class RTCDataChannelEvent extends Event implements globalThis.RTCDataChannelEvent {
    #private;
    constructor(type: string, eventInitDict: globalThis.RTCDataChannelEventInit);
    get channel(): RTCDataChannel;
}

export { RTCDataChannelEvent, RTCPeerConnectionIceEvent };
