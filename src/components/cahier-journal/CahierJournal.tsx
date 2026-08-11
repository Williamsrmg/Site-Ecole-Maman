import { useState, useMemo } from "react"
import { useCreneaux } from "../../hooks/useCreneaux"
import { useSeancesJournal } from "../../hooks/useSeancesJournal"
import type { Creneau } from "../../types/creneau"

const JOURS_INDEX: Record<number, string> = {
  1: "lundi",
  2: "mardi",
  3: "mercredi",
  4: "jeudi",
  5: "vendredi",
}

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

function dateEnISO(date: Date): string {
  return date.toISOString().split("T")[0]
}

export default function CahierJournal() {
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date())
  const { creneaux, loading: loadingCreneaux } = useCreneaux()
  const { seances, loading: loadingSeances, addOrUpdateSeance, error } = useSeancesJournal()
  const [brouillons, setBrouillons] = useState<Record<string, string>>({})
  const [enregistrementEnCours, setEnregistrementEnCours] = useState<string | null>(null)

  const jourSemaine = JOURS_INDEX[dateSelectionnee.getDay()]
  const dateISO = dateEnISO(dateSelectionnee)

  const creneauxDuJour = useMemo(() => {
    if (!jourSemaine) return []
    return creneaux
      .filter((c) => c.jour_semaine === jourSemaine)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
  }, [creneaux, jourSemaine])

  const seanceParCreneau = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of seances) {
      if (s.date === dateISO) {
        map.set(s.creneau_id, s.contenu)
      }
    }
    return map
  }, [seances, dateISO])

  const changerJour = (delta: number) => {
    const nouvelle = new Date(dateSelectionnee)
    nouvelle.setDate(nouvelle.getDate() + delta)
    setDateSelectionnee(nouvelle)
  }

  const getContenu = (creneau: Creneau) => {
    if (brouillons[creneau.id] !== undefined) return brouillons[creneau.id]
    return seanceParCreneau.get(creneau.id) ?? ""
  }

  const handleChange = (creneauId: string, valeur: string) => {
    setBrouillons((prev) => ({ ...prev, [creneauId]: valeur }))
  }

  const handleEnregistrer = async (creneau: Creneau) => {
    setEnregistrementEnCours(creneau.id)
    try {
      await addOrUpdateSeance({
        creneau_id: creneau.id,
        date: dateISO,
        matiere: creneau.matiere,
        contenu: getContenu(creneau),
      })
      setBrouillons((prev) => {
        const copie = { ...prev }
        delete copie[creneau.id]
        return copie
      })
    } finally {
      setEnregistrementEnCours(null)
    }
  }

  const loading = loadingCreneaux || loadingSeances

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Cahier journal</h2>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => changerJour(-1)}
          className="px-2 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
        >
          ◀ Jour precedent
        </button>
        <span className="text-sm font-medium text-slate-700 capitalize min-w-[16rem] text-center">
          {formatDateFr(dateSelectionnee)}
        </span>
        <button
          onClick={() => changerJour(1)}
          className="px-2 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Jour suivant ▶
        </button>
        <button
          onClick={() => setDateSelectionnee(new Date())}
          className="px-2 py-1 text-xs text-sky-600 hover:underline ml-2"
        >
          Aujourd'hui
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm">Chargement...</p>}
      {error && <p className="text-red-500 text-sm">Erreur : {error}</p>}

      {!loading && !jourSemaine && (
        <p className="text-slate-500 text-sm">Pas de cours le week-end.</p>
      )}

      {!loading && jourSemaine && creneauxDuJour.length === 0 && (
        <p className="text-slate-500 text-sm">Aucun creneau prevu ce jour dans l'emploi du temps.</p>
      )}

      <div className="space-y-4">
        {creneauxDuJour.map((creneau) => {
          const dejaEnregistre = seanceParCreneau.has(creneau.id)
          const modifie = brouillons[creneau.id] !== undefined && brouillons[creneau.id] !== (seanceParCreneau.get(creneau.id) ?? "")
          return (
            <div key={creneau.id} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: creneau.couleur }}
                />
                <span className="font-medium text-slate-800">{creneau.matiere}</span>
                <span className="text-xs text-slate-400">
                  {creneau.heure_debut} - {creneau.heure_fin}
                </span>
                {dejaEnregistre && (
                  <span className="text-xs text-emerald-600 ml-auto">Seance enregistree</span>
                )}
              </div>
              <textarea
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                rows={3}
                placeholder="Deroule de la seance..."
                value={getContenu(creneau)}
                onChange={(e) => handleChange(creneau.id, e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleEnregistrer(creneau)}
                  disabled={enregistrementEnCours === creneau.id || (!modifie && dejaEnregistre)}
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                >
                  {enregistrementEnCours === creneau.id ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}