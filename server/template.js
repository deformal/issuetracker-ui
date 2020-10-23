import serialize from "serialize-javascript";
export default function template(body, initialData, userData) {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--react terminologies api-->
    <title>IssueTracker</title>
    <link rel="icon" href="/css/layers.png">
    <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
    <script src="https://apis.google.com/js/api:client.js"></script>
    <style>
      .panel-title a {
        display: block;
        width: 100%;
        cursor: pointer;
      }
      table.table-hover tr {
        cursor: pointer;
      }
    </style>
  </head>

  <body>
    <div id="contents">${body}</div>
    <script>
    window.__INITIAL_DATA__ = ${serialize(initialData)}
    window.__USER_DATA__ = ${serialize(userData)}
    
    </script>
    <script src="/env.js"></script>
    <script src="/app.bundle.js"></script>
    <script src="/vendor.bundle.js"></script>
    
  </body>
</html>
`;
}
