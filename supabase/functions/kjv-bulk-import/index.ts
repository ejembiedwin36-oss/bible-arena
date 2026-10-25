import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION_ID = "60fa2dbc-7128-43cd-9593-cb1e1942b3b3";
const BATCH_ID = "d5ef905f-d4ee-4bec-96a8-0a19f1feb628";
const EXPECTED_VERSE_COUNT = 31102;
const repo = "https://raw.githubusercontent.com/renniemaharaj/kjv-bible/main";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const auth = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const caller = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const db = createClient(url, service);
  const { data: books, error: be } = await db
    .from("bible_books")
    .select("id,name,book_order")
    .order("book_order");
  if (be) return Response.json({ error: be.message }, { status: 500 });

  let processed = 0;
  const failures: unknown[] = [];

  for (const book of books ?? []) {
    try {
      const r = await fetch(`${repo}/${encodeURIComponent(book.name)}.json`);
      if (!r.ok) throw new Error(`source ${r.status}`);
      const source = await r.json();

      const { data: chapters, error: ce } = await db
        .from("bible_chapters")
        .select("id,chapter_number")
        .eq("book_id", book.id);
      if (ce) throw ce;

      const chapterMap = new Map(
        (chapters ?? []).map((c: any) => [String(c.chapter_number), c.id]),
      );
      const rows: any[] = [];

      for (const [ch, verses] of Object.entries(
        source as Record<string, Record<string, string>>,
      )) {
        const chapter_id = chapterMap.get(ch);
        if (!chapter_id) throw new Error(`missing chapter ${ch}`);
        for (const [vn, text] of Object.entries(verses)) {
          rows.push({
            version_id: VERSION_ID,
            chapter_id,
            verse_number: Number(vn),
            text,
            is_jesus_words: false,
          });
        }
      }

      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await db.from("bible_verses").upsert(
          rows.slice(i, i + 500),
          {
            onConflict: "version_id,chapter_id,verse_number",
            ignoreDuplicates: true,
          },
        );
        if (error) throw error;
      }
      processed += rows.length;
    } catch (e) {
      failures.push({ book: book.name, error: String(e) });
    }
  }

  const { count, error: countError } = await db
    .from("bible_verses")
    .select("id", { count: "exact", head: true })
    .eq("version_id", VERSION_ID);
  if (countError) {
    return Response.json({ error: countError.message, failures }, { status: 500 });
  }

  const completed = count === EXPECTED_VERSE_COUNT && failures.length === 0;
  const { error: batchError } = await db
    .from("bible_import_batches")
    .update({
      import_status: completed ? "completed" : "importing",
      imported_verse_count: count ?? 0,
      error_message: failures.length ? JSON.stringify(failures) : null,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", BATCH_ID);

  if (batchError) {
    return Response.json(
      { processed, total: count, failures, batch_error: batchError.message },
      { status: 500 },
    );
  }

  return Response.json({ processed, total: count, completed, failures });
});
