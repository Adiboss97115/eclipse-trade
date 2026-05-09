"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function NavbarAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
    }

    checkUser();
  }, [supabase]);

  if (!loggedIn) {
    return (
      <Link
        href="/auth"
        className="animated-gradient-button rounded-xl px-4 py-2 text-sm font-semibold text-white"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
      >
        Dashboard
      </Link>

      <Link
        href="/profile"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
      >
        Profil
      </Link>
    </div>
  );
}