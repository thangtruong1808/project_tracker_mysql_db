/// <reference types="vite/client" />

/**
 * Vite Environment Type Declarations
 * Provides type definitions for Vite environment variables and client-side modules
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL?: string
  readonly VITE_PUSHER_KEY?: string
  readonly VITE_PUSHER_CLUSTER?: string
  readonly VITE_KEY?: string
  readonly VITE_CLUSTER?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

