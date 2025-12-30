// Cloudflare Cron Trigger Handler
// Runs every 5 minutes to send daily reminders (configured in wrangler.toml)

interface Env {
  APP_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const url = `${env.APP_URL}/api/cron/send-reminders`;

    ctx.waitUntil(
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`,
          "Content-Type": "application/json",
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            console.error(
              `Cron trigger failed: ${response.status} ${response.statusText}`
            );
            const text = await response.text();
            console.error(`Response: ${text}`);
          } else {
            const data = await response.json();
            console.log("Cron trigger success:", data);
          }
        })
        .catch((error) => {
          console.error("Cron trigger error:", error);
        })
    );
  },
};
