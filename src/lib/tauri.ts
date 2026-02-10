// Wrapper around Tauri invoke that falls back gracefully in browser dev mode

let _invoke: typeof import("@tauri-apps/api/core").invoke | null = null;
let _initPromise: Promise<void> | null = null;

async function initInvoke() {
  try {
    const mod = await import("@tauri-apps/api/core");
    _invoke = mod.invoke;
  } catch {
    _invoke = null;
  }
}

function ensureInit(): Promise<void> {
  if (!_initPromise) {
    _initPromise = initInvoke();
  }
  return _initPromise;
}

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  await ensureInit();
  if (!_invoke) {
    throw new Error(`Tauri not available: ${cmd}`);
  }
  return _invoke<T>(cmd, args);
}

export function isTauriAvailable(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
