import { useState, useEffect } from "react"
import type { Eleve, EleveInsert, Sexe } from "../../types/eleve"

interface EleveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eleve: EleveInsert) => Promise<void>
  onDelete?: () => Promise<void>
  eleveExistant?: Eleve | null
}

export default function EleveModal({ isOpen, onClose, onSave, onDelete, eleveExistant }: EleveModalProps) {
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [sexe, setSexe] = useState<Sexe>("Fille")
  const [dateNaissance, setDateNaissance] = useState("")
  const [niveau, setNiveau] = useState("CM1")
  const [assuranceScolaire, setAssuranceScolaire] = useState(false)
  const [montantCooperative, setMontantCooperative] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (eleveExistant) {
      setNom(eleveExistant.nom)
      setPrenom(eleveExistant.prenom)
      setSexe(eleveExistant.sexe)
      setDateNaissance(eleveExistant.date_naissance)
      setNiveau(eleveExistant.niveau)
      setAssuranceScolaire(eleveExistant.assurance_scolaire)
      setMontantCooperative(eleveExistant.montant_cooperative)
    } else {
      setNom("")
      setPrenom("")
      setSexe("Fille")
      setDateNaissance("")
      setNiveau("CM1")
      setAssuranceScolaire(false)
      setMontantCooperative(0)
    }
  }, [eleveExistant, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim() || !dateNaissance) return
    setSaving(true)
    try {
      await onSave({
        nom,
        prenom,
        sexe,
        date_naissance: dateNaissance,
        niveau,
        assurance_scolaire: assuranceScolaire,
        montant_cooperative: montantCooperative,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {eleveExistant ? "Modifier l'eleve" : "Nouvel eleve"}
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Nom</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Prenom</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Sexe</label>
              <select
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={sexe}
                onChange={(e) => setSexe(e.target.value as Sexe)}
              >
                <option value="Fille">Fille</option>
                <option value="Garcon">Garcon</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Niveau</label>
              <select
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
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
            <label className="text-xs text-slate-500 block mb-1">Date de naissance</label>
            <input
              type="date"
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Assurance scolaire</label>
              <select
                className={`w-full border rounded-md px-2 py-1.5 text-sm font-medium ${
                  assuranceScolaire
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-red-300 bg-red-50 text-red-700"
                }`}
                value={assuranceScolaire ? "oui" : "non"}
                onChange={(e) => setAssuranceScolaire(e.target.value === "oui")}
              >
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Cooperative (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={montantCooperative}
                onChange={(e) => setMontantCooperative(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            {eleveExistant && onDelete && (
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
              disabled={saving || !nom.trim() || !prenom.trim() || !dateNaissance}
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