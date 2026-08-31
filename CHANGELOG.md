# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et ce projet
adhère au [Semantic Versioning](https://semver.org/lang/fr/) (tant que la version reste
en `0.x`, l'API publique peut encore changer entre deux versions mineures).

## [0.1.0] - 2026-08-31

Première version publique de `lulalib`, publiée sur npm.

### Ajouté

- Cœur de patterns : combinateurs `pure`, `stack`, `cat`, `fast`, `slow`.
- Temps exact : durées en fractions rationnelles, jamais de flottant.
- Mini-notation : parseurs rythme et mélodie (groupes, répétitions, gestion d'erreurs).
- Théorie musicale : gammes, tonalités, résolution de degrés.
- DSL de composition : `track`, `section`, `song`, sucre syntaxique `bass` / `lead` /
  `drums`.
- Arrangement : `repeat`, `with`, `at`, `silence`.
- Export : `Score` sérialisable en JSON.
- Zéro dépendance runtime, immutabilité totale sur tous les builders.
- `CONTRIBUTING.md`, `SECURITY.md` et `LICENSE` (MIT).

[0.1.0]: https://github.com/just3mpty/lulalib/releases/tag/v0.1.0
