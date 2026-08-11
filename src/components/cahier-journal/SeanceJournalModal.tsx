import { useState, useEffect } from "react"
import type { Creneau } from "../../types/creneau"
import type { SeanceJournal } from "../../types/seanceJournal"

interface SeanceJournalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { contenu: string; objectif: string; objectifRealise: boolean }) => Promise<void>
  creneau: Creneau | null
  dateLabel: string
  seanceExistante?: SeanceJournal | null
}

export default function SeanceJournalModal({
  isOpen,
  onClose,
  onSave,
  creneau,
  dateLabel,
  seanceExistante,
}: SeanceJournalModalProps) {
  const [contenu, setContenu] = useState("")
  const [objectif, setObjectif] = useState("")
  const [objectifRealise, setObjectifRealise] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setContenu(seanceExistante?.contenu ?? "")
    setObjectif(seanceExistante?.objectif ?? "")
    setObjectifRealise(seanceExistante?.objectif_realise ?? false)
  }, [seanceExistante, isOpen])

  if (!isOpen || !creneau) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ contenu, objectif, objectifRealise })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${creneau.couleur}22`, color: creneau.couleur }}
            >
              {creneau.matiere}
            </span>
            <span className="text-xs text-slate-400">{dateLabel}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mt-1.5">
            {creneau.heure_debut} - {creneau.heure_fin}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Objectif de la seance</label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300"
              placeholder="Ex : Resoudre des problemes multiplicatifs"
              value={objectif}
              onChange={(e) => setObjectif(e.target.value)}
            />
            <label className="flex items-center gap-2 mt-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                checked={objectifRealise}
                onChange={(e) => setObjectifRealise(e.target.checked)}
              />
              Objectif atteint
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">Fiche de preparation / suivi</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 focus:bg-white"
              rows={6}
              placeholder="Deroule de la seance, materiel, bilan, devoirs..."
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}