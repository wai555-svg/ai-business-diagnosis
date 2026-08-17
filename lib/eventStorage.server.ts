import { appendFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.jsonl");

export interface StoredEvent {
  name: string;
  params: Record<string, unknown>;
  utm: Record<string, unknown>;
  path: string;
  ts: string;
}

/**
 * イベントをローカルファイルに1行1JSONで追記する（ベストエフォート）。
 * サーバーレス環境ではインスタンス間で永続化されないため、
 * 本番の計測はGA4/Meta Pixelを主として利用し、これはローカル確認用途とする。
 */
export async function appendEvent(event: StoredEvent): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(EVENTS_FILE, JSON.stringify(event) + "\n", "utf-8");
  } catch {
    // ベストエフォートのため失敗しても無視する
  }
}
