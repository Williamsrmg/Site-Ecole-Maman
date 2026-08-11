import { useState } from "react"
import type { EleveInsert, Sexe } from "../../types/eleve"

type Props = {
  onClose: () => void
  onSubmit: (eleve: EleveInsert) => Promise<void>
}

const initialState: EleveInsert = {
  nom: "",
  prenom: "",
  sexe: "Fille" as Sexe,
  date_naissance: "",
  niveau: "CM1",
  assurance_scolaire: false,
  montant_cooperative: 0,
}

export default function EleveFormModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<EleveInsert>(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Ajouter un eleve
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Nom</label>
              <input
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Prenom</label>
              <input
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Sexe</label>
              <select
                value={form.sexe}
                onChange={(e) => setForm({ ...form, sexe: e.target.value as Sexe })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
              >
                <option value="Fille">Fille</option>
                <option value="Garcon">Garcon</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Niveau</label>
              <select
                value={form.niveau}
                onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
              >
                <option value="CP">CP</option>
                <option value="CE1">CE1</option>
                <option value="CE2">CE2</option>
                <option value="CM1">CM1</option>
                <option value="CM2">CM2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">
              Date de naissance
            </label>
            <input
              required
              type="date"
              value={form.date_naissance}
              onChange={(e) =>
                setForm({ ...form, date_naissance: e.target.value })
              }
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs text-slate-500 block mb-1">
                Cooperative (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.montant_cooperative}
                onChange={(e) =>
                  setForm({
                    ...form,
                    montant_cooperative: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-active"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700 pb-1.5">
              <input
                type="checkbox"
                checked={form.assurance_scolaire}
                onChange={(e) =>
                  setForm({ ...form, assurance_scolaire: e.target.checked })
                }
                className="rounded"
              />
              Assurance scolaire
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 text-sm rounded-md bg-sidebar-active text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}