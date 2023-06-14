interface Params {
  [key: string]: string;
}

interface Env {
  [key: string]: any;
  SECRET: string;
  ASSETS: any;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  REDIRECT_URL: string;
}

interface Headers {
  [key: string]: string;
}

interface CloudflareRequest {
  url: string;
  method: string;
  headers: Headers;
  body: string; // Body as string. If a different type is used, this should be updated.
  bodyUsed: boolean;
  cf: any;
  redirect: string;
}

interface RequestInit {
  method?: string;
  headers?: Headers;
  body?: string;
}

interface EventContext {
  request: CloudflareRequest;
  env: Env;
  params: Params;
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  next(input?: CloudflareRequest | string, init?: RequestInit): Response; // Assuming next returns a Response. Update as needed.
}

const crypto = require("crypto");

export async function onRequestAuth(context: EventContext) {
  // Define the OAuth parameters
  const clientId = context.env.OAUTH_CLIENT_ID;
  const redirectUri = context.env.REDIRECT_URL;
  const state = crypto.randomBytes(16).toString("hex"); // State can be used to mitigate CSRF attacks

  // Construct the GitHub OAuth URL
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("redirect_uri", redirectUri);
  params.append("state", state);
  params.append("scope", "repo,user"); // Replace with the scopes you need
  const authUrl =
    "https://github.com/login/oauth/authorize?" + params.toString();

  // Redirect the user to GitHub's OAuth page
  return Response.redirect(authUrl);
}
