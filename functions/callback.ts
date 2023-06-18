interface Params {
  [key: string]: string;
}

interface Env {
  [key: string]: any;
  SECRET: string;
  ASSETS: any;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
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

function renderResponse(status: "success" | "error", content: any) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Authorizing ...</title>
    </head>
    <body>
      <p id="message"></p>
      <script>
        // Output a message to the user
        function sendMessage(message) {
          document.getElementById("message").innerText = message;
          document.title = message
        }

        // Handle a window message by sending the auth to the "opener"
        function receiveMessage(message) {
          console.debug("receiveMessage", message);
          window.opener.postMessage(
            'authorization:github:${status}:${JSON.stringify(content)}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
          sendMessage("Authorized, closing ...");
        }

        sendMessage("Authorizing ...");
        window.addEventListener("message", receiveMessage, false);

        console.debug("postMessage", "authorizing:github", "*")
        window.opener.postMessage("authorizing:github", "*");
      </script>
    </body>
  </html>
  `;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const clientId = context.env.OAUTH_CLIENT_ID;
  const clientSecret = context.env.OAUTH_CLIENT_SECRET;

  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing 'code'", { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
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

    if (!gitResponse.ok) {
      throw new Error(
        `GitHub API responded with status: ${gitResponse.status}`
      );
    }

    const gitBody = await gitResponse.json();

    // Construct script to post the authorization data to the parent window
    const script = renderResponse("success", {
      token: gitBody.access_token,
      provider: "github",
    });

    // Serve the script to the popup window
    return new Response(script, { headers: { "Content-Type": "text/html" } });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
