import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/serverEnv";

let cachedClient: SupabaseClient | null = null;

/**
 * Service Role Keyを使うSupabaseクライアント。
 * RLSをバイパスして読み書きできるため、API Route / Server Componentからのみ使用すること。
 * このファイルをクライアントコンポーネントからimportしてはいけない
 * （Service Role Keyがブラウザに露出する）。
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!serverEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) return null;

  if (!cachedClient) {
    cachedClient = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return cachedClient;
}
