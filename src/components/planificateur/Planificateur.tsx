import { useState, useMemo } from "react"
import { useEvenementsPlanificateur } from "../../hooks/useEvenementsPlanificateur"
import { useCategoriesPlanificateur } from "../../hooks/useCategoriesPlanificateur"
import type { CategorieEvenement } from "../../types/evenementPlanificateur"
import { CATEGORIES_EVENEMENT } from "../../types/evenementPlanificateur"

function formatDateCourt(dateISO: string): { jour: string; mois: string } {
  const date = new Date(dateISO + "T00:00:00")
  return {
    jour: date.toLocaleDateString("fr-FR", { day: "2-digit" }),
    mois: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
  }
}

function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

export default function Planificateur() {
  const { evenements, loading: loadingEv, error: errorEv, addEvenement, deleteEvenement } = useEvenementsPlanificateur()
  const { categories, loading: loadingCat } = useCategoriesPlanificateur()

  const [categorieFormulaire, setCategorieFormulaire] = useState<CategorieEvenement | null>(null)
  const [titre, setTitre] = useState("")
  const [date, setDate] = useState("")
  const [heure, setHeure] = useState("")
  const [dureeMinutes, setDureeMinutes] = useState(60)
  const [description, setDescription] = useState("")
  const [enregistrement, setEnregistrement] = useState(false)

  const evenementsParCategorie = useMemo(() => {
    const map = new Map<CategorieEvenement, typeof evenements>()
    for (const cat of CATEGORIES_EVENEMENT) map.set(cat, [])
    for (const e of evenements) {
      const liste = map.get(e.categorie) ?? []
      liste.push(e)
      map.set(e.categorie, liste)
    }
    return map
  }, [evenements])

  const minutesCompleteesParCategorie = useMemo(() => {
    const map = new Map<CategorieEvenement, number>()
    for (const e of evenements) {
      map.set(e.categorie, (map.get(e.categorie) ?? 0) + e.duree_minutes)
    }
    return map
  }, [evenements])

  const totalQuotaHeures = useMemo(
    () => categories.reduce((acc, c) => acc + c.quota_heures, 0),
    [categories]
  )
  const totalMinutesCompletees = useMemo(
    () => evenements.reduce((acc, e) => acc + e.duree_minutes, 0),
    [evenements]
  )

  const getCategorieInfo = (cat: CategorieEvenement) =>
    categories.find((c) => c.categorie === cat)

  const resetFormulaire = () => {
    setTitre("")
    setDate("")
    setHeure("")
    setDureeMinutes(60)
    setDescription("")
  }

  const handleAjouter = async () => {
    if (!titre.trim() || !date || !categorieFormulaire) return
    setEnregistrement(true)
    try {
      await addEvenement({
        titre,
        date,
        heure: heure || null,
        categorie: categorieFormulaire,
        description: description || null,
        duree_minutes: dureeMinutes,
      })
      resetFormulaire()
      setCategorieFormulaire(null)
    } finally {
      setEnregistrement(false)
    }
  }

  const loading = loadingEv || loadingCat
  const totalMinutesQuota = totalQuotaHeures * 60
  const pourcentageGlobal = totalMinutesQuota > 0 ? Math.min(100, (totalMinutesCompletees / totalMinutesQuota) * 100) : 0

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Planificateur</h2>

      {!loading && (
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-2">
            {formatDuree(totalMinutesCompletees)} completees / {totalQuotaHeures}h planifiees
          </p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${pourcentageGlobal}%` }}
            />
          </div>
        </div>
      )}

      {errorEv && <p className="text-red-500 text-sm mb-4">Erreur : {errorEv}</p>}
      {loading && <p className="text-slate-500 text-sm">Chargement...</p>}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CATEGORIES_EVENEMENT.map((categorie) => {
            const info = getCategorieInfo(categorie)
            const couleur = info?.couleur ?? "#64748b"
            const quotaHeures = info?.quota_heures ?? 0
            const minutesCompletees = minutesCompleteesParCategorie.get(categorie) ?? 0
            const evenementsCat = evenementsParCategorie.get(categorie) ?? []

            return (
              <div key={categorie} className="border border-slate-200 rounded-lg bg-white flex flex-col">
                <div className="p-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: couleur }}
                    />
                    <span className="font-medium text-slate-800 text-sm">{categorie}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDuree(minutesCompletees)} / {quotaHeures}h
                  </p>
                </div>

                <div className="p-3 space-y-2 flex-1">
                  {evenementsCat.length === 0 && (
                    <p className="text-xs text-slate-400">Aucun evenement</p>
                  )}
                  {evenementsCat.map((evenement) => {
                    const { jour, mois } = formatDateCourt(evenement.date)
                    return (
                      <div
                        key={evenement.id}
                        className="border border-slate-100 rounded-md p-2 flex items-start gap-2 group"
                      >
                        <div
                          className="text-white text-[10px] rounded-md px-1.5 py-1 text-center leading-tight shrink-0"
                          style={{ backgroundColor: couleur }}
                        >
                          <div className="font-semibold text-xs">{jour}</div>
                          <div className="capitalize">{mois}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{evenement.titre}</p>
                          <p className="text-[11px] text-slate-400">
                            {evenement.heure ? `${evenement.heure} - ` : ""}
                            {formatDuree(evenement.duree_minutes)}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteEvenement(evenement.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="p-3 pt-0">
                  {categorieFormulaire === categorie ? (
                    <div className="space-y-2 border-t border-slate-100 pt-2">
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
                        placeholder="Titre"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="date"
                          className="w-full border border-slate-300 rounded-md px-1.5 py-1 text-xs"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                        <input
                          type="time"
                          className="w-full border border-slate-300 rounded-md px-1.5 py-1 text-xs"
                          value={heure}
                          onChange={(e) => setHeure(e.target.value)}
                        />
                      </div>
                      <select
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
                        value={dureeMinutes}
                        onChange={(e) => setDureeMinutes(Number(e.target.value))}
                      >
                        <option value={15}>15min</option>
                        <option value={30}>30min</option>
                        <option value={45}>45min</option>
                        <option value={60}>1h</option>
                        <option value={90}>1h30</option>
                        <option value={120}>2h</option>
                        <option value={180}>3h</option>
                      </select>
                      <textarea
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
                        rows={2}
                        placeholder="Description (optionnel)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setCategorieFormulaire(null)
                            resetFormulaire()
                          }}
                          className="flex-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md py-1"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleAjouter}
                          disabled={enregistrement || !titre.trim() || !date}
                          className="flex-1 text-xs bg-slate-800 text-white rounded-md py-1 hover:bg-slate-900 disabled:opacity-50"
                        >
                          {enregistrement ? "..." : "Ajouter"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCategorieFormulaire(categorie)}
                      className="w-full text-xs text-slate-500 border border-dashed border-slate-300 rounded-md py-1.5 hover:bg-slate-50"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}