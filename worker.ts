// Custom Worker entry: wraps the vinext handler so we can add a scheduled()
// handler for cron triggers (the framework entry only exports fetch).
// `vinext/server/fetch-handler` is resolved to this project's App Router
// handler at build time by the vinext Vite plugin.

import handler from "vinext/server/fetch-handler";

interface Env {
  CRON_SECRET: string;
  NEXT_PUBLIC_APP_URL?: string;
  [key: string]: unknown;
}

export default {
  fetch: handler.fetch,

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || "https://tasbihfy.com";
    // Loopback through the vinext handler — no external network hop
    ctx.waitUntil(
      handler.fetch(
        new Request(`${baseUrl}/api/cron/send-reminders`, {
          method: "POST",
          headers: { authorization: `Bearer ${env.CRON_SECRET}` },
        }),
        env,
        ctx
      )
    );
  },
} satisfies ExportedHandler<Env>;
