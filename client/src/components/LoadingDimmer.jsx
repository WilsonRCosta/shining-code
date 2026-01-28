export default function LoadingDimmer({ complete, error }) {
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

  // Loading state
  if (!complete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm tracking-wide text-black">
            Loading products, just a moment...
          </p>
        </div>
      </div>
    );
  }

  // Error state
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
        </div>
      </div>
    );
  }

  return null;
}
