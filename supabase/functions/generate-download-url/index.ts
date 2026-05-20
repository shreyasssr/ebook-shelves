import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate user via JWT
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const downloadId = body?.download_id;
    if (!downloadId || typeof downloadId !== "string") {
      return new Response(JSON.stringify({ error: "download_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch the download record and validate ownership/limits
    const { data: dl, error: dErr } = await admin.from("digital_downloads").select("*").eq("id", downloadId).maybeSingle();
    if (dErr || !dl) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (dl.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!dl.is_active) return new Response(JSON.stringify({ error: "Download disabled" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (new Date(dl.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Expired" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (dl.download_count >= dl.max_downloads) {
      return new Response(JSON.stringify({ error: "Download limit reached" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate the order is completed
    const { data: order } = await admin.from("orders").select("status").eq("id", dl.order_id).maybeSingle();
    if (!order || order.status !== "completed") {
      return new Response(JSON.stringify({ error: "Order not completed" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch the book's storage path
    const { data: book } = await admin.from("books").select("file_url,name").eq("id", dl.book_id).maybeSingle();
    if (!book?.file_url) {
      return new Response(JSON.stringify({ error: "File not available" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // file_url is a path inside the ebooks bucket (e.g. "ebooks/foo.pdf" or "foo.pdf")
    let path = book.file_url as string;
    if (path.startsWith("ebooks/")) path = path.slice("ebooks/".length);

    const { data: signed, error: sErr } = await admin.storage.from("ebooks").createSignedUrl(path, 60 * 10, {
      download: `${book.name}.pdf`,
    });
    if (sErr || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: "Could not generate URL: " + (sErr?.message ?? "unknown") }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Increment counter
    await admin.from("digital_downloads").update({ download_count: dl.download_count + 1 }).eq("id", dl.id);

    return new Response(JSON.stringify({ url: signed.signedUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
