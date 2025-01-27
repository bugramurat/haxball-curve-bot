declare class RTCSessionDescription implements globalThis.RTCSessionDescriptionInit {
    #private;
    constructor(init: globalThis.RTCSessionDescriptionInit);
    get type(): globalThis.RTCSdpType;
    get sdp(): string;
    toJSON(): globalThis.RTCSessionDescriptionInit;
}

export { RTCSessionDescription as default };
