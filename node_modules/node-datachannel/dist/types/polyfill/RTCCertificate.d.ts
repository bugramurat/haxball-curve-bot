declare class RTCCertificate implements globalThis.RTCCertificate {
    #private;
    constructor();
    get expires(): number;
    getFingerprints(): globalThis.RTCDtlsFingerprint[];
}

export { RTCCertificate as default };
