import type { SectionEpreuve, UniversEvalue } from "../types/curriculum";
import type { DonneesMecanisme } from "./mecanisme3D";

export interface QuestionBase {
  id: string;
  section: SectionEpreuve;
  univers: UniversEvalue;
  conceptId: string;
  enonce: string;
}

export interface ChoixQCM {
  id: string;
  texte: string;
}

export interface QuestionQCM extends QuestionBase {
  type: "qcm";
  choix: ChoixQCM[];
  bonneReponseId: string;
  explication: string;
}

export interface QuestionCourte extends QuestionBase {
  type: "courte";
  uniteAttendue: string;
  reponseAttendue: number;
  toleranceRelative: number;
  explication: string;
  /** Étapes attendues de la démarche, affichées comme guide (pas obligatoires à remplir toutes) */
  etapesDemarche: string[];
}

export interface SousQuestionAnalyse {
  id: string;
  enonce: string;
  reponseAttendue: string;
  explication: string;
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

export interface QuestionAnalyse extends QuestionBase {
  type: "analyse";
  /** Description de l'objet technique à l'étude, affichée une fois pour tout le groupe de sous-questions */
  descriptionObjet: string;
  sousQuestions: SousQuestionAnalyse[];
  /** Données structurées de chaque mécanisme composant l'objet, pour rendu 3D */
  mecanismes3D?: DonneesMecanisme[];
  /** Alternative à mecanismes3D : objet technique riche tiré d'une banque à géométrie fixe */
  assemblage?: DonneesAssemblage;
}

export type Question = QuestionQCM | QuestionCourte | QuestionAnalyse;
