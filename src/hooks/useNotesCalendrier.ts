import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { NoteCalendrier } from "../types/noteCalendrier"

export function useNotesCalendrier() {
  const [notes, setNotes] = useState<NoteCalendrier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("notes_calendrier")
      .select("*")
      .eq("annee_scolaire_id", "default")

    if (error) {
      setError(error.message)
    } else {
      setNotes(data as NoteCalendrier[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const sauvegarderNote = async (dateISO: string, contenu: string) => {
    const { data, error } = await supabase
      .from("notes_calendrier")
      .upsert(
        {
          annee_scolaire_id: "default",
          date: dateISO,
          contenu: contenu,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "annee_scolaire_id,date" }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    setNotes((prev) => {
      const existe = prev.some((n) => n.date === dateISO)
      if (existe) {
        return prev.map((n) => (n.date === dateISO ? (data as NoteCalendrier) : n))
      }
      return [...prev, data as NoteCalendrier]
    })
  }

  return { notes, loading, error, sauvegarderNote, refetch: fetchNotes }
}