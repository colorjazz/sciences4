import type { SectionEpreuve, UniversEvalue } from "../types/curriculum";
import type { DonneesMecanisme } from "./mecanisme3D";

export interface QuestionBase {
  id: string;
  section: SectionEpreuve;
  univers: UniversEvalue;
  conceptId: string;
  enonce: string;
}

// ============================================================
// Section A — QCM, deux formats (comme l'épreuve réelle) :
// à fait unique (une seule affirmation par choix), ou à tableau
// (plusieurs affirmations reliées, combinées dans une même grille
// A/B/C/D).
// ============================================================

export interface ChoixQCM {
  id: string;
  texte: string;
}

export interface QuestionQCMSimple extends QuestionBase {
  type: "qcm";
  choix: ChoixQCM[];
  bonneReponseId: string;
  explication: string;
}

export interface ColonneQCMTableau {
  id: string;
  titre: string;
}

export interface OptionQCMTableau {
  id: string;
  /** Une valeur par colonne (clé = ColonneQCMTableau.id) */
  valeurs: Record<string, string>;
}

export interface QuestionQCMTableau extends QuestionBase {
  type: "qcm-tableau";
  colonnes: ColonneQCMTableau[];
  options: OptionQCMTableau[];
  bonneOptionId: string;
  explication: string;
}

export type QuestionQCM = QuestionQCMSimple | QuestionQCMTableau;

// ============================================================
// Sous-questions notées à crédit partiel — utilisées par les
// sections B et C, comme les questions 16 à 25 de l'épreuve réelle
// (chaque sous-partie a/b/c/d a son propre barème, pas juste bon/
// mauvais).
//
// Principe non négociable, hérité de l'architecture du reste de
// l'appli (voir README) : Gemini ne décide JAMAIS d'une vérité
// scientifique. Pour "texte-libre", Gemini évalue seulement la
// QUALITÉ DE L'EXPLICATION de l'élève par rapport à des critères et
// une réponse modèle déjà déterminés par ce code — jamais si le fait
// scientifique lui-même est vrai. Tous les autres types de
// sous-question sont notés de façon 100 % déterministe (voir
// engines/notationEngine.ts).
// ============================================================

export interface BaremeSousQuestion {
  /** Score entier maximal (1 pour une sous-question binaire, 2-4 pour une échelle à crédit partiel) */
  pointsMax: number;
}

interface SousQuestionBase {
  id: string;
  enonce: string;
  bareme: BaremeSousQuestion;
  /** Corrigé affiché à l'élève une fois la sous-question notée */
  explication: string;
}

export interface SousQuestionNumerique extends SousQuestionBase {
  typeReponse: "numerique";
  /** Si true, un champ "démarche" (texte libre) est aussi demandé et compte dans le barème */
  demandeDemarche: boolean;
  uniteAttendue?: string;
  reponseAttendue: number;
  toleranceRelative: number;
}

export interface OptionChoix {
  id: string;
  texte: string;
}

export interface SousQuestionChoixUnique extends SousQuestionBase {
  typeReponse: "choix-unique";
  options: OptionChoix[];
  bonneOptionId: string;
}

export interface SousQuestionCasesMultiples extends SousQuestionBase {
  typeReponse: "cases-multiples";
  options: OptionChoix[];
  bonnesOptionIds: string[];
}

export interface EmplacementMotsBanque {
  id: string;
  libelle: string;
  motAttendu: string;
}

export interface SousQuestionMotsBanque extends SousQuestionBase {
  typeReponse: "mots-banque";
  banqueMots: string[];
  emplacements: EmplacementMotsBanque[];
}

export interface SousQuestionTexteLibre extends SousQuestionBase {
  typeReponse: "texte-libre";
  /** Ce qu'une réponse complète doit couvrir — transmis à Gemini comme grille de correction */
  criteresCorrection: string[];
  /** Exemple de réponse complète, transmis à Gemini pour calibrer le niveau attendu */
  reponseModele: string;
}

export type SousQuestionNotee =
  | SousQuestionNumerique
  | SousQuestionChoixUnique
  | SousQuestionCasesMultiples
  | SousQuestionMotsBanque
  | SousQuestionTexteLibre;

export interface ResultatSousQuestion {
  sousQuestionId: string;
  points: number;
  pointsMax: number;
  retroaction: string;
}

// ============================================================
// Section B — Résolution guidée : une mise en situation, puis une
// batterie de sous-questions notées (comme les questions 16 à 20).
// ============================================================

export interface QuestionCourte extends QuestionBase {
  type: "courte";
  sousQuestions: SousQuestionNotee[];
}

// ============================================================
// Objets assemblés (banque riche à géométrie fixe) — voir
// src/data/objetsAssembles.ts pour les données, et
// AssemblyScene3D.tsx pour le rendu 3D associé.
// ============================================================

export type TypeObjetAssemble = "mixer" | "reel-mower";

export interface EtapeMecanisme {
  id: string;
  label: string;
  famille: string;
  entree: string;
  sortie: string;
  rapport: string;
  relation: string;
  statut: string;
}

export interface DonneesAssemblage {
  objectId: TypeObjetAssemble;
  etapes: EtapeMecanisme[];
}

// ============================================================
// Circuit électrique (Section C) — schéma simple, symboles et
// fonctions déterminés par engines/circuitEngine.ts (table de
// référence vérifiée, jamais inventés par Gemini).
// ============================================================

export type SymboleCircuit =
  | "pile"
  | "interrupteur-poussoir"
  | "interrupteur-levier"
  | "moteur"
  | "temoin-lumineux"
  | "fusible";

export type FonctionElectrique =
  | "alimentation"
  | "commande"
  | "protection"
  | "transformation-energie"
  | "conduction"
  | "isolation";

export interface ComposantCircuit {
  id: string;
  symbole: SymboleCircuit;
  nom: string;
  fonctionElectrique: FonctionElectrique;
}

export interface CircuitElectrique {
  /** Composants dans l'ordre du circuit (boucle simple, un seul chemin) */
  composants: ComposantCircuit[];
}

// ============================================================
// Section C — Analyse technologique : UN objet (mécanique et
// électrique), comme les questions 21 à 25.
// ============================================================

export interface QuestionAnalyse extends QuestionBase {
  type: "analyse";
  /** Description de l'objet technique à l'étude, affichée une fois pour tout le groupe de sous-questions */
  descriptionObjet: string;
  /** Fonction globale de l'objet (ex. "Imprimer sur des t-shirts"), comme l'encadré de l'épreuve réelle */
  fonctionGlobale: string;
  sousQuestions: SousQuestionNotee[];
  /** Données structurées de chaque mécanisme composant l'objet, pour rendu 3D */
  mecanismes3D?: DonneesMecanisme[];
  /** Alternative à mecanismes3D : objet technique riche tiré d'une banque à géométrie fixe */
  assemblage?: DonneesAssemblage;
  /** Circuit électrique associé à l'objet, si l'analyse couvre aussi ses composants électriques */
  circuitElectrique?: CircuitElectrique;
}

export type Question = QuestionQCM | QuestionCourte | QuestionAnalyse;
