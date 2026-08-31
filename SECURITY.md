# Politique de sécurité

## Périmètre de la librairie

`lulalib` est une librairie purement fonctionnelle : elle prend en entrée des appels de
DSL et des chaînes de mini-notation, et produit en sortie un objet `Score` sérialisable
(JSON) ou un `Uint8Array` (fichier MIDI). Concrètement, cela signifie que le cœur :

- **n'a aucune dépendance runtime** (`dependencies` vide dans `package.json`) ;
- **ne fait aucun appel réseau** ;
- **ne lit ni n'écrit sur le système de fichiers** ;
- **n'exécute aucun code dynamique** (pas d'`eval`, pas de `new Function`) ;
- **ne génère aucun audio** et ne pilote aucune horloge en temps réel.

La surface d'attaque classique (injection réseau, désérialisation dangereuse, RCE via
dépendance compromise) est donc structurellement réduite. Cela ne veut pas dire que la
librairie est exempte de bugs de sécurité — voir la section suivante pour ce qui reste
pertinent à signaler.

### Ce qui reste dans le périmètre

- **Déni de service algorithmique dans le parseur de mini-notation**
  (`src/notation/rhythm.ts`, `src/notation/melody.ts`). La syntaxe supporte des groupes
  imbriqués avec répétition (`[ ... ]*n`) ; un pattern malicieusement construit avec des
  répétitions imbriquées (`[[[x]*1000]*1000]*1000`) peut faire exploser le nombre
  d'événements générés et bloquer le thread appelant. Si votre application accepte des
  chaînes de mini-notation venant d'un utilisateur final (par ex. un éditeur en ligne),
  traitez-les comme une entrée non fiable : bornez la taille/profondeur acceptée avant
  de les passer à `parseRhythm`/`parseMelody`.
- **Corruption de la sortie `Score`/MIDI** : tout bug qui produirait un `Score` ou un
  fichier MIDI structurellement invalide (champs incohérents, `Uint8Array` malformé) est
  considéré comme un problème de sécurité si un consommateur en aval (DAW, parseur MIDI
  tiers) peut en tirer un comportement dangereux via un fichier corrompu.
- **Prototype pollution / injection via les chaînes utilisateur** (nom d'instrument,
  tonalité, mini-notation) dans le cœur ou les exporters.
- **Toute régression sur les invariants du cœur** (voir `CONTRIBUTING.md`) qui aurait un
  impact sécurité, par exemple une mutation en place qui ferait fuiter un état partagé
  entre deux `Score` indépendants.

### Hors périmètre

- Le comportement d'un moteur audio ou d'un player tiers qui consomme un `Score` :
  `lulalib` ne génère aucun son et n'est responsable d'aucun code exécuté en aval.
- Les outils de développement (`vitest`, `tsup`, `biome`) et leurs propres
  vulnérabilités : signalez-les directement aux mainteneurs de ces projets. Une mise à
  jour de ces dépendances de dev dans `lulalib` reste bienvenue via une PR normale
  (voir `CONTRIBUTING.md`), pas via cette procédure.

## Versions supportées

`lulalib` est en version `0.x` (pré-1.0) : l'API peut encore changer. Seule la **dernière
version publiée sur npm** reçoit des correctifs de sécurité. Il n'y a pas de
rétroportage vers des versions antérieures.

| Version | Supportée |
| --- | --- |
| dernière version `0.x` publiée | ✅ |
| toute version antérieure | ❌ |

Ce tableau sera mis à jour au passage en `1.0.0`, avec une politique de rétroportage
explicite si nécessaire.

## Signaler une vulnérabilité

**Ne créez pas d'issue publique pour une vulnérabilité de sécurité.**

Utilisez plutôt les [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
du dépôt : onglet **Security → Report a vulnerability** sur
[github.com/just3mpty/lulalib](https://github.com/just3mpty/lulalib). Cela ouvre un
échange privé avec le mainteneur, sans exposer le détail avant qu'un correctif soit
disponible.

Merci d'inclure :

- une description du problème et de son impact potentiel ;
- un extrait de code minimal permettant de reproduire (idéalement autonome, sans
  dépendance externe) ;
- la version de `lulalib` concernée (`npm ls lulalib` ou le contenu de `package.json`) ;
- si possible, une suggestion de correctif ou de contournement.

### Ce à quoi vous attendre

`lulalib` est maintenu par une seule personne, sur son temps libre : il n'y a pas de SLA
contractuel ni de programme de bug bounty. À titre indicatif :

- accusé de réception : sous 7 jours ;
- évaluation initiale (sévérité, prise en charge ou non) : sous 14 jours ;
- correctif et publication, une fois la vulnérabilité confirmée : au mieux, en fonction
  de la sévérité et de la disponibilité du mainteneur.

Un correctif accepté donne lieu à une divulgation coordonnée : publication d'un
correctif d'abord, puis d'un GitHub Security Advisory décrivant le problème, avec
crédit au rapporteur si souhaité.

## Bonnes pratiques pour les intégrateurs

- Épinglez une version précise de `lulalib` dans votre `package.json` et mettez à jour
  consciemment plutôt que de suivre `latest` automatiquement tant que la librairie est
  en `0.x`.
- Si vous exposez un champ de saisie de mini-notation à des utilisateurs non fiables
  (voir plus haut), validez la longueur et la profondeur d'imbrication avant de la
  transmettre au parseur.
- Le `Score` produit est un objet JSON ordinaire : traitez-le comme n'importe quelle
  donnée provenant de votre application, pas comme une entrée qui nécessiterait un
  sandboxing particulier une fois produit par `lulalib`.
