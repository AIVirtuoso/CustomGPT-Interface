// "use client";
import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();
import { BrowserRouter as Router } from "react-router-dom";
export default async function App() {
  return (
    <>
      {/* <Router> */}
        <Home />
        {serverConfig?.isVercel && <Analytics />}
      {/* </Router> */}
    </>
  );
}
