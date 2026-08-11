export interface PenseBete {
  id: string
  created_at: string
  updated_at: string
  annee_scolaire_id: string
  semaine_debut: string
  contenu: string
}

export type PenseBeteInsert = Omit<PenseBete, "id" | "created_at" | "updated_at">