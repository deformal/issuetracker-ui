//imports
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Page from "../src/Page.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import Store from "../src/Store.js";

Store.initialData = window.__INITIAL_DATA__;
Store.userData = window.__USER_DATA__;
const element = (
  <Router>
    <Page />
  </Router>
);

ReactDOM.hydrate(element, document.getElementById("contents"));

if (module.hot) {
  module.hot.accept();
}
