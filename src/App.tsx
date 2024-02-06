import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import "graphiql/graphiql.css";
import { explorerPlugin } from "@graphiql/plugin-explorer";
import {
  serverSelectPlugin,
  LAST_URL_KEY,
} from "./plugin/select-server-plugin.tsx";
import { useStorageContext } from "@graphiql/react";
import React from "react";

function App() {
  const storage = useStorageContext();

  //server url
  const STARTING_URL = "";
  const lastUrl = storage?.get(LAST_URL_KEY);
  const [currentUrl, setUrl] = React.useState(lastUrl ?? STARTING_URL);
  const fetcher = React.useMemo(
    () => createGraphiQLFetcher({ url: currentUrl }),
    [currentUrl]
  );
  const serverSelect = React.useMemo(
    () => serverSelectPlugin({ url: currentUrl, setUrl }),
    [currentUrl]
  );

  const headersString = '{"X-API-KEY": ""}'; //headers

  const explorer = explorerPlugin({}); // pass the explorer props

  return (
    <GraphiQL
      headers={headersString}
      fetcher={fetcher}
      plugins={[serverSelect, explorer]}
    />
  );
}

export default App;
