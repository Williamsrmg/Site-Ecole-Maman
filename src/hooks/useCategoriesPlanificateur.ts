import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import type { CategoriePlanificateur } from "../types/evenementPlanificateur"

export function useCategoriesPlanificateur() {
  const [categories, setCategories] = useState<CategoriePlanificateur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("categories_planificateur")
      .select("*")

    if (error) {
      setError(error.message)
    } else {
      setCategories(data as CategoriePlanificateur[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, error, refetch: fetchCategories }
}