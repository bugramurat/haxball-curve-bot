import RTCDtlsTransport from './RTCDtlsTransport.js';
import RTCPeerConnection from './RTCPeerConnection.js';

declare class RTCSctpTransport extends EventTarget implements globalThis.RTCSctpTransport {
    #private;
    onstatechange: ((this: RTCSctpTransport, ev: Event) => any) | null;
    constructor(initial: {
        pc: RTCPeerConnection;
        extraFunctions: any;
    });
    get maxChannels(): number | null;
    get maxMessageSize(): number;
    get state(): globalThis.RTCSctpTransportState;
    get transport(): RTCDtlsTransport;
}

export { RTCSctpTransport as default };
