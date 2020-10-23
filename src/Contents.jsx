import React from "react";
import { Route, Switch } from "react-router-dom";
import routes from "./routes.js";

const notFound = () => {
  return <h1>Page not found</h1>;
};

export default function Contents() {
  return (
    <Switch>
      {routes.map((attrs) => (
        <Route {...attrs} key={attrs.path} />
      ))}
    </Switch>
  );
}
