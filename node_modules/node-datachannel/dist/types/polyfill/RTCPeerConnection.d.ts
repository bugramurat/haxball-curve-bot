import RTCSessionDescription from './RTCSessionDescription.js';
import RTCDataChannel from './RTCDataChannel.js';
import RTCIceCandidate from './RTCIceCandidate.js';
import { RTCDataChannelEvent, RTCPeerConnectionIceEvent } from './Events.js';
import RTCSctpTransport from './RTCSctpTransport.js';
import RTCCertificate from './RTCCertificate.js';

interface RTCConfiguration extends globalThis.RTCConfiguration {
    peerIdentity?: string;
}
declare class RTCPeerConnection extends EventTarget implements globalThis.RTCPeerConnection {
    #private;
    static generateCertificate(): Promise<RTCCertificate>;
    onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    ondatachannel: ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any) | null;
    onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null;
    onicecandidateerror: ((this: RTCPeerConnection, ev: Event) => any) | null;
    oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onicegatheringstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onsignalingstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    ontrack: ((this: RTCPeerConnection, ev: globalThis.RTCTrackEvent) => any) | null;
    private _checkConfiguration;
    setConfiguration(config: RTCConfiguration): void;
    constructor(config?: RTCConfiguration);
    get canTrickleIceCandidates(): boolean | null;
    get connectionState(): globalThis.RTCPeerConnectionState;
    get iceConnectionState(): globalThis.RTCIceConnectionState;
    get iceGatheringState(): globalThis.RTCIceGatheringState;
    get currentLocalDescription(): RTCSessionDescription;
    get currentRemoteDescription(): RTCSessionDescription;
    get localDescription(): RTCSessionDescription;
    get pendingLocalDescription(): RTCSessionDescription;
    get pendingRemoteDescription(): RTCSessionDescription;
    get remoteDescription(): RTCSessionDescription;
    get sctp(): RTCSctpTransport;
    get signalingState(): globalThis.RTCSignalingState;
    addIceCandidate(candidate?: globalThis.RTCIceCandidateInit | RTCIceCandidate): Promise<void>;
    addTrack(_track: any, ..._streams: any[]): globalThis.RTCRtpSender;
    addTransceiver(_trackOrKind: any, _init: any): globalThis.RTCRtpTransceiver;
    close(): void;
    createAnswer(): Promise<globalThis.RTCSessionDescriptionInit | any>;
    createDataChannel(label: any, opts?: {}): RTCDataChannel;
    createOffer(): Promise<globalThis.RTCSessionDescriptionInit | any>;
    getConfiguration(): globalThis.RTCConfiguration;
    getReceivers(): globalThis.RTCRtpReceiver[];
    getSenders(): globalThis.RTCRtpSender[];
    getStats(): Promise<globalThis.RTCStatsReport>;
    getTransceivers(): globalThis.RTCRtpTransceiver[];
    removeTrack(): void;
    restartIce(): Promise<void>;
    setLocalDescription(description: globalThis.RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: globalThis.RTCSessionDescriptionInit): Promise<void>;
}

export { RTCPeerConnection as default };
