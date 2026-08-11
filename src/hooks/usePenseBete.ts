import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { PenseBete } from "../types/penseBete"

export function usePenseBete(semaineDebut: string) {
  const [contenu, setContenu] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPenseBete = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("pensebete")
      .select("*")
      .eq("annee_scolaire_id", "default")
      .eq("semaine_debut", semaineDebut)
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else {
      setContenu((data as PenseBete | null)?.contenu ?? "")
    }
    setLoading(false)
  }, [semaineDebut])

  useEffect(() => {
    fetchPenseBete()
  }, [fetchPenseBete])

  const sauvegarder = async (nouveauContenu: string) => {
    setSaving(true)
    setError(null)
    try {
      const { error } = await supabase
        .from("pensebete")
        .upsert(
          {
            annee_scolaire_id: "default",
            semaine_debut: semaineDebut,
            contenu: nouveauContenu,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "annee_scolaire_id,semaine_debut" }
        )
      if (error) throw new Error(error.message)
      setContenu(nouveauContenu)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  return { contenu, loading, saving, error, sauvegarder }
}