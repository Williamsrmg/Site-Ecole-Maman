import { useAppContext } from "../../context/AppContext"

export default function Header() {
  const { anneeScolaire, setAnneeScolaire } = useAppContext()

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <label className="text-xs text-slate-500 block mb-0.5">
            Annee scolaire
          </label>
          <select
            className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sidebar-active"
            value={anneeScolaire?.libelle}
            onChange={(e) =>
              anneeScolaire &&
              setAnneeScolaire({ ...anneeScolaire, libelle: e.target.value })
            }
          >
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-0.5">
            Niveau
          </label>
          <select
            className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sidebar-active"
            value={anneeScolaire?.niveau}
            onChange={(e) =>
              anneeScolaire &&
              setAnneeScolaire({ ...anneeScolaire, niveau: e.target.value })
            }
          >
            <option value="CP">CP</option>
            <option value="CE1">CE1</option>
            <option value="CE2">CE2</option>
            <option value="CM1">CM1</option>
            <option value="CM2">CM2</option>
          </select>
        </div>
      </div>
    </header>
  )
}
