import dotenv from "dotenv";
import express from "express";
import proxy from "http-proxy-middleware";
import SourceMapSupport from "source-map-support";
import render from "./render.jsx";
const app = express();
SourceMapSupport.install();
dotenv.config();
const port = process.env.PORT || 8000;
const config = require("../webpack.config.js")[0];
const apiProxyTarget = process.env.API_PROXY_TARGET;
const enableHMR = (process.env.ENABLE_HMR || "true") === "true";

if (enableHMR && process.env.NODE_ENV !== "production") {
  console.log("Adding dev middleware, enabling HMR");
  const webpack = require("webpack");
  const devMiddleware = require("webpack-dev-middleware");
  const hotMiddleware = require("webpack-hot-middleware");
  config.entry.app.push("webpack-hot-middleware/client");
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  const compiler = webpack(config);
  app.use(devMiddleware(compiler));
  app.use(hotMiddleware(compiler));
}

if (apiProxyTarget) {
  app.use(
    "/graphql",
    proxy({
      target: apiProxyTarget,
      changeOrigin: true,
    })
  );
  app.use("/auth", proxy({ target: apiProxyTarget,changeOrigin:true }));
}

if (!process.env.UI_API_ENDPOINT) {
  process.env.UI_API_ENDPOINT = "/graphql";
}
if (!process.env.UI_SERVER_API_ENDPOINT) {
  process.env.UI_API_ENDPOINT = process.env.UI_API_ENDPOINT;
}

if (!process.env.UI_AUTH_ENDPOINT) {
  process.env.UI_AUTH_ENDPOINT = "http://localhost:2000/auth";
}

app.use(express.static("public"), function (req, res, next) {
  const env = { UI_API_ENDPOINT: process.env.UI_API_ENDPOINT };
  next();
});

app.get("/env.js", (req, res) => {
  const env = {
    UI_API_ENDPOINT: process.env.UI_API_ENDPOINT,
    UI_AUTH_ENDPOINT: process.env.UI_AUTH_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  };
  res.send(`window.ENV = ${JSON.stringify(env)}`);
  console.log(res.headersSent);
});

app.get("*", (req, res, next) => {
  render(req, res, next);
});
app.listen(port, function () {
  console.log(`ui server started on port ${port}`);
});
if (module.hot) {
  module.hot.accept("./render.jsx");
}
