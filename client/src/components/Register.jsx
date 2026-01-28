import React, { useContext, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import clothesService from "../service/serviceAPI";
import NavBar from "./NavBar";

export default function Register() {
  const { enqueueSnackbar } = useSnackbar();
  const history = useNavigate();

  // false = login, true = signup
  const [registryType, toggleRegistry] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeat_password, setRepeatPass] = useState("");

  const { userProvider, tokenProvider } = useContext(UserContext);
  const [, setUser] = userProvider;
  const [, setToken] = tokenProvider;

  const title = useMemo(
    () => (registryType ? "Create account" : "Sign in"),
    [registryType]
  );

  const setUserInfo = (resp) => {
    // resp might be weird sometimes; normalize message
    const msg =
      typeof resp?.msg === "string"
        ? resp.msg
        : resp?.msg
          ? JSON.stringify(resp.msg)
          : "Unexpected response from server";

    enqueueSnackbar(msg, { variant: resp?.type || "default" });

    // Only set user/token if server sends them
    if (resp?.user) setUser(resp.user);
    if (resp?.token) setToken(resp.token);

    if (resp?.type === "success") history("/");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    clothesService().loginUser({ name, password }).then(setUserInfo);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    clothesService()
      .registerUser({ email, name, password, repeat_password })
      .then(setUserInfo);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {registryType
              ? "Create an account to save your wishlist and checkout faster."
              : "Welcome back. Sign in to continue."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <button
            type="button"
            onClick={() => toggleRegistry(false)}
            className={`text-xs font-semibold tracking-[0.18em] uppercase px-2 py-1 ${
              !registryType ? "text-black" : "text-neutral-400 hover:text-black"
            }`}
          >
            Sign in
          </button>
          <span className="text-neutral-300">/</span>
          <button
            type="button"
            onClick={() => toggleRegistry(true)}
            className={`text-xs font-semibold tracking-[0.18em] uppercase px-2 py-1 ${
              registryType ? "text-black" : "text-neutral-400 hover:text-black"
            }`}
          >
            Create account
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Sign in */}
          <section className={`${registryType ? "opacity-40 pointer-events-none" : ""}`}>
            <h2 className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
              Sign in
            </h2>

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-5">
              <Field label="Username">
                <input
                  value={name}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOUR USERNAME"
                />
              </Field>

              <Field label="Password">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOUR PASSWORD"
                />
              </Field>

              <button
                type="button"
                className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-500 hover:text-black"
                onClick={() =>
                  enqueueSnackbar("Forgot password not implemented yet.", {
                    variant: "info",
                  })
                }
              >
                Forgot password?
              </button>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
              >
                Sign in
              </button>
            </form>
          </section>

          {/* Sign up */}
          <section className={`${!registryType ? "opacity-40 pointer-events-none" : ""}`}>
            <h2 className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-700">
              Create account
            </h2>

            <form onSubmit={handleSignupSubmit} className="mt-5 space-y-5">
              <Field label="Email">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOU@EMAIL.COM"
                />
              </Field>

              <Field label="Username">
                <input
                  value={name}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="CHOOSE A USERNAME"
                />
              </Field>

              <Field label="Password">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="CREATE A PASSWORD"
                />
              </Field>

              <Field label="Repeat password">
                <input
                  value={repeat_password}
                  onChange={(e) => setRepeatPass(e.target.value)}
                  type="password"
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="REPEAT PASSWORD"
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 text-xs font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition"
              >
                Create account
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-extrabold tracking-[0.22em] uppercase text-neutral-600">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
