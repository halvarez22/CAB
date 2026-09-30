/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TUTOR_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
