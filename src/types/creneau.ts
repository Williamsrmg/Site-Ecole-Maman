export type JourSemaine = "lundi" | "mardi" | "jeudi" | "vendredi"
export type Recurrence = "hebdo" | "ponctuel"

export interface Creneau {
  id: string
  created_at: string
  annee_scolaire_id: string
  jour_semaine: JourSemaine
  heure_debut: string
  heure_fin: string
  matiere: string
  couleur: string
  notes: string | null
  recurrence: Recurrence
  date_specifique: string | null
}

export type CreneauInsert = Omit<Creneau, "id" | "created_at">
export type CreneauUpdate = Partial<CreneauInsert>

export const JOURS_SEMAINE: JourSemaine[] = ["lundi", "mardi", "jeudi", "vendredi"]