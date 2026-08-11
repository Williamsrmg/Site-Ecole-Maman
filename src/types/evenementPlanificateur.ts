export type CategorieEvenement =
  | "APC"
  | "Concertations"
  | "Conseils d'ecole"
  | "Conseil de cycles"
  | "Animations pedagogiques"

export interface EvenementPlanificateur {
  id: string
  created_at: string
  titre: string
  date: string
  heure: string | null
  categorie: CategorieEvenement
  description: string | null
  duree_minutes: number
}

export type EvenementPlanificateurInsert = Omit<EvenementPlanificateur, "id" | "created_at">
export type EvenementPlanificateurUpdate = Partial<EvenementPlanificateurInsert>

export const CATEGORIES_EVENEMENT: CategorieEvenement[] = [
  "APC",
  "Concertations",
  "Conseils d'ecole",
  "Conseil de cycles",
  "Animations pedagogiques",
]

export interface CategoriePlanificateur {
  id: string
  categorie: CategorieEvenement
  quota_heures: number
  couleur: string
}