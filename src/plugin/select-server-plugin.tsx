import * as React from "react";

import "./select-server-plugin.css";
import { useStorageContext, useSchemaContext } from "@graphiql/react";

export const LAST_URL_KEY = "lastURL";

export const PREV_URLS_KEY = "previousURLs";

interface SelectServerProps {
  url: string;
  setUrl: (url: string) => void;
}

interface ServerSelectPluginProps {
  url: string;
  setUrl: (url: string) => void;
}

const SelectServer: React.FC<SelectServerProps> = ({ url, setUrl }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const storage = useStorageContext();
  const lastUrl = storage?.get(LAST_URL_KEY);
  const currentUrl = lastUrl ?? url;
  const [inputValue, setInputValue] = React.useState(currentUrl);
  const [previousUrls, setPreviousUrls] = React.useState(
    JSON.parse(storage?.get(PREV_URLS_KEY)!) ?? [currentUrl]
  );
  const [error, setError] = React.useState<string | null>(null);

  const schema = useSchemaContext();

  const sameValue = inputValue.trim() === url;
  console.log(schema);

  return (
    <div>
      <div className="plugin-title">Select Server</div>
      <div>
        <input
          className="select-server--input"
          ref={inputRef}
          defaultValue={currentUrl}
          onChange={(e) => setInputValue(e.target.value)}
          spellCheck={false}
          pattern="https?://.+"
        />
        {error && <div className="select-server--input-error">{error}</div>}
      </div>
      <div>
        <button
          className={`select-server--button ${sameValue ? "disabled" : ""}`}
          onClick={() => {
            const value = inputRef?.current?.value?.trim();
            if (!value?.startsWith("http")) {
              setError("invalid url" as string);
              return;
            }
            setError(null);
            setUrl(value);
            storage!.set(LAST_URL_KEY, value);
            setInputValue(value);
            if (!previousUrls.includes(value)) {
              previousUrls.push(value);
              storage?.set(PREV_URLS_KEY, JSON.stringify(previousUrls));
              setPreviousUrls(previousUrls);
            }
          }}
          disabled={sameValue}
          aria-disabled={sameValue}
        >
          Change Schema URL
        </button>
        {schema?.fetchError && (
          <div>
            <div className="select-server--schema-error">
              There was an error fetching your schema:
            </div>
            <div className="select-server--schema-error">
              <code>
                {JSON.parse(schema.fetchError).errors.map(
                  ({ message }: { message: string }) => message
                )}
              </code>
            </div>
          </div>
        )}
        {schema?.schema && !schema?.isFetching && !schema?.fetchError && (
          <div className="select-server--schema-success">
            Schema retrieved successfully
          </div>
        )}
        {schema?.isFetching && (
          <div className="select-server--schema-loading">Schema loading...</div>
        )}
      </div>
      <div>
        <div className="plugin-subheading">Previous Severs</div>
        <ul style={{ padding: 0 }}>
          {previousUrls.map((prev: string) => {
            // Specify type for 'prev'
            return (
              <li className="select-server--previous-entry" key={prev}>
                <span
                  onClick={() => {
                    if (inputRef.current) {
                      // Check if inputRef.current is not null
                      storage!.set(LAST_URL_KEY, prev);
                      inputRef.current.value = prev;
                      setError(null);
                      setUrl(prev);
                      setInputValue(prev);
                    }
                  }}
                  title={`Switch to ${prev}`}
                >
                  {prev}
                </span>
                <button
                  title="Delete server URL from history"
                  onClick={() => {
                    if (!previousUrls.includes(prev)) {
                      return;
                    }
                    const filteredPreviousUrls = previousUrls.filter(
                      (prevUrl: string) => prevUrl !== prev // Specify type for 'prevUrl'
                    );
                    storage?.set(
                      PREV_URLS_KEY,
                      JSON.stringify(filteredPreviousUrls)
                    );
                    setPreviousUrls(filteredPreviousUrls);
                  }}
                >
                  {/* <svg
                    width="1em"
                    height="5em"
                    xmlns="http://www.w3.org/2000/svg"
                    fillRule="evenodd"
                    aria-hidden="true"
                    viewBox="0 0 23 23"
                    clipRule="evenodd"
                    style={{ height: "1em", width: "1em" }}
                  >
                    
                  </svg> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="5em"
                    fillRule="evenodd"
                    aria-hidden="true"
                    viewBox="0 0 48 48"
                    clipRule="evenodd"
                    style={{ height: "1em", width: "1em" }}
                  >
                    <path
                      fill="#b39ddb"
                      d="M30.6,44H17.4c-2,0-3.7-1.4-4-3.4L9,11h30l-4.5,29.6C34.2,42.6,32.5,44,30.6,44z"
                    ></path>
                    <path fill="#9575cd" d="M28 6L20 6 14 12 34 12z"></path>
                    <path
                      fill="#7e57c2"
                      d="M10,8h28c1.1,0,2,0.9,2,2v2H8v-2C8,8.9,8.9,8,10,8z"
                    ></path>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export function serverSelectPlugin({ url, setUrl }: ServerSelectPluginProps) {
  return {
    title: "Select Server",
    icon: () => (
      <svg
        height="1em"
        viewBox="-1.5 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="1.5"
      >
        <path
          stroke="currentColor"
          d="m12.731 2.751 4.935 2.849c.39-.41.94-.664 1.549-.664 1.181 0 2.138.957 2.138 2.138 0 1.001-.688 1.842-1.617 2.074l-.015.003v5.7c.949.233 1.642 1.076 1.642 2.081 0 1.182-.958 2.14-2.14 2.14-.637 0-1.208-.278-1.6-.719l-.002-.002-4.905 2.832c.069.202.109.434.109.675 0 1.182-.958 2.14-2.14 2.14s-2.14-.958-2.14-2.14c0-.216.032-.425.092-.621l-.004.015-4.941-2.844c-.39.407-.939.66-1.546.66-1.182 0-2.14-.958-2.14-2.14 0-1.002.689-1.844 1.619-2.076l.015-.003v-5.699c-.951-.231-1.646-1.076-1.646-2.082 0-1.182.958-2.14 2.14-2.14.396 0 .768.108 1.086.296l-.01-.005c.184.106.342.231.479.376l.001.001 4.938-2.85c-.056-.182-.088-.391-.088-.608 0-1.181.958-2.139 2.139-2.139s2.139.958 2.139 2.139c0 .219-.033.43-.094.629l.004-.015zm-.515.877c-.019.021-.037.039-.057.057l-.001.001 6.461 11.19c.026-.009.056-.016.082-.023v-5.707c-.938-.238-1.621-1.076-1.621-2.072 0-.183.023-.361.066-.531l-.003.015c.006-.024.012-.049.019-.072zm-3.015.059-.06-.06-4.946 2.852c.053.177.084.381.084.592 0 .969-.645 1.787-1.53 2.049l-.015.004-.076.021v5.708l.084.023 6.461-11.19zm2.076.507c-.179.053-.384.084-.596.084s-.417-.031-.611-.088l.015.004-6.46 11.189c.286.276.496.629.597 1.026l.003.015h12.911c.102-.413.313-.768.599-1.043l.001-.001-6.456-11.186zm.986 16.227 4.917-2.838c-.015-.047-.027-.094-.038-.142h-12.92l-.021.083 4.939 2.852c.39-.403.936-.653 1.54-.653.626 0 1.189.268 1.581.696l.001.002z"
        />
      </svg>
    ),
    content() {
      return <SelectServer url={url} setUrl={setUrl} />;
    },
  };
}
