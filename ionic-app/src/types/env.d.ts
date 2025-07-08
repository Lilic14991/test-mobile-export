interface ImportMetaEnv {
    readonly VITE_IFRAME_HOST: string;
    readonly VITE_IFRAME_PORT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}