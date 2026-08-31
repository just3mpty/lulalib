# Contribuer à lulalib

Merci de vous intéresser à `lulalib` ! Ce document explique comment mettre en place le
projet, les règles de style, et le processus pour proposer un changement.

## Avant de commencer

`lulalib` est un cœur volontairement minimal : un DSL déclaratif qui compile vers un
`Score` sérialisable, sans dépendance runtime et sans moteur audio. Toute contribution
doit respecter ces quelques invariants non négociables (voir aussi
[`AGENTS.md`](./AGENTS.md) pour le détail de l'API) :

- **Zéro dépendance runtime.** Le paquet publié (`dependencies` dans `package.json`)
  doit rester vide. Une dépendance de dev est acceptable ; une dépendance runtime ne
  l'est pas, sauf discussion préalable dans une issue.
- **Aucun audio, aucun I/O.** Le cœur ne joue aucun son, n'écrit aucun fichier,
  n'effectue aucun appel réseau. Il transforme du code en `Score`, un point c'est tout.
- **Le temps est exact.** Toute durée est une fraction rationnelle (`src/time/fraction.ts`),
  jamais un flottant. N'introduisez pas de calcul en virgule flottante sur des durées.
- **Immutabilité.** Chaque méthode de construction (`section`, `song`, `track`, sugar
  `bass`/`lead`/`inst`/`drums`, etc.) retourne une nouvelle valeur. Pas de mutation en
  place.
- **Le `Score` est le contrat public.** Toute modification de sa forme (`src/render/score.ts`,
  les exporters `toJSON`/`toMIDI`) est un changement potentiellement cassant : à
  signaler explicitement dans la PR.

Si un changement demande de sortir de l'un de ces principes, ouvrez une issue pour en
discuter avant d'écrire du code.

## Prérequis

- Node.js `>= 18`
- [pnpm](https://pnpm.io/) `10.30.3` (version épinglée via `packageManager` dans
  `package.json` ; `corepack enable` s'en charge automatiquement)

## Mise en place

```bash
git clone https://github.com/just3mpty/lulalib.git
cd lulalib
pnpm install
```

## Structure du projet

```
src/
  core/        combinateurs de patterns (stack, cat, fast, slow, ...)
  time/        fractions et intervalles de temps (le socle "temps exact")
  notation/    parseur de mini-notation (rythme, mélodie)
  music/       DSL public : track, section, song, sugar (bass/lead/inst/drums)
  theory/      théorie musicale : notes, gammes, tonalités, degrés
  render/      résolution d'un song en Score
  export/      exporters (toJSON, toMIDI)
  index.ts     surface publique — tout ce qui n'est pas ré-exporté ici est privé
tests/         un fichier de test par module, miroir de src/
```

`src/index.ts` est la seule source de vérité de l'API publique : si vous ajoutez une
fonction destinée aux utilisateurs, elle doit être ré-exportée depuis ce fichier.

## Workflow de développement

```bash
pnpm test          # vitest run — la suite complète
pnpm test:watch    # vitest en mode watch
pnpm coverage      # couverture (@vitest/coverage-v8)
pnpm typecheck     # tsc --noEmit
pnpm lint          # biome check .
pnpm format        # biome format --write .
pnpm build         # tsup + génération des .d.ts (tsconfig.build.json)
```

Avant d'ouvrir une pull request, ces quatre commandes doivent toutes passer sans erreur :

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

### Style de code

Le formatage et le lint sont gérés par [Biome](https://biomejs.dev/) (`biome.json`) :
indentation de 4 espaces, guillemets doubles, largeur de ligne 100, imports organisés
automatiquement. Ne discutez pas de style dans une review : lancez `pnpm format` et
laissez Biome trancher.

### Tests

- Chaque module de `src/` a son fichier miroir dans `tests/` (`src/time/fraction.ts` →
  `tests/fraction.test.ts`).
- Toute nouvelle fonction publique (exportée depuis `src/index.ts`) doit avoir des tests
  couvrant : le cas nominal, au moins un cas limite, et — si la fonction peut échouer
  (ex. parseurs de mini-notation) — le chemin d'erreur.
- Les fractions doivent être testées avec des égalités exactes (`"1/3"`, pas
  `0.333...`) : c'est tout l'intérêt de la lib.

## Commits

Le projet suit [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: add arrangement sugar (repeat, with, at, silence)
fix: resolve degree notation against the correct octave
docs: rewrite README in French
refactor: curate the public API surface
test: add tests for the MIDI exporter
build: package the library for publishing
chore: bump dependency versions
```

Un commit = un changement logique. Préférez plusieurs petits commits clairs à un seul
commit fourre-tout.

## Pull requests

1. Créez une branche depuis `main` (`feat/...`, `fix/...`, `docs/...`).
2. Committez vos changements (voir convention ci-dessus).
3. Vérifiez `pnpm typecheck && pnpm lint && pnpm test && pnpm build` en local.
4. Ouvrez la PR en décrivant **quoi** et **pourquoi** (le diff dit déjà le "comment").
   Si le changement touche la forme du `Score` ou la surface publique de `src/index.ts`,
   dites-le explicitement — c'est potentiellement un changement cassant.
5. La CI (GitHub Actions) revérifie typecheck/lint/test/build. Une review de
   [@just3mpty](https://github.com/just3mpty) (voir `.github/CODEOWNERS`) est requise
   avant fusion.

Les PR qui ajoutent une dépendance runtime, introduisent du calcul flottant sur des
durées, ou font muter un objet en place seront refusées ou demanderont une réécriture —
ce sont les invariants du projet, pas des préférences de style.

## Signaler un bug ou proposer une fonctionnalité

Ouvrez une [issue GitHub](https://github.com/just3mpty/lulalib/issues) :

- **Bug** : un extrait de code minimal qui reproduit le problème, le comportement
  attendu, le comportement observé, et la version de `lulalib`.
- **Fonctionnalité** : le cas d'usage concret que ça débloque, et si possible l'API que
  vous imaginez (signature de fonction, exemple d'appel).

Pour une vulnérabilité de sécurité, ne passez pas par une issue publique : suivez la
procédure décrite dans [`SECURITY.md`](./SECURITY.md).

## Code de conduite

Soyez respectueux et constructif dans les issues, PR et discussions. Les commentaires
insultants, le harcèlement ou la publication d'informations privées d'autrui ne sont pas
tolérés et entraînent un bannissement du dépôt.
