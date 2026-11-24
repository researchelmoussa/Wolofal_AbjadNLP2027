# Wolofal · AbjadNLP 2027 contributor portal

Online portal for the Wolofal data collection and annotation of the
[AbjadNLP 2027](https://abjadnlp.com/abjad2027.html#tasks) shared tasks.

- **Students** sign in with their email address and the identification code
  the admin gave them (`WOL-XXXX-XXXX`). They then see a one-page
  presentation: the workshop, Wolofal's place in the shared tasks, its impact,
  their contribution (Task 0 Verify, Task 1 Augment, Task 2 Annotate, with
  their own tasks highlighted) and the co-authorship opportunity.
- **Admins** manage the contributor list: add one student or bulk-import a
  list, edit details, language profile and assigned tasks, generate a new
  code, disable or delete an account, copy a ready-made invitation (or open
  it in the email app), export everything as CSV, and change the admin
  password.
- The whole portal is available in **English and French** (EN/FR switch in
  the header; the choice is remembered). Invitations can be generated in
  either language.
- The look follows abjadnlp.com (colours, DM Sans / Noto Kufi Arabic, logo in
  `assets/`).

## Task workspaces (T0 · T1 · T2)

Students open **My tasks** (`#/tasks`) from their presentation page.

| Task | What the student does | Data |
| --- | --- | --- |
| **T0 · Verify** (`#/t0`) | Says whether each sentence is Wolofal: **Yes**, or **No** with a reason (preset reasons plus free text). | The 4,961 rows of the 7 CSVs in `01_collected_data/stream_a_native_wolofal` hold 4,354 distinct texts. Each distinct text is verified once. A random 50 % of each group (author passages, code-switched, monolingual) forms the 2,177-text sample, which is split evenly over the students with T0, with no overlap. |
| **T1 · Augment** (`#/t1`) | Two options the student can mix: **upload PDFs** of their author's works (up to 20, 50 MB each), and/or **document passages** (up to 200, 50–150 words) with only a required book title or link. T1 is completed at 20 PDFs or 200 passages. Exact duplicate passages are refused. | Authors come from `author_assignments_roster.csv` (author 1 of each `ANN_xx`), and the admin can change them. PDFs go into the private Storage bucket `abjad-t1-pdfs` through the Edge Function `supabase/functions/abjad-t1-pdf`, which checks the portal session. Admins download them from Data & progress. |
| **T2 · Annotate** (`#/t2`) | Two steps for each item. **1. Translation:** the French sentence (`french_helper_gloss`) is shown next to its Wolofal translation (`annotator_corrected_wolofal_ajami`); the student says whether it is correct and, if not, edits the Wolofal text. **2. Sentiment preserved:** Yes, or No and a pick from positive / negative / neutral. A comment is optional. | The 8 packs in `stream_b_verification_packs` (618 rows, 538 units). Each student annotates the pack of their `ANN_xx` ID. A 5 % common set (27 units, stratified by sentiment and train/test) goes to all 8 annotators to measure agreement (Fleiss κ for translation and sentiment). The units the packs already share stay double-annotated. |

Task status (incomplete → ongoing → completed) now follows the answers automatically.
**T1 and T2 unlock together, automatically, once the student completes T0.** At that moment the student also gets the first free annotator ID (`ANN_01` … `ANN_08`). The admin can still change it on the Allocation page.

**Admin**
- **Data & progress** (`#/admin/data`):
  - live statistics for each task: coverage, Yes/No totals and No reasons, passages per author and source, progress per pack, and sentiment changes;
  - agreement scores: Fleiss κ on the common set and Cohen κ per pair, plus the list of disputed units;
  - a per-student table.
- **Exports** (CSV and JSON for each task, or one ZIP with everything). Original columns and rows are kept, and answers are added:
  - **T0:** each of the 7 CSVs gains `verified`, `verified_why`, `verified_by`, `verified_at` and `in_verification_sample`.
  - **T1:** `stream_a_author_passages.csv` (passage, word count, book title / link) and `pdf_uploads.csv` (list of uploaded PDFs).
  - **T2:** each pack with `annotator_corrected_wolofal_ajami` (the student's correction when they fixed the translation), `annotator_verified_sentiment` and `annotator_notes` filled in, plus `translation_correct`, `sentiment_confirmed`, `iaa_scope` and `annotated_at`; also `T2_common_set_all_annotators.csv`.
- **Allocation** (`#/admin/alloc`):
  - link each student to an `ANN_xx` ID; T1 and T2 follow this ID;
  - edit the T1 authors and targets;
  - spread the T0 sample again, for example after a student leaves.

**Loading the data** (`scripts/import_data.py`): the import was a one-off and has already been run. With seed 2027, re-running it gives the same draws.

## How it is built

| Part | Where |
| --- | --- |
| Front end | `index.html` + `tasks.js` / `tasks.css`: static files, no build step, no dependencies |
| Database | Supabase project `Wolofal_AbjadNLP2027` (`eknkdmesinkldvixqocz`, eu-central-1) |
| Schema | `supabase/migrations/*.sql` |

The tables are locked: row-level security is on and the public key has no
table access. The page calls only the `abjad_*` Postgres functions, and each
of them checks a session token. Admin passwords are stored as bcrypt hashes.
Repeated failed sign-ins are blocked for 15 minutes after 8 attempts.
Generating a new code or disabling a student signs them out immediately.

No passwords or participant data live in this repository. The admin account
and the participant list were loaded straight into the database.

## Hosting (GitHub Pages)

Settings → Pages → *Deploy from a branch* → `main` / root. The portal is
then served at `https://researchelmoussa.github.io/Wolofal_AbjadNLP2027/`.
Any static host works, because the page only needs to reach
`https://eknkdmesinkldvixqocz.supabase.co`.

## Adding another admin

Run in the Supabase SQL editor (replace both values):

```sql
insert into public.abjad_admins(email, password_hash)
values ('someone@example.org', extensions.crypt('a-strong-password', extensions.gen_salt('bf', 10)));
```
