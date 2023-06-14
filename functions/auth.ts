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

// convert a buffer to a string
function bufferToString(buffer: ArrayBuffer): string {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

async function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bufferToString(array);
}

export async function onRequestGet(context: EventContext) {
  // Define the OAuth parameters
  const clientId = context.env.OAUTH_CLIENT_ID;
  const redirectUri = "https://yourapp.com/callback"; // Replace with your actual callback URL
  const state = await generateState();

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
