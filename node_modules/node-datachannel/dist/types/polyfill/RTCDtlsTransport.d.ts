import RTCIceTransport from './RTCIceTransport.js';
import RTCPeerConnection from './RTCPeerConnection.js';

declare class RTCDtlsTransport extends EventTarget implements globalThis.RTCDtlsTransport {
    #private;
    onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    onerror: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    constructor(init: {
        pc: RTCPeerConnection;
        extraFunctions: any;
    });
    get iceTransport(): RTCIceTransport;
    get state(): RTCDtlsTransportState;
    getRemoteCertificates(): ArrayBuffer[];
}

export { RTCDtlsTransport as default };
