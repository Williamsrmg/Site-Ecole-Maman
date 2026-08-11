export type AnneeScolaire = {
  id: string
  libelle: string
  niveau: string
  actif: boolean
}

export type JourSemaine =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"

export type Eleve = {
  id: string
  annee_scolaire_id: string
  initiales: string
  nom: string
  prenom: string
  sexe: "M" | "F"
  date_naissance: string
  assurance: boolean
  date_assurance: string | null
  montant_cooperative: number
  notes: string | null
}

export type Creneau = {
  id: string
  annee_scolaire_id: string
  jour_semaine: JourSemaine
  heure_debut: string
  heure_fin: string
  matiere: string
  couleur: string
  notes: string | null
  recurrence: "hebdo" | "ponctuel"
  date_specifique: string | null
}

export type CategorieTemps = {
  id: string
  libelle: string
  quota_heures: number
}

export type EvenementPlanner = {
  id: string
  categorie_id: string
  titre: string
  date: string
  heure_debut: string
  heure_fin: string
  notes: string | null
}

export type Seance = {
  id: string
  annee_scolaire_id: string
  date: string
  creneau_id: string | null
  titre: string
  matiere: string
  objectifs: string | null
  materiel_prevoir: string | null
  bilan_seance: string | null
  termine: boolean
  ordre: number
}

export type RessourceSeance = {
  id: string
  seance_id: string
  type: "lien" | "fichier"
  url_ou_chemin: string
  libelle: string
}
