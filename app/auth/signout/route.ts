import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/auth", request.url);
  return NextResponse.redirect(url, {
    status: 303,
  });
}