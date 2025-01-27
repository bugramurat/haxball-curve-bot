interface Channel {
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Uint8Array): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer | ArrayBuffer) => void): void;
}
interface WebSocketServerConfiguration {
    port?: number;
    enableTls?: boolean;
    certificatePemFile?: string;
    keyPemFile?: string;
    keyPemPass?: string;
    bindAddress?: string;
    connectionTimeout?: number;
    maxMessageSize?: number;
}
type LogLevel = 'Verbose' | 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal';
interface SctpSettings {
    recvBufferSize?: number;
    sendBufferSize?: number;
    maxChunksOnQueue?: number;
    initialCongestionWindow?: number;
    congestionControlModule?: number;
    delayedSackTime?: number;
}
type ProxyServerType = 'Socks5' | 'Http';
interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: number;
    username?: string;
    password?: string;
}
declare const enum RelayType {
    TurnUdp = "TurnUdp",
    TurnTcp = "TurnTcp",
    TurnTls = "TurnTls"
}
interface IceServer {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}
type TransportPolicy = 'all' | 'relay';
interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    bindAddress?: string;
    enableIceTcp?: boolean;
    enableIceUdpMux?: boolean;
    disableAutoNegotiation?: boolean;
    forceMediaTransport?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    mtu?: number;
    iceTransportPolicy?: TransportPolicy;
    disableFingerprintVerification?: boolean;
}
declare enum DescriptionType {
    Unspec = "unspec",
    Offer = "offer",
    Answer = "answer",
    Pranswer = "pranswer",
    Rollback = "rollback"
}
type RTCSdpType = 'answer' | 'offer' | 'pranswer' | 'rollback';
type RTCIceTransportState = "checking" | "closed" | "completed" | "connected" | "disconnected" | "failed" | "new";
type RTCPeerConnectionState = "closed" | "connected" | "connecting" | "disconnected" | "failed" | "new";
type RTCIceConnectionState = "checking" | "closed" | "completed" | "connected" | "disconnected" | "failed" | "new";
type RTCIceGathererState = "complete" | "gathering" | "new";
type RTCIceGatheringState = "complete" | "gathering" | "new";
type RTCSignalingState = "closed" | "have-local-offer" | "have-local-pranswer" | "have-remote-offer" | "have-remote-pranswer" | "stable";
interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    unordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
}
interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
    candidate: string;
    mid: string;
    priority: number;
}
declare const enum Direction {
    SendOnly = "SendOnly",
    RecvOnly = "RecvOnly",
    SendRecv = "SendRecv",
    Inactive = "Inactive",
    Unknown = "Unknown"
}

export { type Channel, type DataChannelInitConfig, DescriptionType, Direction, type IceServer, type LogLevel, type ProxyServer, type ProxyServerType, type RTCIceConnectionState, type RTCIceGathererState, type RTCIceGatheringState, type RTCIceTransportState, type RTCPeerConnectionState, type RTCSdpType, type RTCSignalingState, RelayType, type RtcConfig, type SctpSettings, type SelectedCandidateInfo, type TransportPolicy, type WebSocketServerConfiguration };
