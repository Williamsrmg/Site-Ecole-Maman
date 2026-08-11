import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { Eleve, EleveInsert, EleveUpdate } from "../types/eleve"

export function useEleves() {
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEleves = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("eleves")
      .select("*")
      .order("nom", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setEleves(data as Eleve[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEleves()
  }, [fetchEleves])

  const addEleve = async (eleve: EleveInsert) => {
    const { data, error } = await supabase
      .from("eleves")
      .insert(eleve)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setEleves((prev) => [...prev, data as Eleve])
    return data as Eleve
  }

  const updateEleve = async (id: string, updates: EleveUpdate) => {
    const { data, error } = await supabase
      .from("eleves")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    setEleves((prev) => prev.map((e) => (e.id === id ? (data as Eleve) : e)))
    return data as Eleve
  }

  const deleteEleve = async (id: string) => {
    const { error } = await supabase.from("eleves").delete().eq("id", id)
    if (error) throw new Error(error.message)
    setEleves((prev) => prev.filter((e) => e.id !== id))
  }

  return { eleves, loading, error, addEleve, updateEleve, deleteEleve, refetch: fetchEleves }
}


