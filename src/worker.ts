import manifest from "../manifest.json";
import { validateAndDecodeSchemas } from "./handlers/validator";
import { run } from "./run";
import { Env } from "./types/env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/manifest.json" && request.method === "GET") {
        return new Response(JSON.stringify(manifest), {
          headers: { "content-type": "application/json" },
        });
      }
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: `Only POST requests are supported.` }), {
          status: 405,
          headers: { "content-type": "application/json", Allow: "POST" },
        });
      }
      const contentType = request.headers.get("content-type");
      if (contentType !== "application/json") {
        return new Response(JSON.stringify({ error: `Error: ${contentType} is not a valid content type` }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }
      const webhookPayload = await request.json();
      const result = validateAndDecodeSchemas(env, webhookPayload.settings);
      webhookPayload.settings = result.decodedSettings;
      await run(webhookPayload, result.decodedEnv);
      return new Response(JSON.stringify("OK"), { status: 200, headers: { "content-type": "application/json" } });
    } catch (error) {
      return handleUncaughtError(error);
    }
  },
};

function handleUncaughtError(errors: unknown) {
  console.error(errors);
  const status = 500;
  return new Response(JSON.stringify(errors), { status: status, headers: { "content-type": "application/json" } });
}
