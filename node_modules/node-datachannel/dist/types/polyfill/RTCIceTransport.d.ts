import RTCIceCandidate from './RTCIceCandidate.js';
import RTCPeerConnection from './RTCPeerConnection.js';

declare class RTCIceTransport extends EventTarget implements globalThis.RTCIceTransport {
    #private;
    ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onselectedcandidatepairchange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    constructor(init: {
        pc: RTCPeerConnection;
        extraFunctions: any;
    });
    get component(): globalThis.RTCIceComponent;
    get gatheringState(): globalThis.RTCIceGatheringState;
    get role(): string;
    get state(): globalThis.RTCIceTransportState;
    getLocalCandidates(): RTCIceCandidate[];
    getLocalParameters(): any;
    getRemoteCandidates(): RTCIceCandidate[];
    getRemoteParameters(): any;
    getSelectedCandidatePair(): globalThis.RTCIceCandidatePair | null;
}

export { RTCIceTransport as default };
