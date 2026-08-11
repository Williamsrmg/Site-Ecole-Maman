import { useState, useEffect } from "react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (contenu: string) => Promise<void>
  dateLabel: string
  contenuExistant: string
}

export default function NoteJourModal({ isOpen, onClose, onSave, dateLabel, contenuExistant }: Props) {
  const [contenu, setContenu] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setContenu(contenuExistant)
  }, [contenuExistant, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(contenu)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-1 capitalize">{dateLabel}</h3>
        <p className="text-xs text-slate-400 mb-4">Note pour ce jour</p>

        <textarea
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          rows={5}
          placeholder="Ecrire une note..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  )
}