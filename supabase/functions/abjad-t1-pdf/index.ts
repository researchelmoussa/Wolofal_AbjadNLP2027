// Task 1 PDFs: the portal has its own session tokens (not Supabase Auth), so this function
// checks the token through the abjad_t1_pdf_* SQL functions and uses the service role for storage.
//   {action:"start",  token, name, size} → signed upload URL (the browser uploads the file itself)
//   {action:"finish", token, path, name} → checks the stored object is a PDF, records it
//   {action:"delete", token, id}         → student removes one of their PDFs
//   {action:"sign",   token, id}         → download link (admin: any PDF, student: their own)
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const BUCKET = "abjad-t1-pdfs";
const MAX_BYTES = 50 * 1024 * 1024;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const fail = (message: string, status = 400) => json({ message }, status);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("method_not_allowed", 405);
  try {
    const b = await req.json();
    const token = String(b.token || "");

    if (b.action === "start") {
      if (!(Number(b.size) > 0) || Number(b.size) > MAX_BYTES) return fail("too_large");
      const { data: chk, error } = await sb.rpc("abjad_t1_pdf_check", { p_token: token });
      if (error) return fail(error.message);
      const path = `${chk.ann_id}/${crypto.randomUUID()}.pdf`;
      const { data, error: e2 } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
      if (e2) return fail(e2.message, 500);
      return json({ path, url: data.signedUrl });
    }

    if (b.action === "finish") {
      const path = String(b.path || "");
      const { data: chk, error } = await sb.rpc("abjad_t1_pdf_check", { p_token: token });
      if (error) return fail(error.message);
      if (!path.startsWith(chk.ann_id + "/")) return fail("bad_path");
      const dir = path.split("/")[0], file = path.split("/")[1];
      const { data: listed, error: e2 } = await sb.storage.from(BUCKET).list(dir, { search: file });
      const obj = (listed || []).find((o) => o.name === file);
      if (e2 || !obj) return fail("upload_missing");
      // check the PDF signature on the first bytes
      const { data: signed } = await sb.storage.from(BUCKET).createSignedUrl(path, 60);
      const head = signed ? new Uint8Array(await (await fetch(signed.signedUrl, { headers: { Range: "bytes=0-4" } })).arrayBuffer()) : new Uint8Array();
      if (String.fromCharCode(...head.slice(0, 5)) !== "%PDF-") {
        await sb.storage.from(BUCKET).remove([path]);
        return fail("not_pdf");
      }
      const size = Number(obj.metadata?.size || 0);
      const { data: row, error: e3 } = await sb.rpc("abjad_t1_pdf_register", {
        p_token: token, p_name: String(b.name || "document.pdf").slice(0, 200), p_path: path, p_size: size,
      });
      if (e3) { await sb.storage.from(BUCKET).remove([path]); return fail(e3.message); }
      return json(row);
    }

    if (b.action === "delete") {
      const { data: path, error } = await sb.rpc("abjad_t1_pdf_delete", { p_token: token, p_id: Number(b.id) });
      if (error) return fail(error.message);
      if (path) await sb.storage.from(BUCKET).remove([path]);
      return json({ ok: true });
    }

    if (b.action === "sign") {
      const { data: path, error } = await sb.rpc("abjad_t1_pdf_path", { p_token: token, p_id: Number(b.id) });
      if (error) return fail(error.message);
      const { data, error: e2 } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600, { download: b.download ? true : undefined });
      if (e2) return fail(e2.message, 500);
      return json({ url: data.signedUrl });
    }

    return fail("bad_action");
  } catch (e) {
    return fail(String((e as Error)?.message || e), 500);
  }
});
