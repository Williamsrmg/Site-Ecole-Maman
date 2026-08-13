import BilanHoraire from './BilanHoraire'
import { useState, useMemo } from "react"
import { useCreneaux } from "../../hooks/useCreneaux"
import type { Creneau, JourSemaine } from "../../types/creneau"
import { JOURS_SEMAINE } from "../../types/creneau"
import CreneauModal from "./CreneauModal"
import type { CreneauFormData } from "./CreneauModal"

function genererCreneauxHoraires(): string[] {
  const heures: string[] = []
  const plages = [
    { debut: 8 * 60 + 30, fin: 11 * 60 + 30 },
    { debut: 13 * 60 + 30, fin: 16 * 60 + 30 },
  ]
  for (const plage of plages) {
    for (let minutes = plage.debut; minutes < plage.fin; minutes += 15) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      heures.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }
  return heures
}

const LIGNES_HORAIRES = genererCreneauxHoraires()

function heureEnMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number)
  return h * 60 + m
}

export default function EmploiDuTempsGrille() {
  const { creneaux, loading, error, addCreneauxMultiJours, updateCreneau, deleteCreneau } = useCreneaux()
  const [modalOuverte, setModalOuverte] = useState(false)
  const [creneauSelectionne, setCreneauSelectionne] = useState<Creneau | null>(null)
  const [jourClique, setJourClique] = useState<JourSemaine>("lundi")
  const [heureCliquee, setHeureCliquee] = useState("08:30")

  const creneauxParCase = useMemo(() => {
    const map = new Map<string, Creneau>()
    for (const c of creneaux) {
      const debut = heureEnMinutes(c.heure_debut)
      const fin = heureEnMinutes(c.heure_fin)
      for (let m = debut; m < fin; m += 15) {
        const h = Math.floor(m / 60)
        const mm = m % 60
        const heureStr = `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
        map.set(`${c.jour_semaine}-${heureStr}`, c)
      }
    }
    return map
  }, [creneaux])

  const ouvrirNouveauCreneau = (jour: JourSemaine, heure: string) => {
    setCreneauSelectionne(null)
    setJourClique(jour)
    setHeureCliquee(heure)
    setModalOuverte(true)
  }

  const ouvrirCreneauExistant = (creneau: Creneau) => {
    setCreneauSelectionne(creneau)
    setModalOuverte(true)
  }

  const handleSave = async (data: CreneauFormData) => {
    const { jours_semaine, ...base } = data

    if (creneauSelectionne) {
      // Modification : un seul jour (celui du creneau existant), simple update
      await updateCreneau(creneauSelectionne.id, {
        heure_debut: base.heure_debut,
        heure_fin: base.heure_fin,
        matiere: base.matiere,
        couleur: base.couleur,
        notes: base.notes,
      })
    } else {
      // Creation : insertion multi-jours en une seule requete
      await addCreneauxMultiJours(base, jours_semaine)
    }
  }

  if (loading) return <p className="text-slate-500 text-sm p-4">Chargement de l'emploi du temps...</p>
  if (error) return <p className="text-red-500 text-sm p-4">Erreur : {error}</p>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Emploi du temps</h2>
        <button
          onClick={() => ouvrirNouveauCreneau("lundi", "08:30")}
          className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-md hover:bg-sky-700"
        >
          + Ajouter
        </button>
      </div>
        <div className="mb-6"><BilanHoraire /></div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-16 bg-slate-50 border-b border-slate-200 p-1 text-xs text-slate-500">Heure</th>
              {JOURS_SEMAINE.map((jour) => (
                <th key={jour} className="bg-slate-50 border-b border-l border-slate-200 p-1 text-xs font-medium text-slate-600 capitalize">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIGNES_HORAIRES.map((heure) => {
              const heurePleine = heure.endsWith(":00") || heure.endsWith(":30")
              return (
                <tr key={heure} className={heurePleine ? "border-t border-slate-200" : ""}>
                  <td className="text-xs text-slate-400 text-right pr-2 align-top">
                    {heurePleine ? heure : ""}
                  </td>
                  {JOURS_SEMAINE.map((jour) => {
                    const cle = `${jour}-${heure}`
                    const creneau = creneauxParCase.get(cle)
                    const estDebutCreneau = creneau && creneau.heure_debut === heure

                    if (creneau && !estDebutCreneau) {
                      return <td key={jour} className="border-l border-slate-100 h-2 p-0" />
                    }

                    if (creneau && estDebutCreneau) {
                      const debut = heureEnMinutes(creneau.heure_debut)
                      const fin = heureEnMinutes(creneau.heure_fin)
                      const nbCases = Math.max(1, (fin - debut) / 15)
                      return (
                        <td
                          key={jour}
                          className="border-l border-slate-100 p-0 align-top relative"
                          rowSpan={nbCases}
                        >
                          <button
                            onClick={() => ouvrirCreneauExistant(creneau)}
                            className="w-full h-full text-left text-white text-xs p-1.5 rounded-sm hover:opacity-90"
                            style={{ backgroundColor: creneau.couleur, minHeight: `${nbCases * 1.25}rem` }}
                          >
                            <div className="font-medium truncate">{creneau.matiere}</div>
                            <div className="opacity-80 truncate">{creneau.heure_debut} - {creneau.heure_fin}</div>
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td
                        key={jour}
                        onClick={() => ouvrirNouveauCreneau(jour, heure)}
                        className="border-l border-slate-100 h-2 p-0 cursor-pointer hover:bg-sky-50"
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <CreneauModal
        isOpen={modalOuverte}
        onClose={() => setModalOuverte(false)}
        onSave={handleSave}
        onDelete={
          creneauSelectionne
            ? async () => {
                await deleteCreneau(creneauSelectionne.id)
              }
            : undefined
        }
        creneauExistant={creneauSelectionne}
        jourInitial={jourClique}
        heureInitiale={heureCliquee}
      />
    </div>
  )
}