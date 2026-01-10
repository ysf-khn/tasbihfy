// Polyfill for esbuild __name helper (needed for Cloudflare Workers)
// This helper is used when esbuild's keepNames option is enabled but the
// helper function isn't properly bundled for the Workers runtime.
if (typeof (globalThis as any).__name === 'undefined') {
  (globalThis as any).__name = (fn: Function, name: string) => {
    Object.defineProperty(fn, 'name', { value: name, configurable: true });
    return fn;
  };
}

export {};
