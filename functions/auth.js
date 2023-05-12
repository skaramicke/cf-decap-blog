// GitHub OAuth2 Provider for Cloudflare Workers

import { parse } from "https://cdn.skypack.dev/querystring";

const GITHUB_CLIENT_ID = env.OAUTH_CLIENT_ID;
const GITHUB_CLIENT_SECRET = env.OAUTH_CLIENT_SECRET;
const REDIRECT_URI = env.REDIRECT_URI;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/auth/callback") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Error: Missing code parameter", { status: 400 });
    }

    const accessToken = await exchangeCodeForToken(code);

    if (!accessToken) {
      return new Response("Error: Invalid code", { status: 400 });
    }

    return new Response(`Access Token: ${accessToken}`);
  }

  return new Response("Not Found", { status: 404 });
}

// ... (exchangeCodeForToken function)

async function exchangeCodeForToken(code: string): Promise<string | null> {
  const tokenUrl = "https://github.com/login/oauth/access_token";
  const headers = new Headers({ "Content-Type": "application/json" });
  const body = JSON.stringify({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(tokenUrl, { method: "POST", headers, body });

  if (!response.ok) {
    return null;
  }

  const data = await response.text();
  const parsedData = parse(data);
  const accessToken = parsedData["access_token"];

  return accessToken;
}
