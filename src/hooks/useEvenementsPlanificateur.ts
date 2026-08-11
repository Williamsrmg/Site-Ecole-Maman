import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { EvenementPlanificateur, EvenementPlanificateurInsert, EvenementPlanificateurUpdate } from "../types/evenementPlanificateur"

export function useEvenementsPlanificateur() {
  const [evenements, setEvenements] = useState<EvenementPlanificateur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvenements = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("evenements_planificateur")
      .select("*")
      .order("date", { ascending: true })
      .order("heure", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setEvenements(data as EvenementPlanificateur[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvenements()
  }, [fetchEvenements])

  const addEvenement = async (evenement: EvenementPlanificateurInsert) => {
    const { data, error } = await supabase
      .from("evenements_planificateur")
      .insert(evenement)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setEvenements((prev) =>
      [...prev, data as EvenementPlanificateur].sort((a, b) => a.date.localeCompare(b.date))
    )
    return data as EvenementPlanificateur
  }

  const updateEvenement = async (id: string, updates: EvenementPlanificateurUpdate) => {
    const { data, error } = await supabase
      .from("evenements_planificateur")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setEvenements((prev) => prev.map((e) => (e.id === id ? (data as EvenementPlanificateur) : e)))
    return data as EvenementPlanificateur
  }

  const deleteEvenement = async (id: string) => {
    const { error } = await supabase.from("evenements_planificateur").delete().eq("id", id)
    if (error) throw new Error(error.message)
    setEvenements((prev) => prev.filter((e) => e.id !== id))
  }

  return { evenements, loading, error, addEvenement, updateEvenement, deleteEvenement, refetch: fetchEvenements }
}