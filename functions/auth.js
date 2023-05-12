const simpleOauthModule = require("simple-oauth2");
const randomstring = require("randomstring");

export function onRequest(context) {
  const config = {
    client: {
      id: env.OAUTH_CLIENT_ID,
      secret: env.OAUTH_CLIENT_SECRET,
    },
    auth: {
      // Supply GIT_HOSTNAME for enterprise github installs.
      tokenHost: "https://github.com",
      tokenPath: "/login/oauth/access_token",
      authorizePath: "/login/oauth/authorize",
    },
  };

  const oauth2 = new simpleOauthModule.AuthorizationCode(config);
  const authorizationUri = oauth2.authorizeURL({
    redirectURI: process.env.REDIRECT_URL,
    scope: process.env.SCOPES || "repo,user",
    state: randomstring.generate(32),
  });

  return Response.redirect(authorizationUri);
}
