import { useEffect, useMemo, useState } from "react";

export default function LoadingDimmer({ complete, error, onRetry }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (complete) return;

    const start = Date.now();
    const t = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 250);

    return () => clearInterval(t);
  }, [complete]);

  const message = useMemo(() => {
    if (elapsed < 10000) return "Loading products, just a moment...";
    if (elapsed < 25000)
      return "Warming up the server… this can take ~30 seconds on first load.";
    return "Still warming up… thanks for your patience. You can retry if it’s stuck.";
  }, [elapsed]);

  const getErrorMessage = (code) => {
    switch (code) {
      case 400:
        return "Your request could not be understood due to bad syntax.";
      case 401:
        return "Authentication required. You are not authorized.";
      case 403:
        return "Your request is forbidden.";
      case 404:
        return "Not found. The requested resource does not exist.";
      case 500:
      default:
        return "Sorry, the server is down... Please try again later.";
    }
  };

  // Loading
  if (!complete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />

          <p className="text-sm tracking-wide text-black">{message}</p>

          {elapsed >= 25000 && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => onRetry?.()}
                className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                Retry
              </button>
              <span className="text-xs text-neutral-500">
                {Math.floor(elapsed / 1000)}s
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error
  if (complete && error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm px-4">
        <div className="w-full max-w-md border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-neutral-500">
            ERROR {error.code}
          </p>

          <h3 className="mt-2 text-lg font-semibold text-black">
            {getErrorMessage(error.code)}
          </h3>

          {error.msg && <p className="mt-2 text-sm text-neutral-600">{error.msg}</p>}

          <button
            onClick={() => onRetry?.()}
            className="mt-4 rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}
