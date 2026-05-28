/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MOCK_ENABLED: string;
  readonly VITE_MOCK_LATENCY_MIN: string;
  readonly VITE_MOCK_LATENCY_MAX: string;
  readonly VITE_MOCK_ERROR_PROBABILITY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
