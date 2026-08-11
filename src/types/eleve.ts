export type Sexe = "Fille" | "Garcon"

export interface Eleve {
  id: string
  created_at: string
  nom: string
  prenom: string
  sexe: Sexe
  date_naissance: string
  niveau: string
  assurance_scolaire: boolean
  montant_cooperative: number
}

export type EleveInsert = Omit<Eleve, "id" | "created_at">
export type EleveUpdate = Partial<EleveInsert>
