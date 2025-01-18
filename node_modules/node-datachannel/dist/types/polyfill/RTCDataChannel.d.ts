import { DataChannel } from '../lib/index';

declare class RTCDataChannel extends EventTarget implements globalThis.RTCDataChannel {
    #private;
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclose: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclosing: ((this: RTCDataChannel, ev: Event) => any) | null;
    onerror: ((this: RTCDataChannel, ev: Event) => any) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null;
    onopen: ((this: RTCDataChannel, ev: Event) => any) | null;
    constructor(dataChannel: DataChannel, opts?: globalThis.RTCDataChannelInit);
    set binaryType(type: BinaryType);
    get binaryType(): BinaryType;
    get bufferedAmount(): number;
    get bufferedAmountLowThreshold(): number;
    set bufferedAmountLowThreshold(value: number);
    get id(): number | null;
    get label(): string;
    get maxPacketLifeTime(): number | null;
    get maxRetransmits(): number | null;
    get negotiated(): boolean;
    get ordered(): boolean;
    get protocol(): string;
    get readyState(): globalThis.RTCDataChannelState;
    send(data: any): void;
    close(): void;
}

export { RTCDataChannel as default };
