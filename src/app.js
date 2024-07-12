import React, { useState, useEffect } from "react";
import History from "./history";
// import Landing from "./landing";
import { useDocumentTitle, Loading, Error } from "./app-helpers";
import getGitProvider from "./git-providers/providers";

export default function App() {
  const gitProvider = getGitProvider();

  if (gitProvider.showLanding()) {
    // return <Landing />;
    const url = `${window.location.protocol}//${
      window.location.host
    }/babel/babel/blob/master/packages/babel-core/test/browserify.js`;
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem"
        }}
      >
        <a className="button" href={url}>
          Try it
        </a>
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <InnerApp gitProvider={gitProvider} />
        <footer>
          <a href="https://github.com/HenryTSZ/git-history">Git History</a>
          <br />
          by <a href="https://github.com/HenryTSZ">@HenryTSZ</a>
        </footer>
      </React.Fragment>
    );
  }
}

function InnerApp({ gitProvider }) {
  const path = gitProvider.getPath();
  const fileName = path.split("/").pop();

  useDocumentTitle(`Git History - ${fileName}`);

  const [versions, loading, error, loadMore] = useVersionsLoader(
    gitProvider,
    path
  );

  if (error) {
    return <Error error={error} gitProvider={gitProvider} />;
  }

  if (!versions && loading) {
    return <Loading path={path} />;
  }

  if (!versions.length) {
    return <Error error={{ status: 404 }} gitProvider={gitProvider} />;
  }

  return <History versions={versions} loadMore={loadMore} />;
}

function useVersionsLoader(gitProvider) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    last: 10,
    noMore: false
  });

  const loadMore = () => {
    setState(old => {
      const shouldFetchMore = !old.loading && !old.noMore;
      return shouldFetchMore
        ? { ...old, last: old.last + 10, loading: true }
        : old;
    });
  };

  useEffect(() => {
    gitProvider
      .getVersions(state.last)
      .then(data => {
        setState(old => ({
          data,
          loading: false,
          error: false,
          last: old.last,
          noMore: data.length < old.last
        }));
      })
      .catch(error => {
        setState(old => ({
          ...old,
          loading: false,
          error: error.message || error
        }));
      });
  }, [state.last]);

  return [state.data, state.loading, state.error, loadMore];
}
