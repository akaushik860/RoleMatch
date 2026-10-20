import { creditsLeft } from "@/lib/server/credits";
import { getUser } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return Response.json({ error: "Sign in to see your AI credits." }, { status: 401 });
  try {
    const [tailor, imp] = await Promise.all([creditsLeft(supabase, "tailor"), creditsLeft(supabase, "import")]);
    return Response.json({ tailor, import: imp });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Couldn't load credits. Has supabase/schema.sql been run?" }, { status: 500 });
  }
}
