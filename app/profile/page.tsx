"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  router.push("/auth");
  return;
}

setEmail(user.email || "");

// 1. essayer de lire le profil en base
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, email, bio, avatar_url")
  .eq("id", user.id)
  .single();

// 2. si profil trouvé
if (profile) {
  setBio(profile.bio || "");
  setFullName(profile.full_name || "");
  setEmail(profile.email || user.email || "");
} else {
  // 3. sinon on crée une ligne
  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || "",
  });

  setFullName(user.user_metadata?.full_name || "");
}

setLoading(false);
    }

    loadUser();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMessage("");
  setSaving(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setMessage("Utilisateur introuvable.");
    setSaving(false);
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio: bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    setMessage(error.message);
  } else {
    setMessage("Profil mis à jour avec succès.");
    router.refresh();
  }

  setSaving(false);
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0f172a] to-[#020617] text-white flex items-center justify-center px-4">
        <p className="text-slate-300">Chargement du profil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#0f172a] to-[#020617] text-white px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm text-blue-300">
            Profil utilisateur
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Modifier mon profil
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Mets à jour les informations visibles sur ton compte EclipseTrade.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div>
  <label className="mb-2 block text-sm text-slate-300">
    Bio
  </label>
  <textarea
    placeholder="Ex : Trader débutant, passionné de crypto..."
    value={bio}
    onChange={(e) => setBio(e.target.value)}
    rows={4}
    className="w-full resize-none rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
  />
</div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Nom complet
              </label>
              <input
                type="text"
                placeholder="Ton nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#11182D] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {message && (
              <p className="text-sm text-blue-300">{message}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="animated-gradient-button rounded-xl px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)] disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Retour dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}