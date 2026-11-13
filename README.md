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

## How it is built

| Part | Where |
| --- | --- |
| Front end | `index.html`: one static page, no build step, no dependencies |
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
