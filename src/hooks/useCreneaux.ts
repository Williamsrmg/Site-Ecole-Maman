import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { Creneau, CreneauInsert, CreneauUpdate, JourSemaine } from "../types/creneau"

export function useCreneaux() {
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCreneaux = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("creneaux")
      .select("*")
      .order("heure_debut", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setCreneaux(data as Creneau[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCreneaux()
  }, [fetchCreneaux])

  const addCreneau = async (creneau: CreneauInsert) => {
    const { data, error } = await supabase
      .from("creneaux")
      .insert(creneau)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setCreneaux((prev) => [...prev, data as Creneau])
    return data as Creneau
  }

  // Insere un creneau identique pour plusieurs jours en une seule requete Supabase.
  const addCreneauxMultiJours = async (
    base: Omit<CreneauInsert, "jour_semaine">,
    jours: JourSemaine[]
  ) => {
    if (jours.length === 0) return []
    const lignes: CreneauInsert[] = jours.map((jour) => ({ ...base, jour_semaine: jour }))

    const { data, error } = await supabase
      .from("creneaux")
      .insert(lignes)
      .select()

    if (error) throw new Error(error.message)
    setCreneaux((prev) => [...prev, ...(data as Creneau[])])
    return data as Creneau[]
  }

  const updateCreneau = async (id: string, updates: CreneauUpdate) => {
    const { data, error } = await supabase
      .from("creneaux")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setCreneaux((prev) => prev.map((c) => (c.id === id ? (data as Creneau) : c)))
    return data as Creneau
  }

  const deleteCreneau = async (id: string) => {
    const { error } = await supabase.from("creneaux").delete().eq("id", id)
    if (error) throw new Error(error.message)
    setCreneaux((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    creneaux,
    loading,
    error,
    addCreneau,
    addCreneauxMultiJours,
    updateCreneau,
    deleteCreneau,
    refetch: fetchCreneaux,
  }
}