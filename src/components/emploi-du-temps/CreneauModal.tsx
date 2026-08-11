import { useState, useEffect } from "react"
import type { Creneau, CreneauInsert, JourSemaine } from "../../types/creneau"
import { JOURS_SEMAINE } from "../../types/creneau"

export interface CreneauFormData extends Omit<CreneauInsert, "jour_semaine"> {
  jours_semaine: JourSemaine[]
}

interface CreneauModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreneauFormData) => Promise<void>
  onDelete?: () => Promise<void>
  creneauExistant?: Creneau | null
  jourInitial?: JourSemaine
  heureInitiale?: string
}

const COULEURS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"]

export default function CreneauModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  creneauExistant,
  jourInitial,
  heureInitiale,
}: CreneauModalProps) {
  const [joursSelectionnes, setJoursSelectionnes] = useState<JourSemaine[]>(
    jourInitial ? [jourInitial] : ["lundi"]
  )
  const [heureDebut, setHeureDebut] = useState(heureInitiale ?? "08:30")
  const [heureFin, setHeureFin] = useState("09:00")
  const [matiere, setMatiere] = useState("")
  const [couleur, setCouleur] = useState(COULEURS[0])
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const modeModification = !!creneauExistant

  useEffect(() => {
    if (creneauExistant) {
      setJoursSelectionnes([creneauExistant.jour_semaine])
      setHeureDebut(creneauExistant.heure_debut)
      setHeureFin(creneauExistant.heure_fin)
      setMatiere(creneauExistant.matiere)
      setCouleur(creneauExistant.couleur)
      setNotes(creneauExistant.notes ?? "")
    } else {
      setJoursSelectionnes(jourInitial ? [jourInitial] : ["lundi"])
      setHeureDebut(heureInitiale ?? "08:30")
      setHeureFin("09:00")
      setMatiere("")
      setCouleur(COULEURS[0])
      setNotes("")
    }
  }, [creneauExistant, jourInitial, heureInitiale, isOpen])

  if (!isOpen) return null

  const toggleJour = (jour: JourSemaine) => {
    if (modeModification) return // en modification, un seul jour (celui du creneau existant)
    setJoursSelectionnes((prev) =>
      prev.includes(jour) ? prev.filter((j) => j !== jour) : [...prev, jour]
    )
  }

  const handleSave = async () => {
    if (!matiere.trim() || joursSelectionnes.length === 0) return
    setSaving(true)
    try {
      await onSave({
        jours_semaine: joursSelectionnes,
        annee_scolaire_id: "default",
        heure_debut: heureDebut,
        heure_fin: heureFin,
        matiere,
        couleur,
        notes: notes || null,
        recurrence: "hebdo",
        date_specifique: null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {creneauExistant ? "Modifier le creneau" : "Nouveau creneau"}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Jour{!modeModification ? "(s)" : ""}
            </label>
            <div className="flex flex-wrap gap-2">
              {JOURS_SEMAINE.map((jour) => {
                const actif = joursSelectionnes.includes(jour)
                return (
                  <button
                    key={jour}
                    type="button"
                    onClick={() => toggleJour(jour)}
                    disabled={modeModification && !actif}
                    className={`px-2.5 py-1 rounded-md text-xs border capitalize ${
                      actif
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    } ${modeModification && !actif ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {jour}
                  </button>
                )
              })}
            </div>
            {modeModification && (
              <p className="text-[11px] text-slate-400 mt-1">
                En modification, le jour ne peut pas etre change. Supprime et recree le creneau pour changer de jour.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Heure debut</label>
              <input
                type="time"
                step="900"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Heure fin</label>
              <input
                type="time"
                step="900"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Matiere</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              placeholder="Ex: Mathematiques"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Couleur</label>
            <div className="flex gap-2">
              {COULEURS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={`w-6 h-6 rounded-full border-2 ${couleur === c ? "border-slate-800" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Notes (optionnel)</label>
            <textarea
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            {creneauExistant && onDelete && (
              <button
                onClick={async () => {
                  await onDelete()
                  onClose()
                }}
                className="text-red-500 text-sm hover:underline"
              >
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !matiere.trim() || joursSelectionnes.length === 0}
              className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}