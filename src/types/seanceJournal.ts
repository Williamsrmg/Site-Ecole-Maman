export interface SeanceJournal {
  id: string
  created_at: string
  creneau_id: string
  date: string
  matiere: string
  contenu: string
  objectif: string | null
  objectif_realise: boolean
}

export type SeanceJournalInsert = Omit<SeanceJournal, "id" | "created_at">
export type SeanceJournalUpdate = Partial<SeanceJournalInsert>