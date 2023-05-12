const simpleOauthModule = require("simple-oauth2");

const callback = {
  async fetch(request) {
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

    const code = request.query.code;
    var options = {
      code: code,
    };

    const origins = env.ORIGINS.split(",");
    const generateScript = (message, content) => `
    <script>
    (function() {
      function contains(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].indexOf('*') >= 0) {
            const regex = new RegExp(arr[i].replaceAll('.', '\\\\.').replaceAll('*', '[\\\\w_-]+'))
            console.log(regex)
            if (elem.match(regex) !== null) {
              return true;
            }
          } else {
            if (arr[i] === elem) {
              return true;
            }
          }
        }
        return false;
      }
      function recieveMessage(e) {
        console.log("recieveMessage %o", e)
        if (!contains(${JSON.stringify(
          origins
        )}, e.origin.replace('https://', 'http://').replace('http://', ''))) {
          console.log('Invalid origin: %s', e.origin);
          return;
        }
        // send message to main window with da app
        window.opener.postMessage(
          'authorization:github:${message}:${JSON.stringify(content)}',
          e.origin
        )
      }
      window.addEventListener("message", recieveMessage, false)
      // Start handshare with parent
      console.log("Sending message: %o", "github")
      window.opener.postMessage("authorizing:github", "*")
    })()
    </script>`;

    oauth2
      .getToken(options)
      .then((result) => {
        const token = oauth2.createToken(result);
        const content = {
          token: token.token.token.access_token,
          provider: "github",
        };
        return { message: "success", content };
      })
      .catch((error) => {
        console.error("Access Token Error", error.message);
        return { message: "error", content: JSON.stringify(error) };
      })
      .then((result) => {
        const script = generateScript(result.message, result.content);
        return Response(script);
      });
  },
};

export default callback;
