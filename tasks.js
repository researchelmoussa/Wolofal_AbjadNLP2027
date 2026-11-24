/* AbjadNLP 2027 · Wolofal — task workspaces (T0 Verify, T1 Augment, T2 Annotate)
   and the admin "Data & progress" / "Allocation" pages.
   Loaded after the main script in index.html; reuses its helpers ($, $$, t, rpc, store, esc, mount, toast…). */

/* ───────── translations ───────── */
Object.assign(I18N.en, {
  nav_pres:'Presentation', nav_tasks:'My tasks', nav_students:'Students', nav_data:'Data & progress', nav_alloc:'Allocation',
  hub_eyebrow:'My workspace', hub_title:'Hello <em>{name}</em>, here are your tasks.',
  hub_sub:'Every answer is saved as soon as you give it. You can stop and come back at any time.',
  hub_auto:'Start with Task 0. When it is completed, Tasks 1 and 2 unlock together. Your status in the coordinator’s table changes by itself: <b>incomplete</b> → <b>ongoing</b> after your first answer → <b>completed</b> when your share is done.',
  hub_t0:'Read sentences from the collected native Wolofal corpus and confirm whether each one really is Wolofal. If not, say why.',
  hub_t1:'Collect texts by your assigned author: upload PDFs (up to 20), document passages (up to 200), or both.',
  hub_t2:'For each sentence: 1. check the French → Wolofal translation and edit it if needed; 2. check that the sentiment is preserved.',
  t2_s1:'Translation', t2_s2:'Sentiment preserved', t2_q1:'Is the Wolofal translation of the French sentence correct?', yes_correct:'✓ Yes, correct', no_fix:'✕ No, I correct it',
  t2_fix:'Corrected Wolofal translation', t2_q2:'Does the Wolofal translation keep this sentiment?', yes_kept:'✓ Yes, preserved', proposed:'proposed',
  t2_note:'Comment (optional)', t2_guide_tr:'<b>Translation:</b> answer Yes if the Wolofal says the same thing as the French and reads naturally. Otherwise edit the Wolofal text directly.',
  err_answer_both_steps:'Answer both steps: translation and sentiment.', err_translation_unchanged:'Edit the Wolofal translation, or answer Yes if it is correct.',
  hub_t1_author:'Your author: <b>{a}</b>', not_assigned_task:'This task is not assigned to you.',
  open_t0:'Verify →', open_t1:'Contribute →', open_t2:'Annotate →', unit_sent:'sentences', unit_pass:'passages',
  locked:'🔒 Unlocks automatically when Task 0 is completed ({d} / {n}). Tasks 1 and 2 open together.',
  t0_unlocked:'Tasks 1 and 2 are now open.',
  no_items:'Nothing has been allocated to you yet. Your coordinator will open this task soon.',
  t0_eyebrow:'Task 0 · Verify', t0_title:'Is this sentence <em>Wolofal</em>?',
  t0_sub:'Item {i} of your {n}. Your set is drawn at random, and nobody else gets the same sentences.',
  t0_q:'Is this text written in Wolofal (Wolof in Arabic script)?', yes_wol:'✓ Yes, it is Wolofal', no:'✕ No',
  t0_why:'Why is it not Wolofal?', required:'(required)', ph_why:'Explain briefly (optional if you picked a reason above)',
  r_arabic:'Arabic, not Wolof', r_other_lang:'Another language', r_latin:'Latin script', r_ocr:'OCR / encoding noise', r_incomplete:'Incomplete / unreadable', r_other:'Other',
  prev:'← Previous', next:'Next →', save_next:'Save & next →', next_open:'Next unanswered', saved_auto:'Answers are saved immediately',
  my_progress:'My progress', left:'Left', yes:'Yes', guidelines:'Guidelines',
  t0_guide:'Answer <b>Yes</b> if the text is Wolof written in Arabic script, even with spelling variation or a few Arabic words in it. Answer <b>No</b> for Arabic, another language, Latin-script Wolof, OCR noise or text you cannot read. You can come back and change an answer.',
  t0_done:'🎉 You have verified all your sentences. Thank you!', keys:'Keyboard: <b>Y</b> yes · <b>N</b> no · <b>←/→</b> move',
  src:'Source', work:'Work', author:'Author', file:'File', row:'row',
  t1_eyebrow:'Task 1 · Augment', t1_title:'Texts by <em>{a}</em>', t1_sub:'Two options, use one or both as you like: upload PDFs of the author (up to {p}) or document passages (up to {n}).',
  t1_tabA:'Upload PDFs', t1_tabB:'Document passages', t1_optA:'Option A · PDFs of the author', t1_optB:'Option B · Passages',
  t1_pdf_help:'Upload scans or digital copies of works by your author (books, xasida booklets, manuscripts). PDF only, 50 MB maximum per file.',
  t1_pdf_pick:'Choose PDF files', t1_pdf_rules:'You can still add {n}. Several files at once is fine.', t1_pdf_full:'You have uploaded the maximum of 20 PDFs. Thank you!',
  t1_uploading:'Uploading {i}/{n}: {f}…', t1_pdf_done:'Upload finished', t1_view:'Open', t1_delpdf_q:'Delete this PDF?',
  t1_ref_ph:'e.g. Diwan of Samba Diarra Mbaye, p. 12 — or https://…', t1_pass_full:'You have documented the maximum of 200 passages. Thank you!',
  t1_done_rule:'Task 1 is completed when you reach {p} PDFs or {n} passages.',
  t1_new:'New passage', t1_edit:'Edit passage', t1_passage:'Wolofal passage (Arabic script)', t1_wc:'{n} words', t1_wc_ok:'✓ within 50–150', t1_wc_bad:'must be 50–150',
  t1_source:'Source collection', t1_ref:'Book title / link', t1_work:'Poem / work title', t1_doc:'Document ID', t1_genre:'Genre', t1_period:'Period',
  t1_method:'Method', m_manual:'Manual transcription', m_ocr:'OCR, then cleaned', t1_self:'The author’s self-mention (signature) was removed',
  t1_latin:'Latin-script Wolof (optional)', t1_notes:'Notes (optional)', t1_save:'Save passage', t1_cancel:'Cancel edit', t1_dup:'Exact duplicates of a passage already in the database are refused.',
  t1_where:'Where to find passages', t1_mine:'My passages', t1_none:'No passages yet.', t1_del_q:'Delete this passage?', t1_saved:'Passage saved', t1_deleted:'Passage deleted',
  s_eap:'British Library EAP334', s_eap_d:'Serigne Mbaye Diakhaté Siradji Collection — handwritten / printed Wolofal poems',
  s_bu:'Boston University African Ajami Library', s_bu_d:'Digitised manuscripts not yet in Zenodo 20392539 (e.g. Samba Diarra Mbaye, Sokhna Maïmouna Mbacké)',
  s_bk:'Senegalese printed Xasida booklets', s_bk_d:'Dakar, Touba, Tivaouane, Kaolack — transcribe / OCR-clean stanzas of 50–150 words',
  s_roster:'Suggested for your author', s_other:'Other source',
  t2_eyebrow:'Task 2 · Annotate', t2_title:'Translation & <em>sentiment</em>', t2_sub:'Item {i} of your {n} · verification pack {ann}.',
  t2_lbl:'Wolofal translation (Ajami)', t2_prop:'Proposed sentiment:', t2_q:'Do you confirm this sentiment?', yes_conf:'✓ Yes, confirm',
  t2_correct:'Sentiment of the Wolofal translation', t2_why:'Why?', ph_t2why:'e.g. descriptive sentence, no praise or complaint',
  t2_ctx:'Show more context (Latin-script Wolof, Arabic source)', ctx_fr:'French', ctx_lat:'Latin Wolof', ctx_msa:'Arabic (MSA)',
  t2_common:'Common item: every annotator labels it, to measure agreement.',
  t2_guide:'<span class="sent positive">positive</span> praise, satisfaction, hope<br><span class="sent negative" style="margin-top:6px">negative</span> complaint, blame, disappointment<br><span class="sent neutral" style="margin-top:6px">neutral</span> facts, description, mixed without a clear side',
  t2_done:'🎉 You have annotated all your items. Thank you!',
  positive:'positive', negative:'negative', neutral:'neutral',
  err_reason_required:'Please give a reason.', err_word_count:'The passage must have 50 to 150 words.', err_duplicate_passage:'This passage is already in the database.',
  err_no_author:'No author is assigned to you yet.', err_locked:'Complete Task 0 first.', err_reference_required:'Give the book title or a link.',
  err_passage_limit:'You have reached the maximum of 200 passages.', err_pdf_limit:'You have reached the maximum of 20 PDFs.', err_not_pdf:'not a PDF file',
  err_too_large:'larger than 50 MB', err_upload_missing:'the upload did not complete, try again', err_not_assigned:'This item is not assigned to you.', err_invalid_sentiment:'Choose a sentiment.',
  /* admin data */
  ad_title:'Collection dashboard', ad_sub:'Live progress of Task 0, Task 1 and Task 2. Exports keep the original file formats.',
  al_title:'Allocation', al_sub:'Link students to annotator IDs, set Task 1 authors and spread the Task 0 sample.',
  k_t0:'T0 · verified / sample', k_t0cov:'T0 · share of corpus verified', k_t1:'T1 · passages collected', k_t1a:'T1 · authors done (20 PDFs or 200 passages)',
  k_t2:'T2 · annotations done', k_t2u:'T2 · units covered', k_kappa:'T2 · Fleiss κ (common set)',
  p_t0:'Task 0 · Verify', p_t1:'Task 1 · Augment', p_t2:'Task 2 · Annotate',
  cov_target:'Coverage of the 50 % sample', verdicts:'Verdicts', no_reasons:'Reasons for “No”', by_group:'By group', by_file:'By source file',
  g_author_passages:'Author passages', g_codeswitch:'Code-switched', g_monolingual:'Monolingual lines',
  per_author:'Passages per author', by_source:'By source', words_total:'{n} words in total', pdf_per_author:'PDFs per author (max 20)', tr_fixed:'Corrected by the annotator', pdf_list:'Uploaded PDFs', pdf_total:'{n} PDFs · {s}', download:'Download',
  pack_prog:'Progress per pack', changes:'Proposed → annotator (changed)', confirmed_share:'Confirmed', agreement:'Agreement',
  fleiss:'Fleiss κ on the {n} common units ({r} answers)', cohen:'Cohen κ per pair (units shared by two packs)',
  disputed:'Disputed units (agreement below 75 %)', none_yet:'No answers yet.', pair:'Pair', units:'units',
  per_student:'Per student', th_ann:'ANN', th_t0alloc:'T0 allocated', th_t0done:'T0 done', th_yesno:'Yes / No', th_t1:'T1 passages', th_t2:'T2 done', th_lastact:'Last activity',
  exp_all:'Export everything (ZIP)', exp_csv:'CSV', exp_json:'JSON', exporting:'Preparing export…',
  al_ann:'Annotator ID', al_author:'T1 author', al_target:'Target', al_t0:'T0 allocated', al_realloc:'Spread the T0 sample again', al_realloc_q:'Give unanswered Task 0 items of students who left (or lost T0) to the active students with T0, evenly? Answered items stay where they are.',
  al_done:'T0 sample spread over {n} students.', al_authors:'Task 1 authors per annotator ID', al_students:'Students and annotator IDs', al_save:'Save', al_none:'— none —',
  al_help:'Task 1 and Task 2 follow the annotator ID: pack <code class="k">ANN_03</code> and the author of <code class="k">ANN_03</code> go to the student who holds that ID. Students get the first free ID automatically when they complete Task 0 (which unlocks Tasks 1 and 2); you can change it here.',
  al_t0help:'The Task 0 sample has {s} of {n} distinct texts (50 %). It is spread evenly over active students who have Task 0.'
});
Object.assign(I18N.fr, {
  nav_pres:'Présentation', nav_tasks:'Mes tâches', nav_students:'Étudiants', nav_data:'Données & avancement', nav_alloc:'Répartition',
  hub_eyebrow:'Mon espace', hub_title:'Bonjour <em>{name}</em>, voici vos tâches.',
  hub_sub:'Chaque réponse est enregistrée dès que vous la donnez. Vous pouvez vous arrêter et revenir à tout moment.',
  hub_auto:'Commencez par la tâche 0. Une fois terminée, les tâches 1 et 2 se débloquent en même temps. Votre statut dans le tableau du coordinateur change tout seul : <b>non terminée</b> → <b>en cours</b> après votre première réponse → <b>terminée</b> quand votre part est faite.',
  hub_t0:'Lisez des phrases du corpus wolofal natif collecté et confirmez si chacune est bien du wolofal. Sinon, dites pourquoi.',
  hub_t1:'Rassemblez des textes de votre auteur : déposez des PDF (jusqu’à 20), documentez des passages (jusqu’à 200), ou les deux.',
  hub_t2:'Pour chaque phrase : 1. vérifiez la traduction français → wolofal et corrigez-la si besoin ; 2. vérifiez que le sentiment est conservé.',
  t2_s1:'Traduction', t2_s2:'Conservation du sentiment', t2_q1:'La traduction wolofal de la phrase française est-elle correcte ?', yes_correct:'✓ Oui, correcte', no_fix:'✕ Non, je la corrige',
  t2_fix:'Traduction wolofal corrigée', t2_q2:'La traduction wolofal conserve-t-elle ce sentiment ?', yes_kept:'✓ Oui, conservé', proposed:'proposé',
  t2_note:'Commentaire (facultatif)', t2_guide_tr:'<b>Traduction :</b> répondez Oui si le wolofal dit la même chose que le français et se lit naturellement. Sinon, corrigez directement le texte wolofal.',
  err_answer_both_steps:'Répondez aux deux étapes : traduction et sentiment.', err_translation_unchanged:'Modifiez la traduction wolofal, ou répondez Oui si elle est correcte.',
  hub_t1_author:'Votre auteur : <b>{a}</b>', not_assigned_task:'Cette tâche ne vous est pas assignée.',
  open_t0:'Vérifier →', open_t1:'Contribuer →', open_t2:'Annoter →', unit_sent:'phrases', unit_pass:'passages',
  locked:'🔒 Se débloque automatiquement quand la tâche 0 est terminée ({d} / {n}). Les tâches 1 et 2 s’ouvrent en même temps.',
  t0_unlocked:'Les tâches 1 et 2 sont maintenant ouvertes.',
  no_items:'Rien ne vous a encore été attribué. Votre coordinateur ouvrira bientôt cette tâche.',
  t0_eyebrow:'Tâche 0 · Vérifier', t0_title:'Cette phrase est-elle du <em>wolofal</em> ?',
  t0_sub:'Élément {i} sur {n}. Votre lot est tiré au hasard et personne d’autre n’a les mêmes phrases.',
  t0_q:'Ce texte est-il écrit en wolofal (wolof en écriture arabe) ?', yes_wol:'✓ Oui, c’est du wolofal', no:'✕ Non',
  t0_why:'Pourquoi n’est-ce pas du wolofal ?', required:'(obligatoire)', ph_why:'Expliquez brièvement (facultatif si vous avez choisi une raison ci-dessus)',
  r_arabic:'Arabe, pas wolof', r_other_lang:'Autre langue', r_latin:'Écriture latine', r_ocr:'Bruit OCR / encodage', r_incomplete:'Incomplet / illisible', r_other:'Autre',
  prev:'← Précédent', next:'Suivant →', save_next:'Enregistrer & suivant →', next_open:'Prochain sans réponse', saved_auto:'Les réponses sont enregistrées immédiatement',
  my_progress:'Mon avancement', left:'Restant', yes:'Oui', guidelines:'Consignes',
  t0_guide:'Répondez <b>Oui</b> si le texte est du wolof en écriture arabe, même avec des variations d’orthographe ou quelques mots arabes. Répondez <b>Non</b> pour de l’arabe, une autre langue, du wolof en écriture latine, du bruit OCR ou un texte illisible. Vous pouvez revenir modifier une réponse.',
  t0_done:'🎉 Vous avez vérifié toutes vos phrases. Merci !', keys:'Clavier : <b>Y</b> oui · <b>N</b> non · <b>←/→</b> naviguer',
  src:'Source', work:'Œuvre', author:'Auteur', file:'Fichier', row:'ligne',
  t1_eyebrow:'Tâche 1 · Enrichir', t1_title:'Textes de <em>{a}</em>', t1_sub:'Deux possibilités, à combiner librement : déposer des PDF de l’auteur (jusqu’à {p}) ou documenter des passages (jusqu’à {n}).',
  t1_tabA:'Déposer des PDF', t1_tabB:'Documenter des passages', t1_optA:'Option A · PDF de l’auteur', t1_optB:'Option B · Passages',
  t1_pdf_help:'Déposez des scans ou copies numériques d’œuvres de votre auteur (livres, livrets de xasida, manuscrits). PDF uniquement, 50 Mo maximum par fichier.',
  t1_pdf_pick:'Choisir des fichiers PDF', t1_pdf_rules:'Vous pouvez encore en ajouter {n}. Plusieurs fichiers à la fois, c’est possible.', t1_pdf_full:'Vous avez déposé le maximum de 20 PDF. Merci !',
  t1_uploading:'Envoi {i}/{n} : {f}…', t1_pdf_done:'Envoi terminé', t1_view:'Ouvrir', t1_delpdf_q:'Supprimer ce PDF ?',
  t1_ref_ph:'ex. Diwan de Samba Diarra Mbaye, p. 12 — ou https://…', t1_pass_full:'Vous avez documenté le maximum de 200 passages. Merci !',
  t1_done_rule:'La tâche 1 est terminée quand vous atteignez {p} PDF ou {n} passages.',
  t1_new:'Nouveau passage', t1_edit:'Modifier le passage', t1_passage:'Passage en wolofal (écriture arabe)', t1_wc:'{n} mots', t1_wc_ok:'✓ entre 50 et 150', t1_wc_bad:'doit faire 50 à 150 mots',
  t1_source:'Collection source', t1_ref:'Titre du livre / lien', t1_work:'Titre du poème / de l’œuvre', t1_doc:'ID du document', t1_genre:'Genre', t1_period:'Période',
  t1_method:'Méthode', m_manual:'Transcription manuelle', m_ocr:'OCR puis nettoyage', t1_self:'La mention de l’auteur (signature) a été retirée',
  t1_latin:'Wolof en écriture latine (facultatif)', t1_notes:'Notes (facultatif)', t1_save:'Enregistrer le passage', t1_cancel:'Annuler la modification', t1_dup:'Les doublons exacts d’un passage déjà enregistré sont refusés.',
  t1_where:'Où trouver des passages', t1_mine:'Mes passages', t1_none:'Aucun passage pour l’instant.', t1_del_q:'Supprimer ce passage ?', t1_saved:'Passage enregistré', t1_deleted:'Passage supprimé',
  s_eap:'British Library EAP334', s_eap_d:'Collection Siradji de Serigne Mbaye Diakhaté — poèmes wolofal manuscrits / imprimés',
  s_bu:'Boston University African Ajami Library', s_bu_d:'Manuscrits numérisés absents de Zenodo 20392539 (ex. Samba Diarra Mbaye, Sokhna Maïmouna Mbacké)',
  s_bk:'Livrets de xasida imprimés au Sénégal', s_bk_d:'Dakar, Touba, Tivaouane, Kaolack — transcrire / nettoyer par OCR des strophes de 50 à 150 mots',
  s_roster:'Suggéré pour votre auteur', s_other:'Autre source',
  t2_eyebrow:'Tâche 2 · Annoter', t2_title:'Traduction & <em>sentiment</em>', t2_sub:'Élément {i} sur {n} · lot de vérification {ann}.',
  t2_lbl:'Traduction wolofal (ajami)', t2_prop:'Sentiment proposé :', t2_q:'Confirmez-vous ce sentiment ?', yes_conf:'✓ Oui, je confirme',
  t2_correct:'Sentiment de la traduction wolofal', t2_why:'Pourquoi ?', ph_t2why:'ex. phrase descriptive, ni éloge ni plainte',
  t2_ctx:'Plus de contexte (wolof en écriture latine, source arabe)', ctx_fr:'Français', ctx_lat:'Wolof latin', ctx_msa:'Arabe (MSA)',
  t2_common:'Élément commun : tous les annotateurs l’annotent, pour mesurer l’accord.',
  t2_guide:'<span class="sent positive">positif</span> éloge, satisfaction, espoir<br><span class="sent negative" style="margin-top:6px">négatif</span> plainte, reproche, déception<br><span class="sent neutral" style="margin-top:6px">neutre</span> faits, description, mitigé sans orientation claire',
  t2_done:'🎉 Vous avez annoté tous vos éléments. Merci !',
  positive:'positif', negative:'négatif', neutral:'neutre',
  err_reason_required:'Merci d’indiquer une raison.', err_word_count:'Le passage doit compter 50 à 150 mots.', err_duplicate_passage:'Ce passage est déjà enregistré.',
  err_no_author:'Aucun auteur ne vous est encore assigné.', err_locked:'Terminez d’abord la tâche 0.', err_reference_required:'Indiquez le titre du livre ou un lien.',
  err_passage_limit:'Vous avez atteint le maximum de 200 passages.', err_pdf_limit:'Vous avez atteint le maximum de 20 PDF.', err_not_pdf:'ce n’est pas un PDF',
  err_too_large:'plus de 50 Mo', err_upload_missing:'l’envoi n’a pas abouti, réessayez', err_not_assigned:'Cet élément ne vous est pas assigné.', err_invalid_sentiment:'Choisissez un sentiment.',
  ad_title:'Tableau de bord de la collecte', ad_sub:'Avancement en direct des tâches 0, 1 et 2. Les exports gardent le format des fichiers d’origine.',
  al_title:'Répartition', al_sub:'Associez les étudiants aux identifiants d’annotateur, fixez les auteurs de la tâche 1 et répartissez l’échantillon de la tâche 0.',
  k_t0:'T0 · vérifiés / échantillon', k_t0cov:'T0 · part du corpus vérifiée', k_t1:'T1 · passages collectés', k_t1a:'T1 · auteurs terminés (20 PDF ou 200 passages)',
  k_t2:'T2 · annotations faites', k_t2u:'T2 · unités couvertes', k_kappa:'T2 · κ de Fleiss (lot commun)',
  p_t0:'Tâche 0 · Vérifier', p_t1:'Tâche 1 · Enrichir', p_t2:'Tâche 2 · Annoter',
  cov_target:'Couverture de l’échantillon de 50 %', verdicts:'Verdicts', no_reasons:'Raisons des « Non »', by_group:'Par groupe', by_file:'Par fichier source',
  g_author_passages:'Passages d’auteurs', g_codeswitch:'Alternance codique', g_monolingual:'Lignes monolingues',
  per_author:'Passages par auteur', by_source:'Par source', words_total:'{n} mots au total', pdf_per_author:'PDF par auteur (max 20)', tr_fixed:'Corrigées par l’annotateur', pdf_list:'PDF déposés', pdf_total:'{n} PDF · {s}', download:'Télécharger',
  pack_prog:'Avancement par lot', changes:'Proposé → annotateur (modifiés)', confirmed_share:'Confirmés', agreement:'Accord',
  fleiss:'κ de Fleiss sur les {n} unités communes ({r} réponses)', cohen:'κ de Cohen par paire (unités partagées par deux lots)',
  disputed:'Unités en désaccord (accord inférieur à 75 %)', none_yet:'Pas encore de réponses.', pair:'Paire', units:'unités',
  per_student:'Par étudiant·e', th_ann:'ANN', th_t0alloc:'T0 attribués', th_t0done:'T0 faits', th_yesno:'Oui / Non', th_t1:'T1 passages', th_t2:'T2 faits', th_lastact:'Dernière activité',
  exp_all:'Tout exporter (ZIP)', exp_csv:'CSV', exp_json:'JSON', exporting:'Préparation de l’export…',
  al_ann:'ID annotateur', al_author:'Auteur T1', al_target:'Objectif', al_t0:'T0 attribués', al_realloc:'Répartir à nouveau l’échantillon T0', al_realloc_q:'Donner les éléments T0 sans réponse des étudiants partis (ou sans T0) aux étudiants actifs ayant T0, à parts égales ? Les éléments déjà traités restent en place.',
  al_done:'Échantillon T0 réparti sur {n} étudiants.', al_authors:'Auteurs de la tâche 1 par identifiant', al_students:'Étudiants et identifiants d’annotateur', al_save:'Enregistrer', al_none:'— aucun —',
  al_help:'Les tâches 1 et 2 suivent l’identifiant : le lot <code class="k">ANN_03</code> et l’auteur de <code class="k">ANN_03</code> vont à l’étudiant·e qui porte cet identifiant. Chaque étudiant·e reçoit automatiquement le premier identifiant libre en terminant la tâche 0 (ce qui débloque les tâches 1 et 2) ; vous pouvez le modifier ici.',
  al_t0help:'L’échantillon de la tâche 0 compte {s} des {n} textes distincts (50 %). Il est réparti à parts égales entre les étudiants actifs ayant la tâche 0.'
});

/* ───────── shared helpers ───────── */
const SENTS = ['positive','negative','neutral'];
const REASONS = ['arabic','other_lang','latin','ocr','incomplete','other'];
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const fmtN = n => Number(n || 0).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB');
const errText = e => { const k = 'err_' + e.code; return I18N.en[k] ? t(k) : e.message; };
function heroWs(eyebrow, title, sub, nav){
  return `<section class="hero ws-hero"><div class="wrap"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p>${nav || ''}</div></section>`;
}
const studentNav = on => `<div class="subnav"><a href="#/welcome"${on === 'pres' ? ' class="on"' : ''}>${esc(t('nav_pres'))}</a><a href="#/tasks"${on === 'tasks' ? ' class="on"' : ''}>${esc(t('nav_tasks'))}</a></div>`;
const progressCard = (done, total, cls, extra) => `<div class="card"><h3>${esc(t('my_progress'))}</h3>
  <div class="pnum">${fmtN(done)} / ${fmtN(total)} <span>${pct(done, total)}%</span></div><div class="bar ${cls || ''}"><i style="width:${pct(done, total)}%"></i></div>${extra || ''}</div>`;

async function studentCall(fn, args){
  try { return await rpc(fn, {p_token:store.get('wol_student'), ...args}); }
  catch (e) { if (e.code === 'not_authorized') { store.del('wol_student'); location.hash = '#/'; } throw e; }
}
async function studentShell(){
  if (!store.get('wol_student')) { location.hash = '#/'; return null; }
  app.innerHTML = loadingHtml();
  try {
    const me = await studentCall('abjad_student_tasks', {});
    setBar((me.full_name || me.email) + (me.ann_id ? ' · ' + me.ann_id : ''), true);
    return me;
  } catch (e) { app.innerHTML = `<div class="loading">${esc(t('server'))} ${esc(e.message)}</div>`; return null; }
}

/* ───────── student: hub ───────── */
async function renderTasksHub(){
  const me = await studentShell(); if (!me) return;
  const name = (me.full_name || '').trim().split(/\s+/)[0] || '';
  const mine = me.tasks || [];
  redraw = () => {
    const card = (k, title, txt, unit, href, btn, cls, extra, blocked) => {
      const p = me[k], on = mine.includes(k);
      return `<div class="card task-card ${on ? 'mine' : 'off'}"><div class="tag">${esc(t('tn' + k.slice(1)))}</div><h3>${esc(title)}</h3>
        <p>${t(txt)}${extra ? '<br>' + extra : ''}</p>
        ${on && !blocked ? (k === 'T1'
            ? `<div class="pnum">📄 ${p.pdfs} / ${p.pdf_max} PDF · ✍️ ${fmtN(p.done)} / ${fmtN(p.total)} ${esc(t(unit))} <span>${t1Pct(p)}%</span></div><div class="bar ${cls}"><i style="width:${t1Pct(p)}%"></i></div>`
            : `<div class="pnum">${fmtN(p.done)} / ${fmtN(p.total)} ${esc(t(unit))} <span>${pct(p.done, p.total)}%</span></div><div class="bar ${cls}"><i style="width:${pct(p.done, p.total)}%"></i></div>`)
          + `<a class="btn primary" href="${href}">${esc(t(btn))}</a>` : `<p class="hint">${esc(on ? t('locked', {d:fmtN(me.T0.done), n:fmtN(me.T0.total)}) : t('not_assigned_task'))}</p>`}</div>`;
    };
    app.innerHTML = heroWs(esc(t('hub_eyebrow')), t('hub_title', {name:esc(name)}), esc(t('hub_sub')), studentNav('tasks')) +
      `<div class="wrap ws-body"><div class="hub">
        ${card('T0', t('t0h'), 'hub_t0', 'unit_sent', '#/t0', 'open_t0', '', '', false)}
        ${card('T1', t('t1h'), 'hub_t1', 'unit_pass', '#/t1', 'open_t1', 'gold', me.T1.author_name ? t('hub_t1_author', {a:esc(me.T1.author_name)}) : '', !me.unlocked)}
        ${card('T2', t('t2h'), 'hub_t2', 'unit_sent', '#/t2', 'open_t2', '', '', !me.unlocked)}
      </div><p class="hint" style="margin-top:18px">${t('hub_auto')}</p></div>`;
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── student: T0 verify ───────── */
async function renderT0(){
  const me = await studentShell(); if (!me) return;
  if (!(me.tasks || []).includes('T0')) { location.hash = '#/tasks'; return; }
  let items;
  try { items = await studentCall('abjad_t0_list', {}); } catch (e) { return toast(errText(e)); }
  let i = Math.max(0, items.findIndex(x => !x.verdict)); if (i < 0) i = 0;
  let draft = null; // {verdict, reason_code, reason} being edited for items[i]
  const counts = () => ({done:items.filter(x => x.verdict).length, yes:items.filter(x => x.verdict === 'yes').length, no:items.filter(x => x.verdict === 'no').length});
  const go = k => { i = Math.min(items.length - 1, Math.max(0, k)); draft = null; redraw(); };
  redraw = () => {
    const c = counts();
    if (!items.length) {
      app.innerHTML = heroWs(esc(t('t0_eyebrow')), t('t0_title'), '', studentNav('tasks')) + `<div class="wrap ws-body"><div class="empty-state">${esc(t('no_items'))}</div></div>`;
      return;
    }
    const it = items[i];
    const d = draft || {verdict:it.verdict, reason_code:it.reason_code || '', reason:it.reason || ''};
    app.innerHTML = heroWs(esc(t('t0_eyebrow')), t('t0_title'), esc(t('t0_sub', {i:i + 1, n:items.length})), studentNav('tasks')) + `
    <div class="wrap ws-body"><div class="work">
      <div class="item">
        ${c.done === items.length ? `<div class="msg ok">${esc(t('t0_done'))} ${esc(t('t0_unlocked'))}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a class="btn sm primary" href="#/t1">${esc(t('open_t1'))}</a><a class="btn sm primary" href="#/t2">${esc(t('open_t2'))}</a></div></div>` : ''}
        <div class="item-meta"><code class="k">${esc(it.file.split('/').pop())} · ${esc(t('row'))} ${it.row}</code>
          ${it.work ? `<span class="pill t">${esc(it.work)}</span>` : ''}${it.author ? `<span class="pill t">${esc(it.author)}</span>` : ''}</div>
        <div class="ajm ${it.text.length > 300 ? 'long' : ''}" lang="wo-Arab">${esc(it.text)}</div>
        <div class="q">${esc(t('t0_q'))}</div>
        <div class="yn"><button type="button" class="yes ${d.verdict === 'yes' ? 'sel' : ''}" data-v="yes">${esc(t('yes_wol'))}</button>
          <button type="button" class="no ${d.verdict === 'no' ? 'sel' : ''}" data-v="no">${esc(t('no'))}</button></div>
        <div class="why ${d.verdict === 'no' ? '' : 'hidden'}">
          <label>${esc(t('t0_why'))} <span class="hint">${esc(t('required'))}</span></label>
          <div class="reasons">${REASONS.map(r => `<button type="button" data-r="${r}" class="${d.reason_code === r ? 'sel' : ''}">${esc(t('r_' + r))}</button>`).join('')}</div>
          <input id="t0why" value="${esc(d.reason)}" placeholder="${esc(t('ph_why'))}">
        </div>
        <div class="nav-row"><button class="btn" type="button" data-go="prev" ${i === 0 ? 'disabled' : ''}>${esc(t('prev'))}</button>
          <span class="hint">${esc(t('saved_auto'))}</span>
          <button class="btn primary" type="button" id="t0save">${esc(d.verdict && d.verdict !== it.verdict || draft ? t('save_next') : t('next'))}</button></div>
      </div>
      <div class="side">
        ${progressCard(c.done, items.length, '', `<div class="kv" style="margin-top:12px"><b>${esc(t('yes'))}</b><span>${c.yes}</span><b>${esc(t('no').replace('✕ ', ''))}</b><span>${c.no}</span><b>${esc(t('left'))}</b><span>${items.length - c.done}</span></div>
          <div class="dots">${items.map((x, k) => `<button type="button" data-k="${k}" class="${x.verdict || ''} ${k === i ? 'cur' : ''}" title="${k + 1}"></button>`).join('')}</div>
          <button class="btn sm" type="button" data-go="open" style="margin-top:12px">${esc(t('next_open'))}</button>`)}
        <div class="card"><h3>${esc(t('guidelines'))}</h3><p>${t('t0_guide')}</p><p class="hint" style="margin:0">${t('keys')}</p></div>
      </div></div></div>`;
  };
  async function save(v){
    const it = items[i];
    const d = draft || {verdict:it.verdict, reason_code:it.reason_code || '', reason:it.reason || ''};
    if (v) d.verdict = v;
    if (d.verdict === 'no') d.reason = ($('#t0why')?.value || '').trim();
    if (!d.verdict) return go(i + 1);
    if (d.verdict === 'no' && !d.reason_code && !d.reason) { draft = d; redraw(); return toast(t('err_reason_required')); }
    const same = d.verdict === it.verdict && d.reason_code === (it.reason_code || '') && d.reason === (it.reason || '');
    if (!same) {
      try { await studentCall('abjad_t0_answer', {p_id:it.id, p_verdict:d.verdict, p_reason_code:d.verdict === 'no' ? d.reason_code : '', p_reason:d.verdict === 'no' ? d.reason : ''}); }
      catch (e) { return toast(errText(e)); }
      Object.assign(it, {verdict:d.verdict, reason_code:d.verdict === 'no' ? d.reason_code : '', reason:d.verdict === 'no' ? d.reason : ''});
    }
    const nxt = items.findIndex((x, k) => k > i && !x.verdict);
    go(nxt >= 0 ? nxt : Math.min(items.length - 1, i + 1));
  }
  app.onclick = e => {
    const b = e.target.closest('button'); if (!b || !items.length) return;
    if (b.dataset.v === 'yes') return save('yes');
    if (b.dataset.v === 'no') { draft = {...(draft || {reason_code:items[i].reason_code || '', reason:items[i].reason || ''}), verdict:'no'}; redraw(); $('#t0why')?.focus(); return; }
    if (b.dataset.r) { draft = {...(draft || {verdict:'no', reason:''}), verdict:'no', reason_code:b.dataset.r, reason:$('#t0why')?.value || ''}; redraw(); return; }
    if (b.id === 't0save') return save();
    if (b.dataset.go === 'prev') return go(i - 1);
    if (b.dataset.go === 'open') { const k = items.findIndex(x => !x.verdict); return go(k >= 0 ? k : i); }
    if (b.dataset.k) return go(Number(b.dataset.k));
  };
  keyHandler = e => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) { if (e.key === 'Enter') save(); return; }
    if (e.key === 'y' || e.key === 'Y') save('yes');
    else if (e.key === 'n' || e.key === 'N') { draft = {verdict:'no', reason_code:items[i].reason_code || '', reason:items[i].reason || ''}; redraw(); }
    else if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── student: T2 annotate (1. translation, 2. sentiment) ───────── */
async function renderT2(){
  const me = await studentShell(); if (!me) return;
  if (!(me.tasks || []).includes('T2') || !me.unlocked) { location.hash = '#/tasks'; return; }
  let items;
  try { items = await studentCall('abjad_t2_list', {}); } catch (e) { return toast(errText(e)); }
  let i = Math.max(0, items.findIndex(x => !x.answer)); if (i < 0) i = 0;
  let draft = null; // {translation_ok, corrected, confirmed, sentiment, reason}
  const fresh = it => it.answer ? {...it.answer, corrected:it.answer.corrected || it.ajami} : {translation_ok:null, corrected:it.ajami, confirmed:null, sentiment:'', reason:''};
  const done = () => items.filter(x => x.answer).length;
  const go = k => { i = Math.min(items.length - 1, Math.max(0, k)); draft = null; redraw(); };
  const keep = () => { if (!draft) return; const c = $('#t2fix'), s = $('#t2sent'), n = $('#t2note'); if (c) draft.corrected = c.value; if (s) draft.sentiment = s.value; if (n) draft.reason = n.value; };
  redraw = () => {
    if (!items.length) {
      app.innerHTML = heroWs(esc(t('t2_eyebrow')), t('t2_title'), '', studentNav('tasks')) + `<div class="wrap ws-body"><div class="empty-state">${esc(t('no_items'))}</div></div>`;
      return;
    }
    const it = items[i], d = draft || fresh(it), dn = done();
    const yn = (step, val, yes, no) => `<div class="yn"><button type="button" class="yes ${val === true ? 'sel' : ''}" data-s="${step}" data-v="1">${esc(t(yes))}</button>
      <button type="button" class="no ${val === false ? 'sel' : ''}" data-s="${step}" data-v="0">${esc(t(no))}</button></div>`;
    app.innerHTML = heroWs(esc(t('t2_eyebrow')), t('t2_title'), esc(t('t2_sub', {i:i + 1, n:items.length, ann:me.ann_id})), studentNav('tasks')) + `
    <div class="wrap ws-body"><div class="work">
      <div class="item">
        ${dn === items.length ? `<div class="msg ok">${esc(t('t2_done'))}</div>` : ''}
        <div class="item-meta"><code class="k">${esc(it.unit_id)}</code>${it.common ? `<span class="pill t">${esc(t('t2_common'))}</span>` : ''}</div>

        <div class="step"><span class="step-n">1</span><h3>${esc(t('t2_s1'))}</h3></div>
        <label>${esc(t('ctx_fr'))}</label>
        <div class="fr-src" lang="fr">${esc(it.gloss_fr || '—')}</div>
        <label>${esc(t('t2_lbl'))}</label>
        <div class="ajm" lang="wo-Arab">${esc(it.ajami)}</div>
        <details class="ctx"><summary>${esc(t('t2_ctx'))}</summary><dl>
          ${it.latin ? `<dt>${esc(t('ctx_lat'))}</dt><dd>${esc(it.latin)}</dd>` : ''}
          ${it.msa ? `<dt>${esc(t('ctx_msa'))}</dt><dd dir="rtl">${esc(it.msa)}</dd>` : ''}</dl></details>
        <div class="q">${esc(t('t2_q1'))}</div>
        ${yn(1, d.translation_ok, 'yes_correct', 'no_fix')}
        <div class="why ${d.translation_ok === false ? '' : 'hidden'}">
          <label for="t2fix">${esc(t('t2_fix'))} <span class="hint">${esc(t('required'))}</span></label>
          <textarea id="t2fix" class="ajami-in" dir="rtl" lang="wo-Arab" style="min-height:110px">${esc(d.corrected)}</textarea>
        </div>

        <div class="step"><span class="step-n">2</span><h3>${esc(t('t2_s2'))}</h3></div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap"><span class="q" style="margin:0">${esc(t('t2_prop'))}</span><span class="sent ${esc(it.sentiment)}">● ${esc(t(it.sentiment))}</span></div>
        <div class="q">${esc(t('t2_q2'))}</div>
        ${yn(2, d.confirmed, 'yes_kept', 'no')}
        <div class="why ${d.confirmed === false ? '' : 'hidden'}"><div class="field" style="margin:0;max-width:320px">
          <label for="t2sent">${esc(t('t2_correct'))}</label><select id="t2sent"><option value="">—</option>
          ${SENTS.map(s => `<option value="${s}"${s === it.sentiment ? ' disabled' : ''}${d.sentiment === s && s !== it.sentiment ? ' selected' : ''}>${esc(t(s))}${s === it.sentiment ? ' (' + esc(t('proposed')) + ')' : ''}</option>`).join('')}</select></div></div>
        <div class="field"><label for="t2note">${esc(t('t2_note'))}</label><input id="t2note" value="${esc(d.reason || '')}"></div>

        <div class="nav-row"><button class="btn" type="button" data-go="prev" ${i === 0 ? 'disabled' : ''}>${esc(t('prev'))}</button>
          <span class="hint">${esc(t('saved_auto'))}</span>
          <button class="btn primary" type="button" id="t2save">${esc(draft || !it.answer ? t('save_next') : t('next'))}</button></div>
      </div>
      <div class="side">
        ${progressCard(dn, items.length, '', `<div class="dots">${items.map((x, k) => `<button type="button" data-k="${k}" class="${x.answer ? (x.answer.translation_ok && x.answer.confirmed ? 'yes' : 'no') : ''} ${k === i ? 'cur' : ''}" title="${esc(x.unit_id)}"></button>`).join('')}</div>
          <button class="btn sm" type="button" data-go="open" style="margin-top:12px">${esc(t('next_open'))}</button>`)}
        <div class="card"><h3>${esc(t('guidelines'))}</h3><p>${t('t2_guide_tr')}</p><p style="line-height:2">${t('t2_guide')}</p></div>
      </div></div></div>`;
  };
  async function save(){
    const it = items[i];
    if (!draft && it.answer) return go(i + 1);
    keep(); const d = draft || fresh(it);
    if (d.translation_ok == null || d.confirmed == null) return toast(t('err_answer_both_steps'));
    if (d.translation_ok === false && (!d.corrected.trim() || d.corrected.trim() === it.ajami.trim())) return toast(t('err_translation_unchanged'));
    if (d.confirmed === false && !d.sentiment) return toast(t('err_invalid_sentiment'));
    try {
      await studentCall('abjad_t2_answer', {p_unit:it.unit_id, p_translation_ok:d.translation_ok, p_corrected:d.translation_ok ? '' : d.corrected,
        p_confirmed:d.confirmed, p_sentiment:d.confirmed ? it.sentiment : d.sentiment, p_note:d.reason || ''});
    } catch (e) { return toast(errText(e)); }
    it.answer = {translation_ok:d.translation_ok, corrected:d.translation_ok ? '' : d.corrected, confirmed:d.confirmed,
      sentiment:d.confirmed ? it.sentiment : d.sentiment, reason:d.reason || ''};
    const nxt = items.findIndex((x, k) => k > i && !x.answer);
    go(nxt >= 0 ? nxt : Math.min(items.length - 1, i + 1));
  }
  app.onclick = e => {
    const b = e.target.closest('button'); if (!b || !items.length) return;
    if (b.dataset.s) {
      keep(); draft = draft || fresh(items[i]);
      const v = b.dataset.v === '1';
      if (b.dataset.s === '1') draft.translation_ok = v; else draft.confirmed = v;
      redraw();
      if (b.dataset.s === '1' && !v) $('#t2fix')?.focus();
      return;
    }
    if (b.id === 't2save') return save();
    if (b.dataset.go === 'prev') return go(i - 1);
    if (b.dataset.go === 'open') { const k = items.findIndex(x => !x.answer); return go(k >= 0 ? k : i); }
    if (b.dataset.k) return go(Number(b.dataset.k));
  };
  app.oninput = () => { if (draft) keep(); else if ($('#t2note') && document.activeElement === $('#t2note')) { draft = fresh(items[i]); keep(); } };
  keyHandler = e => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── student: T1 augment (two options: PDFs and/or passages) ───────── */
const FN_PDF = `${SUPABASE_URL}/functions/v1/abjad-t1-pdf`;
async function pdfCall(body){
  const r = await fetch(FN_PDF, {method:'POST', headers:{'Content-Type':'application/json', apikey:SUPABASE_KEY}, body:JSON.stringify(body)});
  let d = {}; try { d = await r.json(); } catch {}
  if (!r.ok) { const e = new Error(d.message || `Request failed (${r.status})`); e.code = d.message; throw e; }
  return d;
}
async function openPdf(token, id){
  const w = window.open('', '_blank');
  try { const {url} = await pdfCall({action:'sign', token, id}); if (w) w.location = url; else location.href = url; }
  catch (e) { if (w) w.close(); toast(errText(e)); }
}
const fmtSize = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const wordCount = s => (s || '').trim() ? s.trim().split(/\s+/).length : 0;
const t1Pct = p => Math.min(100, Math.max(pct(p.done, p.total), pct(p.pdfs || 0, p.pdf_max || 20)));
async function renderT1(){
  const me = await studentShell(); if (!me) return;
  if (!(me.tasks || []).includes('T1') || !me.unlocked) { location.hash = '#/tasks'; return; }
  let data;
  try { data = await studentCall('abjad_t1_list', {}); } catch (e) { return toast(errText(e)); }
  const au = data.author, PMAX = data.pdf_max || 20;
  let tab = store.get('wol_t1tab') || 'pdf', editing = null, form = {}, busy = '';
  const readForm = () => { if ($('#t1form')) form = {wolofal_passage:$('#t1p').value, reference:$('#t1ref').value}; };
  redraw = () => {
    if (!au) {
      app.innerHTML = heroWs(esc(t('t1_eyebrow')), t('t1h'), '', studentNav('tasks')) + `<div class="wrap ws-body"><div class="empty-state">${esc(t('err_no_author'))}</div></div>`;
      return;
    }
    const ps = data.passages, fs = data.pdfs, target = au.target;
    const f = {...form}, wc = wordCount(f.wolofal_passage), ok = wc >= 50 && wc <= 150;
    const pdfPane = `
      <div class="kicker">${esc(t('t1_optA'))} · ${fs.length} / ${PMAX}</div>
      <p class="hint" style="margin-top:0">${esc(t('t1_pdf_help'))}</p>
      ${fs.length < PMAX ? `<label class="drop" for="t1files"><input id="t1files" type="file" accept="application/pdf,.pdf" multiple hidden>
        <b>${esc(t('t1_pdf_pick'))}</b><span>${esc(t('t1_pdf_rules', {n:PMAX - fs.length}))}</span></label>` : `<div class="msg ok">${esc(t('t1_pdf_full'))}</div>`}
      ${busy ? `<div class="msg ok" id="t1busy">${esc(busy)}</div>` : ''}
      ${fs.length ? `<div class="plist" style="margin-top:14px"><table><tbody>${fs.map(x => `<tr>
        <td>📄 ${esc(x.file_name)}</td><td class="hint">${fmtSize(x.size_bytes)}</td>
        <td style="white-space:nowrap"><button class="btn sm" type="button" data-view="${x.id}">${esc(t('t1_view'))}</button> <button class="btn sm danger" type="button" data-delpdf="${x.id}">✕</button></td></tr>`).join('')}</tbody></table></div>` : ''}`;
    const passPane = `
      <form id="t1form" autocomplete="off">
        <div class="kicker">${esc(t('t1_optB'))} · ${ps.length} / ${target} ${editing ? '· ' + esc(t('t1_edit')) : ''}</div>
        ${!editing && ps.length >= target ? `<div class="msg ok">${esc(t('t1_pass_full'))}</div>` : `
        <div class="field"><label for="t1p">${esc(t('t1_passage'))}</label>
          <textarea id="t1p" class="ajami-in" dir="rtl" lang="wo-Arab" required>${esc(f.wolofal_passage || '')}</textarea>
          <div class="wc ${wc ? (ok ? 'ok' : 'bad') : ''}" id="t1wc">${esc(t('t1_wc', {n:wc}))} · ${esc(ok ? t('t1_wc_ok') : t('t1_wc_bad'))}</div></div>
        <div class="field"><label for="t1ref">${esc(t('t1_ref'))} <span class="hint">${esc(t('required'))}</span></label>
          <input id="t1ref" value="${esc(f.reference || '')}" required placeholder="${esc(t('t1_ref_ph'))}"></div>
        <div class="nav-row"><span class="hint">${esc(t('t1_dup'))}</span><span style="display:flex;gap:8px">
          ${editing ? `<button class="btn" type="button" id="t1cancel">${esc(t('t1_cancel'))}</button>` : ''}
          <button class="btn primary" type="submit">${esc(t('t1_save'))}</button></span></div>`}
      </form>`;
    app.innerHTML = heroWs(esc(t('t1_eyebrow')), t('t1_title', {a:esc(au.author_name)}), esc(t('t1_sub', {p:PMAX, n:target})), studentNav('tasks')) + `
    <div class="wrap ws-body"><div class="work">
      <div class="item">
        <div class="seg" role="tablist"><button type="button" data-tab="pdf" class="${tab === 'pdf' ? 'on' : ''}">📄 ${esc(t('t1_tabA'))} <small>${fs.length}/${PMAX}</small></button>
          <button type="button" data-tab="pass" class="${tab === 'pass' ? 'on' : ''}">✍️ ${esc(t('t1_tabB'))} <small>${ps.length}/${target}</small></button></div>
        ${tab === 'pdf' ? pdfPane : passPane}
      </div>
      <div class="side">
        <div class="card"><h3>${esc(t('my_progress'))}</h3>
          <div class="pnum">📄 PDF <span>${fs.length} / ${PMAX}</span></div><div class="bar gold"><i style="width:${pct(fs.length, PMAX)}%"></i></div>
          <div class="pnum">✍️ ${esc(t('unit_pass'))} <span>${ps.length} / ${target}</span></div><div class="bar gold"><i style="width:${pct(ps.length, target)}%"></i></div>
          <p class="hint" style="margin:10px 0 0">${esc(t('t1_done_rule', {p:PMAX, n:target}))}</p></div>
        <div class="card"><h3>${esc(t('t1_where'))}</h3>
          <div class="ref"><strong>${esc(t('s_eap'))}</strong><span>${esc(t('s_eap_d'))}</span></div>
          <div class="ref"><strong>${esc(t('s_bu'))}</strong><span>${esc(t('s_bu_d'))}</span></div>
          <div class="ref"><strong>${esc(t('s_bk'))}</strong><span>${esc(t('s_bk_d'))}</span></div>
          ${au.primary_sources ? `<div class="ref"><strong>${esc(t('s_roster'))}</strong><span>${esc(au.primary_sources)}</span></div>` : ''}</div>
        ${tab === 'pass' ? `<div class="card"><h3>${esc(t('t1_mine'))} (${ps.length})</h3>${ps.length ? `<div class="plist"><table><tbody>${ps.map((p, k) => `
          <tr><td>#${ps.length - k}</td><td>${p.word_count} w</td><td class="hint">${esc((p.reference || '').slice(0, 28))}</td>
          <td style="white-space:nowrap"><button class="btn sm" type="button" data-edit="${p.id}">✎</button> <button class="btn sm danger" type="button" data-del="${p.id}">✕</button></td></tr>`).join('')}</tbody></table></div>`
          : `<p class="hint" style="margin:0">${esc(t('t1_none'))}</p>`}</div>` : ''}
      </div></div></div>`;
    $('#t1p')?.addEventListener('input', e => {
      const n = wordCount(e.target.value), good = n >= 50 && n <= 150, el = $('#t1wc');
      el.className = 'wc ' + (n ? (good ? 'ok' : 'bad') : ''); el.textContent = `${t('t1_wc', {n})} · ${good ? t('t1_wc_ok') : t('t1_wc_bad')}`;
    });
    $('#t1form')?.addEventListener('input', readForm);
    $('#t1form')?.addEventListener('submit', async e => {
      e.preventDefault(); readForm();
      const n = wordCount(form.wolofal_passage); if (n < 50 || n > 150) return toast(t('err_word_count'));
      if (!form.reference.trim()) return toast(t('err_reference_required'));
      const btn = e.submitter; btn.disabled = true;
      try {
        const r = await studentCall('abjad_t1_save', {p_id:editing ? editing.id : null, p_row:form});
        if (editing) data.passages = data.passages.map(p => p.id === r.id ? r : p); else data.passages.unshift(r);
        editing = null; form = {reference:form.reference}; toast(t('t1_saved')); redraw();
      } catch (err) { toast(errText(err)); } finally { btn.disabled = false; }
    });
    $('#t1files')?.addEventListener('change', e => uploadPdfs([...e.target.files]));
  };
  async function uploadPdfs(files){
    const token = store.get('wol_student');
    files = files.slice(0, PMAX - data.pdfs.length);
    for (const [k, file] of files.entries()) {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { toast(`${file.name}: ${t('err_not_pdf')}`); continue; }
      if (file.size > 50 * 1048576) { toast(`${file.name}: ${t('err_too_large')}`); continue; }
      busy = t('t1_uploading', {i:k + 1, n:files.length, f:file.name}); redraw();
      try {
        const s = await pdfCall({action:'start', token, name:file.name, size:file.size});
        const fd = new FormData(); fd.append('cacheControl', '3600'); fd.append('', file);
        const up = await fetch(s.url, {method:'PUT', headers:{'x-upsert':'false'}, body:fd});
        if (!up.ok) throw new Error((await up.text()) || `Upload failed (${up.status})`);
        const row = await pdfCall({action:'finish', token, path:s.path, name:file.name});
        data.pdfs.unshift(row);
      } catch (e) { toast(`${file.name}: ${errText(e)}`); }
    }
    busy = ''; redraw(); toast(t('t1_pdf_done'));
  }
  app.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) { tab = b.dataset.tab; store.set('wol_t1tab', tab); readForm(); return redraw(); }
    if (b.id === 't1cancel') { editing = null; form = {}; return redraw(); }
    if (b.dataset.view) return openPdf(store.get('wol_student'), Number(b.dataset.view));
    if (b.dataset.delpdf) {
      if (!confirm(t('t1_delpdf_q'))) return;
      try { await pdfCall({action:'delete', token:store.get('wol_student'), id:Number(b.dataset.delpdf)}); data.pdfs = data.pdfs.filter(x => String(x.id) !== b.dataset.delpdf); toast(t('t1_deleted')); redraw(); }
      catch (err) { toast(errText(err)); }
      return;
    }
    if (b.dataset.edit) {
      editing = data.passages.find(p => String(p.id) === b.dataset.edit); form = {wolofal_passage:editing.wolofal_passage, reference:editing.reference};
      redraw(); window.scrollTo({top:0, behavior:'smooth'}); return;
    }
    if (b.dataset.del) {
      if (!confirm(t('t1_del_q'))) return;
      try { await studentCall('abjad_t1_delete', {p_id:Number(b.dataset.del)}); data.passages = data.passages.filter(p => String(p.id) !== b.dataset.del); toast(t('t1_deleted')); redraw(); }
      catch (err) { toast(errText(err)); }
    }
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── agreement statistics ───────── */
// Fleiss' kappa, allowing a different number of raters per item (items with < 2 ratings are skipped)
function fleissKappa(itemsRatings){
  const items = itemsRatings.filter(r => r.length >= 2);
  if (!items.length) return null;
  const tot = {}; let N = 0, Pbar = 0;
  for (const r of items) {
    const c = {}; r.forEach(x => { c[x] = (c[x] || 0) + 1; tot[x] = (tot[x] || 0) + 1; });
    const n = r.length; N += n;
    Pbar += (Object.values(c).reduce((s, v) => s + v * v, 0) - n) / (n * (n - 1));
  }
  Pbar /= items.length;
  const Pe = Object.values(tot).reduce((s, v) => s + (v / N) ** 2, 0);
  return Pe === 1 ? 1 : (Pbar - Pe) / (1 - Pe);
}
function cohenKappa(pairs){
  if (!pairs.length) return null;
  const po = pairs.filter(([a, b]) => a === b).length / pairs.length;
  const ca = {}, cb = {}; pairs.forEach(([a, b]) => { ca[a] = (ca[a] || 0) + 1; cb[b] = (cb[b] || 0) + 1; });
  const pe = SENTS.reduce((s, k) => s + ((ca[k] || 0) / pairs.length) * ((cb[k] || 0) / pairs.length), 0);
  return pe === 1 ? 1 : (po - pe) / (1 - pe);
}
const fmtK = k => k === null || isNaN(k) ? '—' : k.toFixed(2);
const kLabel = k => k === null ? '' : k > .8 ? 'almost perfect' : k > .6 ? 'substantial' : k > .4 ? 'moderate' : k > .2 ? 'fair' : 'slight';
function agreementStats(iaa){
  const byUnit = {};
  iaa.forEach(x => (byUnit[x.u] = byUnit[x.u] || {scope:x.scope, o:x.o, ans:[]}).ans.push(x));
  const common = Object.entries(byUnit).filter(([, v]) => v.scope === 'all');
  const fleiss = fleissKappa(common.map(([, v]) => v.ans.map(a => a.s)));
  const pairs = {};
  Object.values(byUnit).filter(v => v.scope === 'pair' && v.ans.length === 2).forEach(v => {
    const [a, b] = v.ans.sort((x, y) => x.a < y.a ? -1 : 1); (pairs[a.a + '–' + b.a] = pairs[a.a + '–' + b.a] || []).push([a.s, b.s]);
  });
  const disputed = Object.entries(byUnit).map(([u, v]) => {
    const c = {}; v.ans.forEach(a => c[a.s] = (c[a.s] || 0) + 1);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return {u, o:v.o, n:v.ans.length, agree:top[1] / v.ans.length, maj:top[0], ans:v.ans};
  }).filter(d => d.n >= 2 && d.agree < .75).sort((a, b) => a.agree - b.agree);
  return {fleiss, commonUnits:common.length, commonAnswers:common.reduce((s, [, v]) => s + v.ans.length, 0),
    pairs:Object.entries(pairs).map(([k, v]) => ({pair:k, n:v.length, k:cohenKappa(v)})).sort((a, b) => a.pair < b.pair ? -1 : 1), disputed};
}

/* ───────── exports: CSV, JSON, ZIP ───────── */
const csvCell = v => { v = v == null ? '' : String(v); return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
const toCsv = (header, rows) => '﻿' + [header, ...rows.map(r => header.map(h => r[h]))].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
function download(name, blob){
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const CRC = (() => { const tb = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tb[n] = c >>> 0; } return tb; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files){ // [{name, text}] → Blob (stored, no compression; UTF-8 names)
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  const d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)), dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate());
  for (const f of files) {
    const name = enc.encode(f.name), data = enc.encode(f.text), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, dt, 2], [12, dd, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2], [28, 0, 2]]
      .forEach(([o, v, s]) => s === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    parts.push(h, name, data);
    const c = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, dt, 2], [14, dd, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]]
      .forEach(([o, v, s]) => s === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
    central.push(c, name);
    off += 30 + name.length + data.length;
  }
  const size = central.reduce((s, p) => s + p.byteLength, 0), e = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, off, 4]].forEach(([o, v, s]) => s === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true));
  return new Blob([...parts, ...central, e], {type:'application/zip'});
}
const REASON_EN = {arabic:'Arabic, not Wolof', other_lang:'Another language', latin:'Latin script', ocr:'OCR / encoding noise', incomplete:'Incomplete / unreadable', other:'Other'};
const stamp = () => new Date().toISOString().slice(0, 10);
const base = p => p.split('/').pop();

async function buildExport(task){
  const raw = await adminCall('abjad_admin_export', {p_task:task});
  if (task === 'T0') {
    const extra = ['verified', 'verified_why', 'verified_by', 'verified_at', 'in_verification_sample'];
    const files = raw.map(f => ({name:`T0_verify/${base(f.name)}`, text:toCsv([...f.header, ...extra], (f.rows || []).map(r => ({...r.data,
      verified:r.verdict === 'yes' ? 'Yes' : r.verdict === 'no' ? 'No' : '',
      verified_why:r.verdict === 'no' ? [REASON_EN[r.reason_code] || r.reason_code, r.reason].filter(Boolean).join(': ') : '',
      verified_by:r.verdict ? r.by : '', verified_at:r.at || '', in_verification_sample:r.in_sample ? 'Yes' : 'No'})))}));
    const json = raw.map(f => ({file:f.name, rows:(f.rows || []).map(r => ({...r.data, verified:r.verdict === 'yes' ? 'Yes' : r.verdict === 'no' ? 'No' : null,
      verified_reason_code:r.reason_code || null, verified_why:r.reason || null, verified_by:r.by || null, verified_at:r.at || null, in_verification_sample:r.in_sample}))}));
    return {files, json};
  }
  if (task === 'T1') {
    const header = ['passage_id','annotator_id','author_id','author_name','word_count','wolofal_passage','reference','created_at'];
    const seq = {};
    const rows = raw.map(p => { seq[p.author_id] = (seq[p.author_id] || 0) + 1;
      return {...p, annotator_id:p.ann_id, passage_id:`${p.author_id}_P${String(seq[p.author_id]).padStart(3, '0')}`}; });
    const pdfs = await adminCall('abjad_admin_t1_pdfs', {});
    const ph = ['pdf_id','annotator_id','author_id','author_name','student','file_name','size_bytes','uploaded_at'];
    const prow = pdfs.map(f => ({pdf_id:f.id, annotator_id:f.ann_id, author_id:f.author_id, author_name:f.author_name, student:f.student, file_name:f.file_name, size_bytes:f.size_bytes, uploaded_at:f.created_at}));
    return {files:[{name:'T1_augment/stream_a_author_passages.csv', text:toCsv(header, rows)}, {name:'T1_augment/pdf_uploads.csv', text:toCsv(ph, prow)}],
      json:{passages:rows.map(r => Object.fromEntries(header.map(h => [h, r[h]]))), pdfs:prow}};
  }
  // T2
  const TR = {}; (await adminCall('abjad_admin_t2_translations', {})).forEach(x => TR[x.u + '|' + x.a] = x);
  const tr = (r, ann) => TR[r.data.unit_id + '|' + ann];
  const extra = ['translation_correct', 'sentiment_confirmed', 'iaa_scope', 'annotated_at'];
  const files = raw.files.map(f => ({name:`T2_annotate/${base(f.name)}`, text:toCsv([...f.header, ...extra], (f.rows || []).map(r => { const x = tr(r, f.ann_id); return {...r.data,
    annotator_id:f.ann_id,
    annotator_corrected_wolofal_ajami:x && x.ok === false && x.c ? x.c : r.data.annotator_corrected_wolofal_ajami,
    translation_correct:x && x.ok === true ? 'Yes' : x && x.ok === false ? 'No' : '',
    annotator_verified_sentiment:r.sentiment || r.data.annotator_verified_sentiment,
    annotator_notes:r.sentiment ? (r.reason || '') : r.data.annotator_notes,
    sentiment_confirmed:r.confirmed === true ? 'Yes' : r.confirmed === false ? 'No' : '', iaa_scope:r.scope, annotated_at:r.at || ''}; }))}));
  const anns = [...new Set(raw.files.map(f => f.ann_id))].sort();
  const commonHeader = ['unit_id','original_sentiment','annotator_corrected_wolofal_ajami', ...anns, 'n_answers', 'majority_sentiment', 'agreement', 'translation_correct_votes'];
  const commonRows = raw.common.map(c => {
    const a = c.answers || {}, ss = Object.values(a).map(x => x.sentiment), cnt = {};
    ss.forEach(s => cnt[s] = (cnt[s] || 0) + 1);
    const top = Object.entries(cnt).sort((x, y) => y[1] - x[1])[0];
    return {unit_id:c.unit_id, original_sentiment:c.data.original_sentiment, annotator_corrected_wolofal_ajami:c.data.annotator_corrected_wolofal_ajami,
      ...Object.fromEntries(anns.map(k => [k, a[k] ? a[k].sentiment : ''])), n_answers:ss.length, majority_sentiment:top ? top[0] : '', agreement:top ? (top[1] / ss.length).toFixed(2) : '',
      translation_correct_votes:ss.length ? `${anns.filter(k => TR[c.unit_id + '|' + k]?.ok === true).length}/${ss.length}` : ''};
  });
  files.push({name:'T2_annotate/T2_common_set_all_annotators.csv', text:toCsv(commonHeader, commonRows)});
  const json = {packs:raw.files.map(f => ({file:f.name, annotator_id:f.ann_id, rows:(f.rows || []).map(r => ({...r.data, annotator_id:f.ann_id,
      annotation:r.sentiment ? {translation_correct:tr(r, f.ann_id)?.ok ?? null, corrected_wolofal_ajami:tr(r, f.ann_id)?.c || null,
        sentiment:r.sentiment, sentiment_confirmed:r.confirmed, comment:r.reason, at:r.at} : null, iaa_scope:r.scope}))})),
    common_set:raw.common};
  return {files, json};
}
async function exportTask(task, kind){
  toast(t('exporting'));
  try {
    if (task === 'ALL') {
      const all = [];
      for (const k of ['T0', 'T1', 'T2']) { const x = await buildExport(k); all.push(...x.files, {name:`json/${k}.json`, text:JSON.stringify(x.json, null, 1)}); }
      return download(`wolofal-abjadnlp2027-all-tasks-${stamp()}.zip`, zip(all));
    }
    const x = await buildExport(task);
    if (kind === 'json') return download(`wolofal-abjadnlp2027-${task}-${stamp()}.json`, new Blob([JSON.stringify(x.json, null, 1)], {type:'application/json'}));
    if (x.files.length === 1) return download(`wolofal-abjadnlp2027-${task}-${stamp()}.csv`, new Blob([x.files[0].text], {type:'text/csv'}));
    download(`wolofal-abjadnlp2027-${task}-csv-${stamp()}.zip`, zip(x.files));
  } catch (e) { toast(e.message); }
}

/* ───────── admin: shared shell ───────── */
const adminNav = on => `<div class="admin-tabs subnav">${[['#/admin', 'nav_students', 'students'], ['#/admin/data', 'nav_data', 'data'], ['#/admin/alloc', 'nav_alloc', 'alloc']]
  .map(([h, k, id]) => `<a href="${h}"${on === id ? ' class="on"' : ''}>${esc(t(k))}</a>`).join('')}</div>`;
async function adminShell(){
  if (!store.get('wol_admin')) { location.hash = '#/'; return null; }
  app.innerHTML = loadingHtml();
  try {
    const me = await rpc('abjad_admin_me', {p_token:store.get('wol_admin')});
    if (!me) { store.del('wol_admin'); location.hash = '#/'; return null; }
    setBar(me.email, true); return me;
  } catch (e) { app.innerHTML = `<div class="loading">${esc(t('server'))} ${esc(e.message)}</div>`; return null; }
}
const hbar = (label, n, total, cls, right) => `<div class="hbar"><span title="${esc(label)}">${esc(label)}</span><div class="bar ${cls || ''}"><i style="width:${Math.min(100, pct(n, total))}%"></i></div><b>${right ?? fmtN(n)}</b></div>`;
const ago = d => {
  if (!d) return '—';
  const s = (Date.now() - new Date(d)) / 1000, rtf = new Intl.RelativeTimeFormat(lang, {numeric:'auto'});
  return s < 3600 ? rtf.format(-Math.round(s / 60), 'minute') : s < 86400 ? rtf.format(-Math.round(s / 3600), 'hour') : rtf.format(-Math.round(s / 86400), 'day');
};

/* ───────── admin: data & progress ───────── */
async function renderAdminData(){
  if (!await adminShell()) return;
  let S;
  let PDFS = [];
  let TRS = [];
  try { [S, PDFS, TRS] = await Promise.all([adminCall('abjad_admin_task_stats', {}), adminCall('abjad_admin_t1_pdfs', {}), adminCall('abjad_admin_t2_translations', {})]); } catch (e) { return toast(e.message); }
  const ag = agreementStats(S.t2.iaa);
  const trOk = TRS.filter(x => x.ok === true).length, trFix = TRS.filter(x => x.ok === false).length;
  const trByUnit = {}; TRS.forEach(x => (trByUnit[x.u] = trByUnit[x.u] || []).push(x.ok ? 'ok' : 'fix'));
  const commonUnits = new Set(S.t2.iaa.filter(x => x.scope === 'all').map(x => x.u));
  const fleissTr = fleissKappa([...commonUnits].map(u => trByUnit[u] || []));
  const pdfPer = {}; PDFS.forEach(f => pdfPer[f.ann_id] = (pdfPer[f.ann_id] || 0) + 1);
  const pdfBytes = PDFS.reduce((n, f) => n + Number(f.size_bytes), 0);
  redraw = () => {
    const t0 = S.t0, t1 = S.t1, t2 = S.t2;
    const atTarget = t1.authors.filter(a => a.done >= a.target || (pdfPer[a.ann_id] || 0) >= 20).length, t1target = t1.authors.reduce((s, a) => s + a.target, 0);
    const expBtns = k => `<span class="exp"><button class="btn sm" type="button" data-exp="${k}" data-kind="csv">${esc(t('exp_csv'))}</button><button class="btn sm" type="button" data-exp="${k}" data-kind="json">${esc(t('exp_json'))}</button></span>`;
    const reasons = Object.entries(t0.reasons).sort((a, b) => b[1] - a[1]);
    const changes = Object.entries(t2.changes).sort((a, b) => b[1] - a[1]);
    app.innerHTML = `
    <section class="hero admin-hero"><div class="wrap admin-head"><div><div class="eyebrow">${esc(t('a_eyebrow'))}</div><h1>${esc(t('ad_title'))}</h1><p>${esc(t('ad_sub'))}</p>${adminNav('data')}</div>
      <div class="toolbar" style="margin:0"><button class="btn gold" type="button" data-exp="ALL">${esc(t('exp_all'))}</button></div></div></section>
    <div class="wrap admin-body">
      <div class="stats">
        <div class="stat"><b>${fmtN(t0.answered)}<small style="font-size:.9rem;color:var(--muted)"> / ${fmtN(t0.sample)}</small></b><span>${esc(t('k_t0'))}</span></div>
        <div class="stat"><b>${pct(t0.answered, t0.corpus_texts)}%</b><span>${esc(t('k_t0cov'))}</span></div>
        <div class="stat"><b>${fmtN(t1.total)}<small style="font-size:.9rem;color:var(--muted)"> / ${fmtN(t1target)}</small></b><span>${esc(t('k_t1'))}</span></div>
        <div class="stat"><b>${atTarget} / ${t1.authors.length}</b><span>${esc(t('k_t1a'))}</span></div>
        <div class="stat"><b>${fmtN(t2.answered)}<small style="font-size:.9rem;color:var(--muted)"> / ${fmtN(t2.assignments)}</small></b><span>${esc(t('k_t2'))}</span></div>
        <div class="stat"><b>${fmtN(t2.units_done)}<small style="font-size:.9rem;color:var(--muted)"> / ${fmtN(t2.units)}</small></b><span>${esc(t('k_t2u'))}</span></div>
        <div class="stat"><b>${fmtK(ag.fleiss)}</b><span>${esc(t('k_kappa'))}</span></div>
      </div>
      <div class="cols3">
        <div class="panel"><h3>${esc(t('p_t0'))} ${expBtns('T0')}</h3>
          <div class="pnum">${esc(t('cov_target'))} <span>${fmtN(t0.answered)} / ${fmtN(t0.sample)}</span></div><div class="bar"><i style="width:${pct(t0.answered, t0.sample)}%"></i></div>
          <div class="sub-h">${esc(t('verdicts'))}</div>
          ${hbar(t('yes_wol').replace('✓ ', ''), t0.yes, t0.answered)}${hbar(t('no').replace('✕ ', ''), t0.no, t0.answered, 'ruby')}
          <div class="sub-h">${esc(t('no_reasons'))}</div>
          ${reasons.length ? reasons.map(([k, n]) => hbar(t('r_' + k), n, t0.no, 'ruby')).join('') : `<p class="hint">${esc(t('none_yet'))}</p>`}
          <div class="sub-h">${esc(t('by_group'))}</div>
          ${t0.groups.map(g => hbar(t('g_' + g.grp), g.answered, g.sample, '', `${fmtN(g.answered)}/${fmtN(g.sample)}`)).join('')}
          <div class="sub-h">${esc(t('by_file'))}</div>
          ${t0.files.map(f => hbar(base(f.file).replace(/^abjad_|\.csv$/g, ''), f.answered, f.rows, '', pct(f.answered, f.rows) + '%')).join('')}
        </div>
        <div class="panel"><h3>${esc(t('p_t1'))} ${expBtns('T1')}</h3>
          <div class="pnum">${esc(t('per_author'))} <span>${esc(t('words_total', {n:fmtN(t1.words)}))}</span></div>
          ${t1.authors.map(a => hbar(`${a.ann_id} · ${a.author_name}`, a.done, a.target, 'gold', `${a.done}/${a.target}`)).join('')}
          <div class="sub-h">${esc(t('pdf_per_author'))} · ${esc(t('pdf_total', {n:PDFS.length, s:fmtSize(pdfBytes)}))}</div>
          ${t1.authors.map(a => hbar(`${a.ann_id} · ${a.author_name}`, pdfPer[a.ann_id] || 0, 20, 'gold', `${pdfPer[a.ann_id] || 0}/20`)).join('')}
          <div class="sub-h">${esc(t('pdf_list'))}</div>
          ${PDFS.length ? `<div class="plist"><table class="disp"><tbody>${PDFS.map(f => `<tr><td><code class="k">${esc(f.ann_id)}</code></td><td title="${esc(f.student)}">📄 ${esc(f.file_name)}</td><td class="sub">${fmtSize(f.size_bytes)}</td>
            <td><button class="btn sm" type="button" data-pdf="${f.id}">${esc(t('download'))}</button></td></tr>`).join('')}</tbody></table></div>` : `<p class="hint">${esc(t('none_yet'))}</p>`}
        </div>
        <div class="panel"><h3>${esc(t('p_t2'))} ${expBtns('T2')}</h3>
          <div class="pnum">${esc(t('k_t2u'))} <span>${fmtN(t2.units_done)} / ${fmtN(t2.units)}</span></div><div class="bar"><i style="width:${pct(t2.units_done, t2.units)}%"></i></div>
          <div class="sub-h">${esc(t('pack_prog'))}</div>
          ${t2.packs.map(p => hbar(p.ann_id, p.answered, p.assigned, '', `${p.answered}/${p.assigned}`)).join('')}
          <div class="sub-h">${esc(t('verdicts'))}</div>
          <div class="sub-h">${esc(t('t2_s1'))}</div>
          ${hbar(t('yes_correct').replace('✓ ', ''), trOk, t2.answered)}${hbar(t('tr_fixed'), trFix, t2.answered, 'ruby')}
          <div class="sub-h">${esc(t('t2_s2'))}</div>
          ${hbar(t('confirmed_share'), t2.confirmed, t2.answered)}
          ${changes.map(([k, n]) => hbar(k.split('→').map(s => t(s)).join(' → '), n, t2.answered, 'ruby')).join('')}
        </div>
      </div>
      <div class="panel"><h3>${esc(t('agreement'))} · ${esc(t('p_t2'))}</h3>
        <div class="cols3">
          <div><div class="sub-h" style="margin-top:0">${esc(t('fleiss', {n:ag.commonUnits || S.t2.common, r:ag.commonAnswers}))}</div>
            <div class="kappa">${fmtK(ag.fleiss)}<small>${esc(t('t2_s2'))} · ${esc(kLabel(ag.fleiss))}</small></div>
            <div class="kappa" style="font-size:1.25rem;margin-top:6px">${fmtK(fleissTr)}<small>${esc(t('t2_s1'))} · ${esc(kLabel(fleissTr))}</small></div></div>
          <div><div class="sub-h" style="margin-top:0">${esc(t('cohen'))}</div>
            ${ag.pairs.length ? `<table class="disp"><tbody>${ag.pairs.map(p => `<tr><td>${esc(p.pair)}</td><td>${p.n} ${esc(t('units'))}</td><td><b>${fmtK(p.k)}</b></td></tr>`).join('')}</tbody></table>` : `<p class="hint">${esc(t('none_yet'))}</p>`}</div>
          <div><div class="sub-h" style="margin-top:0">${esc(t('disputed'))} (${ag.disputed.length})</div>
            ${ag.disputed.length ? `<div class="plist"><table class="disp"><tbody>${ag.disputed.map(d => `<tr><td><code class="k">${esc(d.u)}</code></td><td>${esc(t(d.o))} → ${d.ans.map(a => `<span class="sent ${esc(a.s)}" title="${esc(a.a + (a.r ? ': ' + a.r : ''))}" style="padding:2px 7px;font-size:.72rem;margin:1px">${esc(a.a.slice(-2))}</span>`).join('')}</td><td>${Math.round(d.agree * 100)}%</td></tr>`).join('')}</tbody></table></div>` : `<p class="hint">${esc(t('none_yet'))}</p>`}</div>
        </div></div>
      <div class="panel" style="padding:0;overflow:hidden"><div style="padding:18px 22px 4px"><h3>${esc(t('per_student'))}</h3></div>
        <div class="table-wrap" style="border:0;box-shadow:none;border-radius:0"><table>
          <thead><tr><th>${esc(t('th_student'))}</th><th>${esc(t('th_ann'))}</th><th class="gl">${esc(t('th_t0alloc'))}</th><th>${esc(t('th_t0done'))}</th><th>${esc(t('th_yesno'))}</th>
            <th class="gl">${esc(t('al_author'))}</th><th>${esc(t('th_t1'))}</th><th class="gl">${esc(t('th_t2'))}</th><th>${esc(t('th_lastact'))}</th></tr></thead>
          <tbody>${S.students.map(s => { const au = t1.authors.find(a => a.ann_id === s.ann_id); return `<tr>
            <td><b>${esc(s.full_name || '—')}</b><div class="sub">${esc(s.email)}</div></td><td>${s.ann_id ? `<code class="k">${esc(s.ann_id)}</code>` : '—'}</td>
            <td class="gl">${s.T0.total}</td><td><span class="bar mini-bar"><i style="width:${pct(s.T0.done, s.T0.total)}%"></i></span>${s.T0.done}</td><td>${s.T0.yes} / ${s.T0.no}</td>
            <td class="gl">${esc(au ? au.author_name : '—')}</td><td><span class="bar gold mini-bar"><i style="width:${pct(s.T1.done, s.T1.total)}%"></i></span>${s.T1.done}/${s.T1.total}</td>
            <td class="gl"><span class="bar mini-bar"><i style="width:${pct(s.T2.done, s.T2.total)}%"></i></span>${s.T2.done}/${s.T2.total}</td><td class="sub">${esc(ago(s.last))}</td></tr>`; }).join('')}</tbody></table></div></div>
    </div>`;
  };
  app.onclick = e => {
    const p = e.target.closest('button[data-pdf]'); if (p) return openPdf(store.get('wol_admin'), Number(p.dataset.pdf));
    const b = e.target.closest('button[data-exp]'); if (b) exportTask(b.dataset.exp, b.dataset.kind);
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── admin: allocation ───────── */
async function renderAdminAlloc(){
  if (!await adminShell()) return;
  let S;
  const load = async () => { S = await adminCall('abjad_admin_task_stats', {}); };
  try { await load(); } catch (e) { return toast(e.message); }
  const ANNS = [...new Set([...S.t1.authors.map(a => a.ann_id), ...S.t2.packs.map(p => p.ann_id)])].sort();
  redraw = () => {
    const taken = Object.fromEntries(S.students.filter(s => s.ann_id).map(s => [s.ann_id, s.id]));
    app.innerHTML = `
    <section class="hero admin-hero"><div class="wrap admin-head"><div><div class="eyebrow">${esc(t('a_eyebrow'))}</div><h1>${esc(t('al_title'))}</h1><p>${esc(t('al_sub'))}</p>${adminNav('alloc')}</div></div></section>
    <div class="wrap admin-body">
      <div class="panel"><h3>${esc(t('al_students'))}</h3><p class="hint">${t('al_help')}</p>
        <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>${esc(t('th_student'))}</th><th>${esc(t('al_ann'))}</th><th>${esc(t('al_author'))}</th><th>${esc(t('al_t0'))}</th><th>${esc(t('th_t2'))}</th></tr></thead>
        <tbody>${S.students.map(s => { const au = S.t1.authors.find(a => a.ann_id === s.ann_id); return `<tr>
          <td><b>${esc(s.full_name || '—')}</b><div class="sub">${esc(s.email)}</div>${s.active ? '' : `<span class="pill off">${esc(t('disabled'))}</span>`}</td>
          <td><select class="st" data-ann-for="${esc(s.id)}" style="min-width:130px"><option value="">${esc(t('al_none'))}</option>
            ${ANNS.map(a => `<option value="${a}"${s.ann_id === a ? ' selected' : ''}${taken[a] && taken[a] !== s.id ? ' disabled' : ''}>${a}</option>`).join('')}</select></td>
          <td>${esc(au ? au.author_name : '—')}</td><td>${s.T0.done} / ${s.T0.total}</td><td>${s.T2.done} / ${s.T2.total}</td></tr>`; }).join('')}</tbody></table></div></div>
      <div class="panel"><h3>${esc(t('p_t0'))} <button class="btn sm gold" type="button" id="realloc">${esc(t('al_realloc'))}</button></h3>
        <p class="hint" style="margin:0">${esc(t('al_t0help', {s:fmtN(S.t0.sample), n:fmtN(S.t0.corpus_texts)}))}</p></div>
      <div class="panel"><h3>${esc(t('al_authors'))}</h3>
        <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>${esc(t('al_ann'))}</th><th>Author ID</th><th>${esc(t('author'))}</th><th>${esc(t('al_target'))}</th><th></th></tr></thead>
        <tbody>${S.t1.authors.map(a => `<tr data-au="${esc(a.ann_id)}"><td><code class="k">${esc(a.ann_id)}</code></td>
          <td><input name="author_id" value="${esc(a.author_id)}" style="max-width:120px"></td><td><input name="author_name" value="${esc(a.author_name)}"><div class="sub" style="margin-top:4px">${esc(a.primary_sources || '')}</div></td>
          <td><input name="target" type="number" min="1" value="${a.target}" style="max-width:90px"></td>
          <td><button class="btn sm" type="button" data-save-au="${esc(a.ann_id)}">${esc(t('al_save'))}</button></td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  };
  app.onchange = async e => {
    const sel = e.target.closest('select[data-ann-for]'); if (!sel) return;
    sel.disabled = true;
    try { await adminCall('abjad_admin_set_ann', {p_id:sel.dataset.annFor, p_ann:sel.value}); await load(); toast(t('toast_saved')); }
    catch (err) { toast(/duplicate key/.test(err.message) ? sel.value + ' ✕' : err.message); }
    redraw();
  };
  app.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'realloc') {
      if (!confirm(t('al_realloc_q'))) return;
      try { const r = await adminCall('abjad_admin_allocate_t0', {}); await load(); redraw(); toast(t('al_done', {n:r.students})); } catch (err) { toast(err.message); }
    }
    if (b.dataset.saveAu) {
      const tr = b.closest('tr'), v = n => $(`[name=${n}]`, tr).value;
      try { await adminCall('abjad_admin_set_author', {p_ann:b.dataset.saveAu, p_author_id:v('author_id'), p_author_name:v('author_name'), p_target:Number(v('target')) || 200}); await load(); redraw(); toast(t('toast_saved')); }
      catch (err) { toast(err.message); }
    }
  };
  redraw(); window.scrollTo(0, 0);
}

/* ───────── routing hook ───────── */
let keyHandler = null;
document.addEventListener('keydown', e => { if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey && !$('dialog[open]')) keyHandler(e); });
function routeTasks(h){
  keyHandler = null; app.onclick = null; app.onchange = null;
  const map = {'#/tasks':renderTasksHub, '#/t0':renderT0, '#/t1':renderT1, '#/t2':renderT2, '#/admin/data':renderAdminData, '#/admin/alloc':renderAdminAlloc};
  const fn = map[h.split('?')[0]];
  if (fn) { fn(); return true; }
  return false;
}
route();
