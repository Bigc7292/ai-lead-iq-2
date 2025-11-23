/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_API_BASE_URL: string;
    readonly GEMINI_API_KEY: string;
    readonly MINIMAX_API_KEY: string;
    readonly MINIMAX_GROUP_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
