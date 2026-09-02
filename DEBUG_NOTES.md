# Note de contexte — bug en cours d'investigation

## Symptôme

Dans le module "Analyse technique" (Section C), le générateur
(`src/generators/analyseGenerator.ts`) est censé alterner 50/50 entre
deux chemins :

1. **Banque riche** (`genAnalyseAssemblage`) — pioche un objet fixe
   dans `src/data/objetsAssembles.ts` (actuellement "mixer" ou
   "reel-mower") et l'affiche via `AssemblyScene3D.tsx`.
2. **Composition procédurale** (`genererQuestionAnalyseComposee`) —
   invente un mécanisme paramétré aléatoirement.

**Observé côté utilisateur** : après plusieurs régénérations, seul le
chemin procédural semble apparaître — jamais le batteur électrique ni
la tondeuse.

## Étape de diagnostic déjà proposée, pas encore confirmée

Dans `analyseGenerator.ts`, la constante :

```ts
const PROBABILITE_ASSEMBLAGE_RICHE = 0.5;
```

... doit être temporairement mise à `1` pour forcer le chemin
"banque riche" à chaque appel. Si l'objet riche apparaît quand même
absent après ce changement, c'est un vrai bug de câblage (pas de la
malchance statistique sur un tirage 50/50).

## Fichiers dont dépend ce chemin — vérifier qu'aucun n'est manquant

- `src/data/objetsAssembles.ts`
- `src/components/SimulateurTechnologique/AssemblyScene3D.tsx`
- `src/components/PartieC/AssemblagePanel.tsx`
- `src/types/question.ts` (doit exporter `DonneesAssemblage`,
  `EtapeMecanisme`, `TypeObjetAssemble`)
- `src/components/PartieC/PartieC.tsx` (doit importer `AssemblagePanel`
  et faire `{question.assemblage && <AssemblagePanel .../>}`)
- `src/ai/geminiClient.ts` (doit exporter `demanderContexteApplication`)

## Vérification déjà faite — rien trouvé côté logique

J'ai tracé manuellement les trois points de défaillance les plus probables
dans cette copie de référence, et tous sont corrects :

1. **Dispatcheur** (`analyseGenerator.ts`, ~L579) : `genererQuestionAnalyse`
   appelle bien `Math.random() < PROBABILITE_ASSEMBLAGE_RICHE` et route
   correctement vers `genAnalyseAssemblage()` ou
   `genererQuestionAnalyseComposee()`.
2. **Hook** (`useGenerationQuestion.ts`) : les erreurs sont bien capturées
   et exposées via `erreur` — aucune possibilité d'échec silencieux qui
   retomberait sur l'autre chemin sans message.
3. **Rendu** (`PartieC.tsx`, L49) : `{question.assemblage && <AssemblagePanel .../>}`
   est correctement placé avant le bloc `mecanismes3D`.

**Conclusion probable** : le bug n'est pas dans cette copie du code — il
vient très probablement d'une différence entre ce qui est ICI et ce qui
tourne réellement dans l'environnement StackBlitz de l'utilisateur (fichier
manquant, ou version antérieure de `analyseGenerator.ts` encore en place
depuis avant l'ajout du chemin "banque riche").

**Action recommandée** : plutôt que de chercher un bug de logique, diffe
ce projet contre ce qui tourne réellement dans l'environnement live de
l'utilisateur (StackBlitz), fichier par fichier, en te basant sur la
checklist ci-dessus. Si un fichier diffère ou manque là-bas, c'est la
cause la plus probable. Vérifie aussi la console navigateur (F12) pour
une éventuelle erreur avalée spécifiquement sur le chemin "banque riche".

Tout le reste du projet (Sections A, B, moteurs déterministes,
curriculum.ts) fonctionne normalement et n'est pas suspecté.
