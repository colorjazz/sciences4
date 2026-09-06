# sciences4

Exerciseur en ligne pour **Science et technologie (ST, 055-410)** et
**Applications technologiques et scientifiques (ATS, 057-410)**, 4e secondaire —
module indépendant de `histoire4` et `math4` dans l'écosystème Corrige.moi.

## Stack

- Vite + React + TypeScript
- Pas de backend pour l'instant (front-end seul — voir section Sécurité)
- Génération de contenu via l'API Gemini (`gemini-3.6-flash` par défaut)
- Déploiement Netlify (config dans `netlify.toml`)

## Principe d'architecture — non négociable

**Gemini est appelé en direct, à chaque question, pour écrire la mise en
situation — jamais pour calculer quoi que ce soit ni décider d'une vérité
scientifique.** Il n'y a aucune banque de questions statique : chaque appel
à un module produit un texte fraîchement généré par l'IA.

Flux réel (voir `src/ai/geminiClient.ts`) :
1. Un moteur déterministe (`src/engines/*`) choisit des valeurs numériques
   aléatoires ET calcule la réponse correcte.
2. Le générateur correspondant (`src/generators/*`) envoie ces valeurs à
   Gemini avec l'instruction explicite de les reprendre telles quelles dans
   une mise en situation courte et de ne faire aucun calcul.
3. Le texte reçu est combiné à la question technique standardisée (toujours
   écrite par ce code, dans le vocabulaire exact du programme) et aux choix
   ou à la réponse déjà déterminés par le moteur.
4. La correction de l'élève est comparée à la valeur calculée à l'étape 1,
   jamais à quoi que ce soit produit par Gemini.

**Exception assumée — le balancement d'équations chimiques** : la validité
d'une équation reste vérifiée par une table de référence dans
`chimieEngine.ts` (`BANQUE_EQUATIONS`), pas laissée à l'invention libre de
Gemini. Laisser l'IA proposer ses propres réactions chimiques risquerait de
produire une équation scientifiquement fausse — un risque jugé inacceptable
vu l'exigence de rigueur du projet. Gemini n'écrit que le contexte
d'introduction autour de ces équations vérifiées, jamais les équations
elles-mêmes.

**L'application requiert une clé API Gemini valide pour fonctionner.** Il
n'y a volontairement aucun mode hors ligne ni contenu de repli : en cas
d'échec réseau ou de clé manquante, l'interface affiche un état d'erreur
explicite avec un bouton Réessayer plutôt que de servir du contenu
pré-écrit. Voir `.env.example`.

```
src/
├── types/
│   ├── curriculum.ts         # Arbres ST et ATS, structure d'épreuve, formules officielles
│   └── question.ts           # Types partagés des questions générées (QCM/courte/analyse)
├── engines/                  # Logique déterministe — AUCUN appel réseau ici
│   ├── electriciteEngine.ts  # U=RI, P=UI, E=PΔt, conversions d'unités, validation de démarche
│   ├── chimieEngine.ts       # Concentration, classification pH, banque d'équations vérifiées (ST)
│   └── mecaniqueEngine.ts    # Trains d'engrenages : sens de rotation, rapport de vitesse
├── generators/                # Combinent moteurs + appel Gemini en direct par question
│   ├── qcmGenerator.ts        # Module "Questions rapides" (Section A)
│   ├── reponseCourteGenerator.ts  # Module "Résolution guidée" (Section B)
│   └── analyseGenerator.ts    # Module "Analyse technique" (Section C)
├── ai/
│   └── geminiClient.ts       # Seul point de contact réseau avec Gemini, réponses JSON strictes
├── hooks/
│   └── useGenerationQuestion.ts  # Pilotage chargement/erreur/régénération, anti race-condition
├── components/
│   ├── ParcoursSelector/     # Choix ST ou ATS au démarrage
│   ├── PartieA/ PartieB/ PartieC/  # Les trois modules de pratique, connectés aux générateurs
│   ├── EtatsAsynchrones.tsx  # États de chargement/erreur partagés (pas de contenu de repli)
│   └── SimulateurTechnologique/  # Labo virtuel mécanismes (à venir, Three.js)
└── utils/
    └── libellesPratique.ts   # Traduit la structure ministérielle en vocabulaire de pratique
```

## Pourquoi ST et ATS sont deux arbres séparés (pas un seul avec un flag)

Contrairement à CST/TS/SN en mathématique (3 parcours d'un même programme,
contenu largement partagé), **ST et ATS sont deux programmes distincts** avec
deux épreuves distinctes. La divergence est particulièrement marquée en
Univers matériel :

- **ST seulement** : stœchiométrie, balancement d'équations, conservation de
  la masse, modèle de Rutherford-Bohr, tableau périodique, concentration/pH.
- **ATS seulement** : Fluides (Archimède, Pascal, Bernoulli), Forces et
  mouvements (Fg=mg, v=d/Δt).
- **Commun aux deux** : Électricité, Électromagnétisme, Transformation de
  l'énergie — et l'essentiel de l'Univers technologique.

Voir `src/types/curriculum.ts` pour le détail complet, avec libellés
officiels exacts du MEQ (utilisés pour la validation terminologique stricte
en Partie C).

## Sources documentaires (MEQ)

- *Cadre d'évaluation des apprentissages — Science et technologie /
  Science et technologie de l'environnement*, 2e cycle secondaire (2011)
- *Programme de formation de l'école québécoise — Applications
  technologiques et scientifiques* (chapitre 6)
- *Document d'information — Science et technologie et Applications
  technologiques et scientifiques, 4e secondaire* (2025-2026), incluant
  Annexes I, II, IV et V (concepts prescrits, formules et grandeurs)

Le contenu exact de `curriculum.ts` (structure d'épreuve, pondération par
section/univers, formules) est directement transcrit de ces annexes. Toute
mise à jour du Document d'information par le MEQ doit être répercutée ici.

## Univers vivant — exclusion volontaire

Le MEQ exclut explicitement les concepts de l'Univers vivant des épreuves
ministérielles (évaluation laissée à la discrétion de l'établissement, en
raison de la variabilité régionale des contextes). **Le générateur de
questions ne doit jamais piger dans cet univers** pour produire du contenu
d'examen. `curriculum.ts` ne le modélise donc pas du tout.

## Sécurité — à corriger avant production

Voir `.env.example`. La clé API Gemini est actuellement exposée côté client
(même limitation connue sur `math4`). Avant une mise en production réelle,
migrer les appels derrière un gateway serveur (Apps Script, Cloudflare
Worker, ou Netlify Function) plutôt que d'appeler l'API directement depuis
le navigateur.

## Démarrage local

```bash
npm install
cp .env.example .env   # puis renseigner VITE_GEMINI_API_KEY
npm run dev
```

## Déploiement

Suivre le même flux que `math4` : StackBlitz Codeflow → GitHub → Netlify
(build command `npm run build`, publish directory `dist`, déjà configuré
dans `netlify.toml`).

## État actuel

- [x] `curriculum.ts` — arbres ST/ATS complets, structure d'épreuve, formules
- [x] Sélecteur de parcours fonctionnel avec affichage de la répartition réelle
- [x] Trois moteurs déterministes (électricité, chimie ST, mécanique/engrenages)
- [x] Trois modules de pratique (ST) connectés à Gemini en direct, sans banque statique
- [x] États de chargement/erreur avec retry, sans contenu de repli
- [x] Testé : 1500+ générations simulées sans exception, dédoublonnage des distracteurs vérifié
- [x] **Banque riche d'objets assemblés** (`src/data/objetsAssembles.ts` + `AssemblyScene3D.tsx`) : géométrie 3D détaillée à la main (couronnes, moyeux, vue éclatée, surbrillance d'étape, repli CSS si WebGL indisponible), portée d'un prototype Replit. En alternance 50/50 avec la composition procédurale : la moitié du temps l'élève voit un objet richement modélisé (batteur électrique, tondeuse manuelle — banque extensible), l'autre moitié un mécanisme entièrement paramétré à la volée. Gemini varie la mise en situation même pour les objets fixes, pour limiter l'effet de répétition.
- [x] **Vue d'ensemble du poteau** (`PoteauCompletViewer.tsx`) : les deux mécanismes composés affichés à leur position réelle sur une structure fixe
- [x] **Objets techniques composés, générés par l'IA** : chaque question (voie procédurale) invente un objet composé de deux mécanismes qui interagissent
- [x] Bug corrigé : `useFrame` déplacé dans des composants "Scene" internes rendus à l'intérieur de `<Canvas>` (règle R3F)
- [x] **L'Atelier** : intègre l'application Atelier des Mécanismes
  (dépôt séparé `colorjazz/sciences4_3d`, Three.js autonome) en iframe
  plein écran (`src/components/SimulateurTechnologique/Atelier.tsx`,
  rendu en portail `document.body` — `.app-shell` anime `transform`, ce
  qui en ferait un containing block pour un `position: fixed` interne).
  Vit DANS la section « Questions d'analyse technologique » (pas un 4e
  module séparé) : `PartieC.tsx` bascule entre « Analyser un objet » et
  « L'Atelier » via un contrôle segmenté ; le bouton de retour de
  l'Atelier est contextuel (`labelRetour`), pas un texte fixe.
- [x] **Refonte visuelle** : palette chaude crème/encre brune/accent
  orange inspirée de sciences4_3d (mêmes noms de tokens CSS, valeurs
  redessinées), échelle de rayons généreuse (10-24px, remplace
  l'ancien thème « instrument de précision » à rayons serrés),
  typographie Poppins/Inter. Les trois modules reprennent les noms de
  section réels de l'épreuve (« Questions à choix multiple » / « à
  réponse construite » / « d'analyse technologique »), voir
  `src/utils/libellesPratique.ts`.
- [x] **Notation à crédit partiel** (Sections B et C) : chaque
  sous-question a son propre barème (1 à 4 points), pas juste bon/mauvais.
  Nouveau moteur déterministe `engines/notationEngine.ts` pour tout ce qui
  a une réponse objectivement vraie ; pour le texte libre, Gemini évalue
  seulement la qualité d'une explication par rapport à des critères déjà
  déterminés par ce code (`geminiClient.ts`, `corrigerReponseTexteLibre`)
  — jamais un fait scientifique. Composant partagé
  `src/components/SousQuestionBloc.tsx` utilisé par B et C.
- [x] **QCM à deux formats** (Section A) : fait unique ou tableau
  multi-faits. Les 15 questions d'une session sont générées en UN SEUL
  appel réseau à Gemini (`demanderLotMisesEnSituation`), pas un appel par
  question.
- [x] **Section C repensée** : un seul objet technique dont les
  composants mécaniques ET électriques sont analysés ensemble (fonction
  globale, `engines/circuitEngine.ts` + `CircuitViewer.tsx` pour le
  schéma SVG du circuit), avec des sous-questions notées de types variés
  (choix unique, mots de banque, texte libre) au lieu d'une simple liste
  de réponses à révéler.
- [ ] Pondération du tirage aléatoire selon la vraie répartition MEQ par univers/section
- [ ] Génération ATS (même architecture, concepts différents)
- [ ] Élargissement des Sections A/B au-delà des 5 concepts actuels
- [ ] Ajouter d'autres objets à `BANQUE_OBJETS_ASSEMBLES` dans ce standard de qualité (actuellement 2)
- [ ] Persistance (authentification, sauvegarde de progression)

## Deux familles d'objets techniques en Section C — un compromis assumé

La Section C tire maintenant au hasard entre deux approches très différentes,
avec un ratio ajustable (`PROBABILITE_ASSEMBLAGE_RICHE` dans `analyseGenerator.ts`) :

| | Composition procédurale | Banque riche (`objetsAssembles.ts`) |
|---|---|---|
| Variété de l'objet | Infinie (inventé par Gemini) | Limitée (2 objets pour l'instant) |
| Détail visuel | Schématique (formes primitives simples) | Détaillé (couronnes, moyeux, vue éclatée) |
| Valeurs numériques | Aléatoires à chaque appel | Fixes, mais vraies et cohérentes |
| Mise en situation | Générée par Gemini | Générée par Gemini (objet fixe, contexte varié) |

Ce n'est pas une contradiction cachée : la qualité visuelle d'un objet
hand-crafted comme le batteur électrique est difficile à égaler avec de la
génération procédurale à partir de paramètres aléatoires. Le compromis
choisi — alterner les deux, et faire grandir la banque riche au fil du temps
— donne à l'élève à la fois de la variété (procédural) et du détail
(banque), plutôt que de sacrifier l'un pour l'autre.

Pour ajouter un nouvel objet à la banque riche : suivre le patron de
`etapesBatteur`/`questionsBatteur` dans `objetsAssembles.ts` (données
techniques vraies, cohérentes avec la géométrie), et étendre
`AssemblyScene3D.tsx` avec un nouveau modèle 3D (`objectId` supplémentaire
dans le type `TypeObjetAssemble`).

## Architecture de composition 3D (vue d'ensemble)

Chaque visualiseur de mécanisme (`VisEcrouViewer.tsx`, `CameViewer.tsx`, etc.)
exporte maintenant **deux** choses :
- Un composant par défaut (`XxxViewer`) — autonome, avec son propre `SceneWrapper`/`Canvas`, utilisé pour les vues détaillées.
- Un composant "contenu" nommé (`XxxScene` ou `XxxContent`) — juste les
  meshes et leur animation, **sans** Canvas propre, pensé pour être
  englobé dans un `<group position/rotation/scale>` par un parent.

`MecanismeContent.tsx` dispatche vers le bon composant "contenu" selon
le type de mécanisme, et `PoteauCompletViewer.tsx` compose les deux
mécanismes de l'objet sur un poteau partagé, dans un seul `Canvas`.
Règle R3F à respecter en ajoutant un futur mécanisme : `useFrame`
doit toujours être appelé dans le composant "contenu", jamais dans le
composant qui crée le `Canvas` — sinon page blanche silencieuse.

## Pourquoi objetsTechniques.ts a été retiré

Une première version fixait une banque de 9 objets nommés (hachoir, vélo,
etc.). Elle a été abandonnée : l'élève finirait par reconnaître les mêmes
9 objets. Désormais, **l'objet lui-même est inventé par Gemini à chaque
appel** (`demanderObjetCompose` dans `geminiClient.ts`) — variété infinie
de vocabulaire et de mise en situation — tandis que tout ce qui doit rester
exact (les deux mécanismes choisis, leur cinématique, la nature de leur
interaction, les caractéristiques de la liaison et du matériau) reste
déterminé par le code, jamais par l'IA.

## Honnêteté sur les simplifications physiques (Section C)

Certaines caractérisations enseignées à ce niveau sont des conventions
pédagogiques simplifiées plutôt que des lois physiques absolues dans tous
les cas réels — documentées en commentaire à même
`transmissionEngine.ts` et `transformationEngine.ts` :
- Réversibilité par type de mécanisme (contact direct/poulie/chaîne =
  réversible ; vis sans fin, vis-écrou standard = non réversible) : ce
  sont les règles standards enseignées, pas des absolus dans tous les cas
  (dépend de l'angle de filet, du coefficient de friction, etc.).
- Bielle-manivelle et came : formules cinématiques **exactes** (pas
  d'approximation sinusoïdale), sous l'hypothèse que le piston/poussoir
  se déplace exactement le long de l'axe de rotation (aucun déport
  latéral) — cas standard enseigné.
- Came : profil circulaire excentrique uniquement (le cas le plus simple),
  pas de profil à développante ou irrégulier.

Ces choix sont documentés pour que tu puisses les confronter à ta
Progression des apprentissages ST quand tu l'auras en main.

## Limite connue de cet environnement de développement

Le sandbox utilisé pour construire ce projet n'a pas d'accès réseau sortant :
impossible d'y tester un vrai appel à l'API Gemini. La logique asynchrone
(chargement, erreur, régénération) a été validée avec un client Gemini
simulé qui reproduit les mêmes signatures — mais le premier test avec une
vraie clé API doit être fait de ton côté après déploiement.
