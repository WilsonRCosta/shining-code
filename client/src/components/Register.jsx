import React, { useContext, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import clothesService from "../service/serviceAPI";
import NavBar from "./NavBar";
import { notify } from "../utils/notify";

export default function Register() {
  const { enqueueSnackbar } = useSnackbar();
  const history = useNavigate();

  const [registryType, toggleRegistry] = useState(false);

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRepeatPassword, setSignupRepeatPassword] = useState("");

  const { userProvider, tokenProvider } = useContext(UserContext);
  const [, setUser] = userProvider;
  const [, setToken] = tokenProvider;

  const title = useMemo(
    () => (registryType ? "Create account" : "Sign in"),
    [registryType]
  );

  const setUserInfo = (resp) => {
    notify(enqueueSnackbar, resp?.msg, resp?.status);

    if (resp?.user) setUser(resp.user);
    if (resp?.token) setToken(resp.token);

    if (resp?.status >= 200 && resp?.status < 400) history("/");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    clothesService()
      .loginUser({ name: loginName, password: loginPassword })
      .then(setUserInfo);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    clothesService()
      .registerUser({
        email: signupEmail,
        name: signupName,
        password: signupPassword,
        repeat_password: signupRepeatPassword,
      })
      .then(setUserInfo);
  };

  const switchToLogin = () => {
    toggleRegistry(false);
    setSignupEmail("");
    setSignupName("");
    setSignupPassword("");
    setSignupRepeatPassword("");
  };

  const switchToSignup = () => {
    toggleRegistry(true);
    setLoginName("");
    setLoginPassword("");
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
            onClick={switchToLogin}
            className={`text-xs font-semibold tracking-[0.18em] uppercase px-2 py-1 ${
              !registryType ? "text-black" : "text-neutral-400 hover:text-black"
            }`}
          >
            Login
          </button>
          <span className="text-neutral-300">/</span>
          <button
            type="button"
            onClick={switchToSignup}
            className={`text-xs font-semibold tracking-[0.18em] uppercase px-2 py-1 ${
              registryType ? "text-black" : "text-neutral-400 hover:text-black"
            }`}
          >
            Sign Up
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
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOUR USERNAME"
                />
              </Field>

              <Field label="Password">
                <input
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  type="password"
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOUR PASSWORD"
                />
              </Field>

              <button
                type="button"
                className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-500 hover:text-black"
                onClick={() =>
                  notify(enqueueSnackbar, "Forgot password not implemented yet.", 400)
                }
              >
                {/* TODO add forgot password feature */}
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
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="YOU@EMAIL.COM"
                />
              </Field>

              <Field label="Username">
                <input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="CHOOSE A USERNAME"
                />
              </Field>

              <Field label="Password">
                <input
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  type="password"
                  className="w-full border-b border-black/20 focus:border-black outline-none py-3 text-sm"
                  placeholder="CREATE A PASSWORD"
                />
              </Field>

              <Field label="Repeat password">
                <input
                  value={signupRepeatPassword}
                  onChange={(e) => setSignupRepeatPassword(e.target.value)}
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
