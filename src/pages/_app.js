// src/pages/_app.js

import "../styles/globals.css"; // Global CSS import here
import React from "react";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
