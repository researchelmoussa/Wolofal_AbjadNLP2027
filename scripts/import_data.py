#!/usr/bin/env python3
"""Load the AbjadNLP2027-Wolofal-Data CSVs into the portal database (one-off).

    python3 scripts/import_data.py /path/to/AbjadNLP2027-Wolofal-Data-main            # dry run: prints the plan
    IMPORT_KEY=… python3 scripts/import_data.py /path/to/AbjadNLP2027-Wolofal-Data-main --load

T0 · Verify   every distinct Wolofal text of 01_collected_data/stream_a_native_wolofal is stored once;
              50 % of each group (author passages / code-switch / monolingual) is drawn into the sample.
T1 · Augment  author 1 of each annotator from author_assignments_roster.csv, target 200 passages.
T2 · Annotate the 8 stream_b verification packs; 5 % of the distinct units (drawn from the units the packs
              already share, stratified by sentiment and train/test) go to every annotator.
All draws use random seed 2027, so re-running gives the same allocation.
"""
import csv, json, os, random, sys, urllib.request
from collections import Counter, defaultdict

SEED = 2027
T0_SHARE = 0.50
T2_COMMON_SHARE = 0.05
T1_TARGET = 200
URL = 'https://eknkdmesinkldvixqocz.supabase.co/rest/v1/rpc/abjad_tmp_import'
KEY = 'sb_publishable_YU0tp2M6gKQz9TKIEQPcEw_87SRrurJ'

csv.field_size_limit(10 ** 9)
root = sys.argv[1]
A = '01_collected_data/stream_a_native_wolofal/'
B = '02_needs_human_annotation_and_review/stream_b_verification_packs/'
T0_FILES = [  # (file, group, text column) – order decides which group a shared text belongs to
    ('abjad_author_id_wolofal_seed.csv', 'author_passages', 'wolofal_passage'),
    ('abjad_author_id_wolofal_train.csv', 'author_passages', 'wolofal_passage'),
    ('abjad_author_id_wolofal_dev.csv', 'author_passages', 'wolofal_passage'),
    ('abjad_author_id_wolofal_test.csv', 'author_passages', 'wolofal_passage'),
    ('abjad_geneval_wolofal_human_seed.csv', 'author_passages', 'wolofal_passage'),
    ('abjad_language_id_wolofal_codeswitch.csv', 'codeswitch', 'text'),
    ('abjad_language_id_wolofal_monolingual.csv', 'monolingual', 'text'),
]


def read(path):
    with open(os.path.join(root, path), encoding='utf-8-sig', newline='') as f:
        r = csv.reader(f)
        header = next(r)
        return header, [dict(zip(header, row)) for row in r if row]


files, t0_texts, t0_rows = [], [], []
text_id = {}
for ord_, (name, grp, col) in enumerate(T0_FILES):
    header, rows = read(A + name)
    files.append({'name': A + name, 'task': 'T0', 'header': header, 'ord': ord_})
    for i, row in enumerate(rows):
        txt = row[col].strip()
        if txt not in text_id:
            text_id[txt] = len(t0_texts) + 1
            t0_texts.append({'id': text_id[txt], 'text': txt, 'grp': grp, 'in_sample': False})
        t0_rows.append({'file': A + name, 'row_idx': i, 'text_id': text_id[txt], 'data': row})

rnd = random.Random(SEED)
sample = []
for grp in ('author_passages', 'codeswitch', 'monolingual'):
    ids = [t['id'] for t in t0_texts if t['grp'] == grp]
    rnd.shuffle(ids)
    sample += ids[:round(len(ids) * T0_SHARE)]
rnd.shuffle(sample)
by_id = {t['id']: t for t in t0_texts}
for rank, i in enumerate(sample):
    by_id[i]['in_sample'] = True
    by_id[i]['sample_rank'] = rank

# ── T2 ──
pack_files = sorted(f for f in os.listdir(os.path.join(root, B)) if f.endswith('.csv'))
units, t2_rows, owners = {}, [], defaultdict(list)
for ord_, name in enumerate(pack_files):
    header, rows = read(B + name)
    files.append({'name': B + name, 'task': 'T2', 'header': header, 'ord': 100 + ord_})
    for i, row in enumerate(rows):
        u = row['unit_id']
        units.setdefault(u, {k: v for k, v in row.items() if k != 'annotator_id'})
        owners[u].append(row['annotator_id'])
        t2_rows.append({'file': B + name, 'row_idx': i, 'ann_id': row['annotator_id'], 'unit_id': u, 'data': row})
anns = sorted({r['ann_id'] for r in t2_rows})
shared = sorted(u for u in units if len(owners[u]) > 1)

stratum = lambda u: (units[u]['original_sentiment'], u[:2])          # sentiment × TR/TE
n_common = round(len(units) * T2_COMMON_SHARE)
dist = Counter(stratum(u) for u in units)
quota = {k: n_common * c / len(units) for k, c in dist.items()}
take = {k: int(q) for k, q in quota.items()}
for k in sorted(quota, key=lambda k: quota[k] - take[k], reverse=True)[:n_common - sum(take.values())]:
    take[k] += 1
rnd = random.Random(SEED)
pool, rest = defaultdict(list), defaultdict(list)
for u in sorted(units):
    (pool if len(owners[u]) > 1 else rest)[stratum(u)].append(u)
common = []
for k in sorted(take):          # prefer units the packs already share; top up from the stratum if short
    rnd.shuffle(pool[k]); rnd.shuffle(rest[k])
    common += (pool[k] + rest[k])[:take[k]]
assert len(common) == n_common, (len(common), n_common)
common = set(common)

assign = {}
for r in t2_rows:
    u = r['unit_id']
    assign[(u, r['ann_id'])] = 'all' if u in common else ('pair' if len(owners[u]) > 1 else 'single')
for u in common:
    for a in anns:
        assign[(u, a)] = 'all'
t2_assign = []
rnd = random.Random(SEED)
for a in anns:
    mine = sorted(u for (u, x) in assign if x == a)
    rnd.shuffle(mine)
    t2_assign += [{'unit_id': u, 'ann_id': a, 'scope': assign[(u, a)], 'position': p} for p, u in enumerate(mine)]
t2_units = [{'unit_id': u, 'data': d, 'is_common': u in common} for u, d in sorted(units.items())]

# ── T1 ──
with open(os.path.join(root, '03_additional_data_to_collect/templates/author_assignments_roster.csv'), encoding='utf-8-sig') as f:
    raw = list(csv.reader(f))
# rows with no second author are one column short in the roster: pad the empty author-2 pair
roster = [dict(zip(raw[0], r if len(r) == len(raw[0]) else r[:5] + [''] + r[5:])) for r in raw[1:] if r]
t1_authors = [{'ann_id': r['annotator_id'], 'author_id': r['assigned_author_1_id'],
               'author_name': r['assigned_author_1_name'].split(' (')[0].strip(),
               'primary_sources': r['primary_sources'], 'target': T1_TARGET} for r in roster]

print(f"T0: {len(t0_rows)} rows, {len(t0_texts)} distinct texts, sample {len(sample)} "
      f"{dict(Counter(by_id[i]['grp'] for i in sample))}")
print(f"T2: {len(t2_rows)} pack rows, {len(units)} units, {len(shared)} shared, common {len(common)} "
      f"{dict(Counter(stratum(u) for u in common))}, {len(t2_assign)} assignments "
      f"{dict(Counter(a['ann_id'] for a in t2_assign))}")
print(f"T1: {[(a['ann_id'], a['author_name']) for a in t1_authors]}")

if '--load' not in sys.argv:
    sys.exit(0)


def post(kind, rows):
    body = json.dumps({'p_key': os.environ['IMPORT_KEY'], 'p_kind': kind, 'p_rows': rows}, ensure_ascii=False).encode()
    req = urllib.request.Request(URL, body, {'apikey': KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def load(kind, rows, max_bytes=900_000):
    batch, size, total = [], 0, 0
    for row in rows + [None]:
        b = len(json.dumps(row, ensure_ascii=False)) if row else 0
        if row is None or (batch and size + b > max_bytes):
            if batch:
                total += post(kind, batch)
            batch, size = [], 0
        if row:
            batch.append(row); size += b
    print(f'  {kind}: {total}')


load('files', files)
load('t0_texts', t0_texts)
load('t0_rows', t0_rows)
load('t1_authors', t1_authors)
load('t2_units', t2_units)
load('t2_rows', t2_rows)
load('t2_assign', t2_assign)
