interface headerByteConfig {
    FFID: number | null;
    FFID_checked: boolean;
    Inline: number | null;
    Inline_checked: boolean;
    Xline: number | null;
    Xline_checked: boolean;
    ShotPoint: number | null;
    ShotPoint_checked: boolean;
    CDP: number | null;
    CDP_checked: boolean;
    SR: boolean | null;
    RL: boolean | null;
}

interface coordinateConfig {
    srcx_value : number | null,
    srcy_value : number | null,
    srcx_format : string | null,
    srcy_format : string | null
}

interface manualTraceHeaderExtractRequest {
    segyRows: any[];
    headerByteConfig: headerByteConfig;
    sampleFormat: string | null;
    coordinateConfig: coordinateConfig
}

export { headerByteConfig, manualTraceHeaderExtractRequest, coordinateConfig };