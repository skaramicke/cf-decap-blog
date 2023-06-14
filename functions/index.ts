interface Params {
  [key: string]: string;
}

interface Env {
  [key: string]: any;
  SECRET: string;
  ASSETS: any;
}

interface RequestInit {
  // Add properties here as needed.
}

interface CloudflareRequest {
  json(): Promise<any>;
  // Add methods here as needed.
}

interface EventContext {
  request: CloudflareRequest;
  env: Env;
  params: Params;
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  next(input?: CloudflareRequest | string, init?: RequestInit): void;
}

export async function onRequestPost(context: EventContext) {
  const secret = context.env.SECRET;

  // Extract the code from the request body
  const body = await context.request.json();
  const code = body.code;

  if (!code) {
    return new Response("Missing 'code'", { status: 400 });
  }

  // Prepare the request to GitHub's OAuth API
  const params = new URLSearchParams();
  params.append("client_id", "YOUR_CLIENT_ID");
  params.append("client_secret", secret);
  params.append("code", code);

  const gitRequest = new Request(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    }
  );

  try {
    const gitResponse = await fetch(gitRequest);
    const gitBody = await gitResponse.json();

    // Forward the response from GitHub
    return new Response(JSON.stringify(gitBody), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // If something went wrong, return the error message
    return new Response(error.message, { status: 500 });
  }
}
