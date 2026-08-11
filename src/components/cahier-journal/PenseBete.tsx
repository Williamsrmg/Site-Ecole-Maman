import { useState, useEffect } from "react"
import { usePenseBete } from "../../hooks/usePenseBete"

type Props = {
  semaineDebut: string
}

export default function PenseBete({ semaineDebut }: Props) {
  const { contenu, loading, saving, sauvegarder } = usePenseBete(semaineDebut)
  const [brouillon, setBrouillon] = useState("")
  const [modifie, setModifie] = useState(false)

  useEffect(() => {
    setBrouillon(contenu)
    setModifie(false)
  }, [contenu])

  const handleChange = (valeur: string) => {
    setBrouillon(valeur)
    setModifie(true)
  }

  const handleSauvegarder = async () => {
    await sauvegarder(brouillon)
    setModifie(false)
  }

  if (loading) return null

  return (
    <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
      <span className="text-amber-500 text-lg shrink-0 leading-none mt-0.5">*</span>
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-700 mb-1">Pense-bete de la semaine</p>
        <textarea
          className="w-full bg-transparent border-none outline-none resize-none text-sm text-amber-900 placeholder-amber-400"
          rows={2}
          placeholder="Rappels rapides pour cette semaine..."
          value={brouillon}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      {modifie && (
        <button
          onClick={handleSauvegarder}
          disabled={saving}
          className="px-2.5 py-1 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 shrink-0"
        >
          {saving ? "..." : "Enregistrer"}
        </button>
      )}
    </div>
  )
}