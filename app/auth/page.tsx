"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Remplis l’email et le mot de passe.");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setMessage("Les mots de passe ne correspondent pas.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setMessage(error.message);
        } else {
          setMessage("Compte créé. Vérifie ton email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      setMessage("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0f172a] to-[#020617] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm text-blue-300">
            Espace sécurisé EclipseTrade
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Accède à ton dashboard trading avec une interface moderne et sécurisée.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur-xl">
          
          {/* SWITCH LOGIN / REGISTER */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Register
            </button>
          </div>

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="Ton nom"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                placeholder="tonemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="accent-blue-500" />
                  Se souvenir de moi
                </label>

                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {message && (
              <p className="text-sm text-blue-300">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="animated-gradient-button w-full rounded-xl px-4 py-3 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)] disabled:opacity-60"
            >
              {loading
                ? "Chargement..."
                : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {mode === "login"
              ? "Tu n’as pas encore de compte ?"
              : "Tu as déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}