import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCreneaux } from "../../hooks/useCreneaux"
import { useSeancesJournal } from "../../hooks/useSeancesJournal"
import type { Creneau, JourSemaine } from "../../types/creneau"
import { JOURS_SEMAINE } from "../../types/creneau"

const HEURE_DEBUT_GRILLE = 8 * 60 + 30
const HEURE_FIN_GRILLE = 16 * 60 + 30
const DUREE_GRILLE = HEURE_FIN_GRILLE - HEURE_DEBUT_GRILLE
const HAUTEUR_GRILLE_PX = 720

function lundiDeLaSemaine(date: Date): Date {
  const jour = date.getDay()
  const decalage = jour === 0 ? -6 : 1 - jour
  const lundi = new Date(date)
  lundi.setDate(date.getDate() + decalage)
  lundi.setHours(0, 0, 0, 0)
  return lundi
}

function dateEnISO(date: Date): string {
  return date.toISOString().split("T")[0]
}

function ajouterJours(date: Date, jours: number): Date {
  const copie = new Date(date)
  copie.setDate(copie.getDate() + jours)
  return copie
}

function formatDateCourt(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function formatPlageSemaine(lundi: Date, vendredi: Date): string {
  const debut = lundi.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  const fin = vendredi.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  return "Semaine du " + debut + " au " + fin
}

function minutesDepuisHHMM(heure: string): number {
  const [h, m] = heure.split(":").map(Number)
  return h * 60 + m
}

function positionDansGrille(heureDebut: string, heureFin: string) {
  const debutMin = minutesDepuisHHMM(heureDebut)
  const finMin = minutesDepuisHHMM(heureFin)
  const topPct = ((debutMin - HEURE_DEBUT_GRILLE) / DUREE_GRILLE) * 100
  const heightPct = ((finMin - debutMin) / DUREE_GRILLE) * 100
  return { topPct, heightPct }
}

function genererMarquesHeures(): string[] {
  const marques: string[] = []
  for (let m = HEURE_DEBUT_GRILLE; m <= HEURE_FIN_GRILLE; m += 60) {
    const h = Math.floor(m / 60)
    const min = m % 60
    marques.push(String(h).padStart(2, "0") + "h" + String(min).padStart(2, "0"))
  }
  return marques
}

export default function CahierJournalSemaine() {
  const [lundiCourant, setLundiCourant] = useState(() => lundiDeLaSemaine(new Date()))
  const { creneaux, loading: loadingCreneaux } = useCreneaux()
  const { seances, loading: loadingSeances, addOrUpdateSeance, dupliquerSemaine, error } = useSeancesJournal()
  const [brouillons, setBrouillons] = useState<Record<string, string>>({})
  const [enregistrementEnCours, setEnregistrementEnCours] = useState<string | null>(null)
  const [dupliquant, setDupliquant] = useState(false)
  const [messageDuplication, setMessageDuplication] = useState<string | null>(null)
  const [creneauOuvert, setCreneauOuvert] = useState<string | null>(null)

  const joursDeLaSemaine = useMemo(() => {
    return JOURS_SEMAINE.map((jour, index) => ({
      jour: jour as JourSemaine,
      date: ajouterJours(lundiCourant, index),
    }))
  }, [lundiCourant])

  const vendrediCourant = joursDeLaSemaine[4].date
  const marquesHeures = useMemo(() => genererMarquesHeures(), [])

  const creneauxParJour = useMemo(() => {
    const map = new Map<JourSemaine, Creneau[]>()
    for (const j of JOURS_SEMAINE) {
      map.set(
        j as JourSemaine,
        creneaux
          .filter((c) => c.jour_semaine === j)
          .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
      )
    }
    return map
  }, [creneaux])

  const seanceParCle = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of seances) {
      map.set(s.creneau_id + "-" + s.date, s.contenu)
    }
    return map
  }, [seances])

  const changerSemaine = (delta: number) => {
    setLundiCourant((prev) => ajouterJours(prev, delta * 7))
  }

  const handleDupliquerSemaine = async () => {
    const debutISO = dateEnISO(lundiCourant)
    const finISO = dateEnISO(vendrediCourant)
    const seancesSemaine = seances.filter((s) => s.date >= debutISO && s.date <= finISO)

    if (seancesSemaine.length === 0) {
      setMessageDuplication("Aucune seance a dupliquer cette semaine.")
      return
    }

    setDupliquant(true)
    setMessageDuplication(null)
    try {
      await dupliquerSemaine(seancesSemaine, 7)
      setMessageDuplication(seancesSemaine.length + " seance(s) dupliquee(s) vers la semaine suivante.")
    } catch (err) {
      setMessageDuplication("Erreur lors de la duplication.")
    } finally {
      setDupliquant(false)
    }
  }

  const getContenu = (creneauId: string, dateISO: string) => {
    const cleBrouillon = creneauId + "-" + dateISO
    if (brouillons[cleBrouillon] !== undefined) return brouillons[cleBrouillon]
    return seanceParCle.get(cleBrouillon) ?? ""
  }

  const handleChange = (creneauId: string, dateISO: string, valeur: string) => {
    const cle = creneauId + "-" + dateISO
    setBrouillons((prev) => ({ ...prev, [cle]: valeur }))
  }

  const handleEnregistrer = async (creneau: Creneau, dateISO: string) => {
    const cle = creneau.id + "-" + dateISO
    setEnregistrementEnCours(cle)
    try {
      await addOrUpdateSeance({
        creneau_id: creneau.id,
        date: dateISO,
        matiere: creneau.matiere,
        contenu: getContenu(creneau.id, dateISO),
      })
      setBrouillons((prev) => {
        const copie = { ...prev }
        delete copie[cle]
        return copie
      })
    } finally {
      setEnregistrementEnCours(null)
    }
  }

  const loading = loadingCreneaux || loadingSeances

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Cahier journal - Vue semaine</h2>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => changerSemaine(-1)}
          className="flex items-center gap-1 px-2 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
          Semaine precedente
        </button>
        <span className="text-sm font-medium text-slate-700 min-w-[18rem] text-center">
          {formatPlageSemaine(lundiCourant, vendrediCourant)}
        </span>
        <button
          onClick={() => changerSemaine(1)}
          className="flex items-center gap-1 px-2 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Semaine suivante
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setLundiCourant(lundiDeLaSemaine(new Date()))}
          className="px-2 py-1 text-xs text-sky-600 hover:underline ml-2"
        >
          Semaine actuelle
        </button>
        <button
          onClick={handleDupliquerSemaine}
          disabled={dupliquant}
          className="px-2 py-1 text-xs border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 ml-auto"
          title="Copie les seances de cette semaine vers la semaine suivante"
        >
          {dupliquant ? "Duplication..." : "Dupliquer cette semaine"}
        </button>
      </div>

      {messageDuplication && (
        <p className="text-xs text-emerald-600 mb-4">{messageDuplication}</p>
      )}

      {loading && <p className="text-slate-500 text-sm">Chargement...</p>}
      {error && <p className="text-red-500 text-sm">Erreur : {error}</p>}

      {!loading && (
        <div className="flex border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="w-14 shrink-0 border-r border-slate-200 bg-slate-50">
            <div className="h-[52px] border-b border-slate-200" />
            <div className="relative" style={{ height: HAUTEUR_GRILLE_PX + "px" }}>
              {marquesHeures.map((label, i) => (
                <div
                  key={label}
                  className="absolute left-0 right-0 text-[10px] text-slate-400 px-1 -translate-y-1/2"
                  style={{ top: (i / (marquesHeures.length - 1)) * 100 + "%" }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 flex-1">
            {joursDeLaSemaine.map(({ jour, date }) => {
              const dateISO = dateEnISO(date)
              const creneauxDuJour = creneauxParJour.get(jour) ?? []
              return (
                <div key={jour} className="border-r last:border-r-0 border-slate-200">
                  <div className="h-[52px] bg-slate-50 border-b border-slate-200 px-3 py-2">
                    <div className="text-sm font-medium text-slate-700 capitalize">{jour}</div>
                    <div className="text-xs text-slate-400">{formatDateCourt(date)}</div>
                  </div>

                  <div className="relative" style={{ height: HAUTEUR_GRILLE_PX + "px" }}>
                    {marquesHeures.map((_, i) => (
                      <div
                        key={i}
                        className="absolute left-0 right-0 border-t border-slate-100"
                        style={{ top: (i / (marquesHeures.length - 1)) * 100 + "%" }}
                      />
                    ))}

                    {creneauxDuJour.map((creneau) => {
                      const cle = creneau.id + "-" + dateISO
                      const dejaEnregistre = seanceParCle.has(cle)
                      const valeurActuelle = getContenu(creneau.id, dateISO)
                      const modifie = brouillons[cle] !== undefined && brouillons[cle] !== (seanceParCle.get(cle) ?? "")
                      const { topPct, heightPct } = positionDansGrille(creneau.heure_debut, creneau.heure_fin)
                      const ouvert = creneauOuvert === cle

                      return (
                        <div
                          key={creneau.id}
                          className="absolute left-1 right-1 rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:z-20 transition-shadow"
                          style={{
                            top: topPct + "%",
                            height: heightPct + "%",
                            minHeight: "24px",
                            zIndex: ouvert ? 30 : 10,
                          }}
                        >
                          <div
                            className="h-full flex flex-col cursor-pointer"
                            onClick={() => setCreneauOuvert(ouvert ? null : cle)}
                          >
                            <div
                              className="px-1.5 py-0.5 flex items-center gap-1 shrink-0"
                              style={{ backgroundColor: creneau.couleur + "22" }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: creneau.couleur }}
                              />
                              <span className="text-[10px] font-medium text-slate-700 truncate">
                                {creneau.matiere}
                              </span>
                              {dejaEnregistre && (
                                <span className="text-[9px] text-emerald-600 ml-auto shrink-0">OK</span>
                              )}
                            </div>

                            {ouvert && (
                              <div className="p-1.5 flex-1 flex flex-col gap-1 bg-white" onClick={(e) => e.stopPropagation()}>
                                <div className="text-[10px] text-slate-400">
                                  {creneau.heure_debut} - {creneau.heure_fin}
                                </div>
                                <textarea
                                  className="w-full flex-1 border border-slate-200 rounded-md px-1.5 py-1 text-[11px] resize-none"
                                  rows={2}
                                  placeholder="Deroule..."
                                  value={valeurActuelle}
                                  onChange={(e) => handleChange(creneau.id, dateISO, e.target.value)}
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleEnregistrer(creneau, dateISO)}
                                    disabled={enregistrementEnCours === cle || (!modifie && dejaEnregistre)}
                                    className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {enregistrementEnCours === cle ? "..." : "OK"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}