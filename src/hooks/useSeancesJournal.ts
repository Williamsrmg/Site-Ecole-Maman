import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { SeanceJournal, SeanceJournalInsert, SeanceJournalUpdate } from "../types/seanceJournal"

export function useSeancesJournal() {
  const [seances, setSeances] = useState<SeanceJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSeances = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("seances_journal")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setSeances(data as SeanceJournal[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSeances()
  }, [fetchSeances])

  const addOrUpdateSeance = async (seance: SeanceJournalInsert) => {
    const { data, error } = await supabase
      .from("seances_journal")
      .upsert(seance, { onConflict: "creneau_id,date" })
      .select()
      .single()

    if (error) throw new Error(error.message)
    setSeances((prev) => {
      const existe = prev.some((s) => s.id === (data as SeanceJournal).id)
      if (existe) {
        return prev.map((s) => (s.id === (data as SeanceJournal).id ? (data as SeanceJournal) : s))
      }
      return [data as SeanceJournal, ...prev]
    })
    return data as SeanceJournal
  }

  const updateSeance = async (id: string, updates: SeanceJournalUpdate) => {
    const { data, error } = await supabase
      .from("seances_journal")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setSeances((prev) => prev.map((s) => (s.id === id ? (data as SeanceJournal) : s)))
    return data as SeanceJournal
  }

  const deleteSeance = async (id: string) => {
    const { error } = await supabase.from("seances_journal").delete().eq("id", id)
    if (error) throw new Error(error.message)
    setSeances((prev) => prev.filter((s) => s.id !== id))
  }

  const dupliquerSemaine = async (seancesADupliquer: SeanceJournal[], decalageJours: number) => {
    const resultats: SeanceJournal[] = []
    for (const s of seancesADupliquer) {
      const dateOrigine = new Date(s.date + "T00:00:00")
      dateOrigine.setDate(dateOrigine.getDate() + decalageJours)
      const nouvelleDate = dateOrigine.toISOString().split("T")[0]
      const copie = await addOrUpdateSeance({
        creneau_id: s.creneau_id,
        date: nouvelleDate,
        matiere: s.matiere,
        contenu: s.contenu,
        objectif: s.objectif,
        objectif_realise: false,
      })
      resultats.push(copie)
    }
    return resultats
  }

  return { seances, loading, error, addOrUpdateSeance, updateSeance, deleteSeance, dupliquerSemaine, refetch: fetchSeances }
}