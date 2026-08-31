# Lulalib

> Composez de la musique en écrivant du code. Lulalib est un DSL déclaratif de composition musicale pour JavaScript/TypeScript qui compile vers un **Score sérialisable**. Pas de moteur audiomais simplement une description exacte de ce qu'il faut jouer, quand, et avec quel instrument.

```ts
lead("saw").notes("C4 E4 G4");
```

## Pourquoi

- **Déclaratif** : vous décrivez une intention musicale, vous ne pilotez pas l'horloge.
- **Exact** : tout le temps est stocké en **fractions rationnelles** (`1/3 + 1/3 + 1/3 === 1`, toujours), jamais en flottants. Aucune dérive, jamais.
- **Composable** : les patterns sont des fonctions du temps ; on les empile (vertical) et on les concatène (horizontal).
- **Découplé du son** : le cœur produit un **Score** et s'arrête là. L'audio est délégué à des compagnons externes et optionnels. Le cœur n'embarque aucun audio et n'a **aucune dépendance runtime**.

## Installation

```bash
npm install lulalib
# ou : pnpm add lulalib
```

## Démarrage rapide

```ts
import { song, section, bass, drums, toJSON, toMIDI } from "lulalib";

const verse = section([
  drums("909").kick("x-x-").snare("--o-").hihat("xxxxxxxx"),
  bass("acid").notes("1 3 5 3").rhythm("x-x-xx--"),
]);

const score = song({ bpm: 128, key: "Cm" })
  .arrange([verse, verse])
  .export();

const json = toJSON(score, { pretty: true });

// Ou en MIDI pour l'importer dans votre DAW
const midi = toMIDI(score);
```

Comme la tonalité est `Cm`, `notes("1 3 5 3")` se résout en `C Eb G Eb`. Passez à `key: "C"` et le *même* code donne `C E G E` : les degrés ne sont résolus qu'au moment de l'`export()`.

## Idées centrales

Deux axes de composition :

```
              ARRANGEMENT (horizontal → cat)
              intro → verse → chorus → verse → outro
              ───────────────────────────────────────▶ temps

 SECTION      ┌─ drums (909)  ┐
 (vertical    ├─ bass  (acid) │  jouent ensemble (→ stack)
  → stack)    └─ lead  (saw)  ┘
```

- **`track` / sugar** : une partie (un instrument et un pattern). On l'écrit avec `bass()` / `lead()` / `drums()`.
- **`section([...])`** : des tracks qui jouent **simultanément**.
- **`song().arrange([...])`** : des sections **les unes après les autres**, exportées vers un Score.

Tout est **immuable** et chaînable : chaque méthode renvoie une nouvelle valeur, donc les sections et les songs se réutilisent librement.

## L'API sugar

```ts
// mélodique (bass / lead / inst sont des alias)
bass("acid").notes("C2 G2 Bb2 A2").rhythm("x-x-xx--");
lead("saw").notes("1 3 5").octave(5);

// percussions (un rythme par partie, estampillé avec `part`)
drums("909").kick("x--- x---").snare("--o- --o-").hihat("xxxxxxxx");

// sugar d'arrangement
chorus.repeat(2);
verse.with([bass("sub").notes("1")]);
at(frac(3), crash);
```

## Mini-notation

**Rythme** : la timeline. Un caractère = un pas (pas par défaut = une double-croche = `1/4` de temps).

| Symbole | Signification |
| --- | --- |
| `x` (ou tout caractère non réservé) | déclenchement |
| `-` `~` | silence |
| `_` | tenue (prolonge la note précédente d'un pas) |
| `@n` | tenue sur `n` pas (`x@4` = `x___`) |
| `[ … ]` `*n` | groupe + répétition |
| espace | ignoré (regroupement visuel) |

**Mélodie** : un pool de hauteurs, piochées par chaque déclenchement (en cyclant).

| Token | Signification |
| --- | --- |
| `C4` `Eb4` `F#3` | une note absolue |
| `C4,E4,G4` | un accord (virgules, sans espaces) |
| `1`–`7` | un **degré** de gamme (nécessite `key` ; `#`/`b` après le chiffre, `'`/`.` pour les octaves) |
| `[ … ]` `*n` | groupe + répétition |

## Sortie : le Score

`export()` (et `toScore()`) produisent un objet ordinaire, sérialisable en JSON. Le temps est exact : les fractions sont des chaînes comme `"1/2"`, jamais des flottants.

```json
{
  "version": 1,
  "bpm": 128,
  "key": "Cm",
  "duration": "2/1",
  "instruments": { "909": { "parts": ["kick", "snare", "hihat"] }, "acid": {} },
  "events": [
    { "start": "0/1", "dur": "1/4", "instrument": "909", "part": "kick" },
    { "start": "0/1", "dur": "1/4", "instrument": "acid", "note": "C4" }
  ]
}
```

## Exporters

Le Score est l'intermédiaire canonique. Les exporters sont de simples fonctions `(score) => sortie` :

- **`toJSON(score, { pretty })`** : une chaîne JSON.
- **`toMIDI(score, { ppq })`** : un `Uint8Array` de fichier MIDI standard (ouvrable dans n'importe quel DAW). Les percussions vont sur le canal 10 avec un mapping de batterie General MIDI.

## Jouer le son

Lulalib ne génère jamais d'audio. Pour *entendre* un Score, vous exportez en MIDI et l'ouvrez dans un DAW, ou vous confiez le Score à un player externe qui lit `(Score, sampleMap)`.

## Statut

Le cœur (temps, patterns), le parser (mini-notation), la composition (sections, arrangement), la théorie musicale (tonalités, degrés) et l'export JSON/MIDI sont implémentés et testés.

## Licence

MIT.
