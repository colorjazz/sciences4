/**
 * objetsAssembles.ts
 * ------------------------------------------------------------------
 * Banque d'objets techniques riches et détaillés — contrairement aux
 * mécanismes de analyseGenerator.ts (paramétrés aléatoirement à
 * chaque appel), ces objets ont une géométrie 3D et des valeurs
 * techniques FIXES, écrites à la main pour un niveau de détail visuel
 * supérieur (mandrins, couronnes, moyeux, vue éclatée, surbrillance
 * d'étape). En contrepartie, la variété vient du choix aléatoire de
 * l'objet dans cette banque et de la mise en situation régénérée par
 * Gemini à chaque appel — pas de la géométrie elle-même.
 *
 * Toutes les valeurs numériques ci-dessous (vitesses, rapports) sont
 * cohérentes avec la géométrie fixe du composant AssemblyScene3D.tsx
 * associé (nombre de dents des engrenages, etc.) — ne pas modifier
 * l'un sans l'autre.
 * ------------------------------------------------------------------
 */

import type { EtapeMecanisme, TypeObjetAssemble, SousQuestionNotee, SousQuestionTexteLibre, CircuitElectrique } from "../types/question";
import { construireCircuitSimple } from "../engines/circuitEngine";

export interface ObjetAssemble {
  id: TypeObjetAssemble;
  nom: string;
  categorie: string;
  fonctionGlobale: string;
  etapes: EtapeMecanisme[];
  questions: SousQuestionNotee[];
  /** Absent pour un objet entièrement manuel (ex. tondeuse à cylindre) */
  circuitElectrique?: CircuitElectrique;
}

/** Question ouverte notée par Gemini (voir geminiClient.ts) — le fait scientifique reste fixé ici, jamais inventé par Gemini. */
function texteLibre(params: {
  id: string;
  enonce: string;
  reponseAttendue: string;
  explication: string;
  pointsMax?: number;
}): SousQuestionTexteLibre {
  return {
    id: params.id,
    typeReponse: "texte-libre",
    enonce: params.enonce,
    bareme: { pointsMax: params.pointsMax ?? 2 },
    criteresCorrection: [params.reponseAttendue],
    reponseModele: params.reponseAttendue,
    explication: params.explication,
  };
}

const etapesBatteur: EtapeMecanisme[] = [
  {
    id: "moteur",
    label: "Moteur d'entrée",
    famille: "conversion électrique → rotation",
    entree: "230 V alternatif",
    sortie: "2 850 tr/min",
    rapport: "1 : 1",
    relation: "Le courant alimente la bobine. Le rotor entraîne le premier axe.",
    statut: "source",
  },
  {
    id: "engrenage",
    label: "Réducteur à pignons",
    famille: "transmission par engrenages",
    entree: "2 850 tr/min",
    sortie: "814 tr/min",
    rapport: "1 : 3,5",
    relation: "Le petit pignon moteur fait tourner une roue plus grande : la vitesse diminue et le couple augmente.",
    statut: "transmission",
  },
  {
    id: "courroie",
    label: "Courroie crantée",
    famille: "transmission souple",
    entree: "814 tr/min",
    sortie: "407 tr/min",
    rapport: "1 : 2",
    relation: "Les dents empêchent le glissement. La grande poulie reçoit un mouvement deux fois plus lent.",
    statut: "transmission",
  },
  {
    id: "came",
    label: "Renvoi d'entraînement",
    famille: "transmission vers les axes",
    entree: "407 tr/min",
    sortie: "rotation synchronisée",
    rapport: "1 : 1",
    relation:
      "Le renvoi entraîne le premier axe vertical. Son pignon engrène avec le second pour synchroniser les deux fouets en sens opposés.",
    statut: "transmission",
  },
  {
    id: "sortie",
    label: "Fouets rotatifs",
    famille: "effecteur",
    entree: "rotation autour de l'axe",
    sortie: "mélange régulier",
    rapport: "2 axes opposés",
    relation: "Les deux fouets tournent autour de leurs axes verticaux, en sens opposés, pour entraîner la préparation.",
    statut: "sortie",
  },
];

const questionsBatteur: SousQuestionNotee[] = [
  texteLibre({
    id: "q1",
    enonce: "Pourquoi le réducteur contient-il une grande roue après le petit pignon ?",
    reponseAttendue: "Pour réduire la vitesse de rotation (et augmenter le couple)",
    explication:
      "Une roue menée plus grande parcourt davantage de dents à chaque tour du pignon. La sortie tourne moins vite, mais elle peut fournir davantage de couple.",
  }),
  texteLibre({
    id: "q2",
    enonce: "Quelle est la fonction de la courroie crantée dans cette chaîne ?",
    reponseAttendue: "Transmettre la rotation sans glissement",
    explication:
      "Les dents de la courroie s'engrènent avec celles des poulies. La synchronisation entre les axes reste donc précise.",
  }),
  texteLibre({
    id: "q3",
    enonce: "Pourquoi les deux fouets tournent-ils autour de leurs axes verticaux ?",
    reponseAttendue: "Pour entraîner et mélanger la préparation",
    explication:
      "Le moteur fournit une rotation continue. Les engrenages, la courroie et l'arbre de sortie la transmettent aux deux fouets, qui brassent la préparation sans mouvement vertical.",
  }),
];

const etapesTondeuse: EtapeMecanisme[] = [
  {
    id: "roue-essieu",
    label: "Roue et essieu",
    famille: "transmission par roulement",
    entree: "poussée manuelle",
    sortie: "rotation de l'essieu",
    rapport: "1 : 1",
    relation: "La poussée fait rouler les roues. Leur rotation est solidaire de l'essieu qui entraîne la transmission.",
    statut: "entrée",
  },
  {
    id: "engrenage",
    label: "Engrenage latéral",
    famille: "transmission par engrenage",
    entree: "rotation de l'essieu",
    sortie: "rotation du cylindre",
    rapport: "1 : 1,3",
    relation:
      "Le pignon solidaire de l'essieu engrène directement avec celui du cylindre. Les deux rotations sont opposées et la vitesse est adaptée.",
    statut: "transmission",
  },
  {
    id: "levier",
    label: "Levier de réglage",
    famille: "commande par levier",
    entree: "effort de la main",
    sortie: "hauteur de coupe",
    rapport: "bras de levier",
    relation: "Le levier déplace le châssis par rapport aux roues pour régler la hauteur des lames au-dessus du sol.",
    statut: "réglage",
  },
];

const questionsTondeuse: SousQuestionNotee[] = [
  texteLibre({
    id: "mower-q1",
    enonce: "Comment la roue et l'essieu transmettent-ils la poussée au mécanisme ?",
    reponseAttendue: "La roue transforme le déplacement en rotation de l'essieu",
    explication:
      "Quand la tondeuse avance, les roues roulent sur le sol. Elles font tourner l'essieu, qui devient l'entrée de la transmission.",
  }),
  texteLibre({
    id: "mower-q2",
    enonce: "Quel est le rôle de l'engrenage entre l'essieu et le cylindre de coupe ?",
    reponseAttendue: "Transmettre et adapter la rotation",
    explication:
      "Les pignons restent en prise et transmettent le mouvement jusqu'au cylindre. Leur rapport peut augmenter sa vitesse pour couper efficacement l'herbe.",
  }),
  texteLibre({
    id: "mower-q3",
    enonce: "À quoi sert le levier placé sur le châssis ?",
    reponseAttendue: "Régler la hauteur de coupe",
    explication: "Le levier offre un bras de levier pour déplacer le châssis et choisir la distance entre les lames et le sol.",
  }),
];

export const BANQUE_OBJETS_ASSEMBLES: ObjetAssemble[] = [
  {
    id: "mixer",
    nom: "un batteur électrique de cuisine",
    categorie: "transmission",
    fonctionGlobale: "Mélanger des ingrédients de cuisine",
    etapes: etapesBatteur,
    questions: questionsBatteur,
    circuitElectrique: construireCircuitSimple({ interrupteur: "interrupteur-levier", sortie: "moteur" }),
  },
  {
    id: "reel-mower",
    nom: "une tondeuse à gazon manuelle à cylindre",
    categorie: "transmission",
    fonctionGlobale: "Couper le gazon sans moteur",
    etapes: etapesTondeuse,
    questions: questionsTondeuse,
    // Entièrement manuelle : aucun circuit électrique associé.
  },
];

export function choisirObjetAssembleAleatoire(): ObjetAssemble {
  return BANQUE_OBJETS_ASSEMBLES[Math.floor(Math.random() * BANQUE_OBJETS_ASSEMBLES.length)];
}
