import { useState, useMemo } from "react"
import { jsPDF } from "jspdf"
import { useCreneaux } from "../../hooks/useCreneaux"
import { useSeancesJournal } from "../../hooks/useSeancesJournal"
import type { Creneau, JourSemaine } from "../../types/creneau"
import { JOURS_SEMAINE } from "../../types/creneau"
import SeanceJournalModal from "./SeanceJournalModal"
import PenseBete from "./PenseBete"
import { estEnVacances, getNomVacances } from "../../utils/vacances"

function hexEnRgb(hex: string): [number, number, number] {
  const nettoye = hex.replace("#", "")
  const bigint = parseInt(nettoye, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

const JOURS_INDEX: Record<number, JourSemaine | undefined> = {
  1: "lundi",
  2: "mardi",
  4: "jeudi",
  5: "vendredi",
}

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

function formatPlageSemaine(lundi: Date, vendredi: Date): string {
  const debut = lundi.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  const fin = vendredi.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  return debut + " - " + fin
}

function formatDateLongue(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
}

export default function CahierJournalGrille() {
  const [vueMode, setVueMode] = useState<"semaine" | "jour">("semaine")
  const [lundiCourant, setLundiCourant] = useState(() => lundiDeLaSemaine(new Date()))
  const [jourUnique, setJourUnique] = useState(() => new Date())
  const { creneaux, loading: loadingCreneaux } = useCreneaux()
  const { seances, loading: loadingSeances, addOrUpdateSeance, error } = useSeancesJournal()
  const [modalOuverte, setModalOuverte] = useState(false)
  const [creneauSelectionne, setCreneauSelectionne] = useState<Creneau | null>(null)
  const [dateSelectionnee, setDateSelectionnee] = useState<string>("")
  const [exportEnCours, setExportEnCours] = useState(false)

  const joursDeLaSemaine = useMemo(() => {
    return JOURS_SEMAINE.map((jour, index) => ({
      jour: jour as JourSemaine,
      date: ajouterJours(lundiCourant, index),
    }))
  }, [lundiCourant])

  const vendrediCourant = joursDeLaSemaine[joursDeLaSemaine.length - 1].date

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
    const map = new Map<string, (typeof seances)[number]>()
    for (const s of seances) {
      map.set(s.creneau_id + "-" + s.date, s)
    }
    return map
  }, [seances])

  const changerSemaine = (delta: number) => {
    setLundiCourant((prev) => ajouterJours(prev, delta * 7))
  }

  const changerJour = (delta: number) => {
    setJourUnique((prev) => {
      const pas = delta >= 0 ? 1 : -1
      let candidat = ajouterJours(prev, pas)
      while (!JOURS_INDEX[candidat.getDay()]) {
        candidat = ajouterJours(candidat, pas)
      }
      return candidat
    })
  }

  const ouvrirSeance = (creneau: Creneau, dateISO: string) => {
    setCreneauSelectionne(creneau)
    setDateSelectionnee(dateISO)
    setModalOuverte(true)
  }

  const seanceCourante = creneauSelectionne
    ? seanceParCle.get(creneauSelectionne.id + "-" + dateSelectionnee)
    : null

  const handleSave = async (data: { contenu: string; objectif: string; objectifRealise: boolean }) => {
    if (!creneauSelectionne) return
    await addOrUpdateSeance({
      creneau_id: creneauSelectionne.id,
      date: dateSelectionnee,
      matiere: creneauSelectionne.matiere,
      contenu: data.contenu,
      objectif: data.objectif || null,
      objectif_realise: data.objectifRealise,
    })
  }

  const handleExportPdf = () => {
    setExportEnCours(true)
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margeGauche = 10
      const margeHaute = 32
      const nbColonnes = joursDeLaSemaine.length
      const largeurColonne = (pageWidth - margeGauche * 2) / nbColonnes - 3
      const espaceColonne = (pageWidth - margeGauche * 2) / nbColonnes

      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 41, 59)
      doc.text("Cahier journal", margeGauche, 14)

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 116, 139)
      doc.text(formatPlageSemaine(lundiCourant, vendrediCourant), margeGauche, 21)

      joursDeLaSemaine.forEach(({ jour, date }, index) => {
        const x = margeGauche + index * espaceColonne
        const dateISO = dateEnISO(date)

        doc.setFillColor(241, 245, 249)
        doc.roundedRect(x, margeHaute - 7, largeurColonne, 8, 1.5, 1.5, "F")

        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(30, 41, 59)
        const libelleJour = jour.charAt(0).toUpperCase() + jour.slice(1) + " " + date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
        doc.text(libelleJour, x + 2, margeHaute - 2)

        let y = margeHaute + 6
        const creneauxDuJour = creneauxParJour.get(jour) ?? []

        for (const creneau of creneauxDuJour) {
          if (y > pageHeight - 20) break

          const seance = seanceParCle.get(creneau.id + "-" + dateISO)

          doc.setFontSize(8)
          doc.setFont("helvetica", "normal")
          const objectifLignes = seance?.objectif
            ? doc.splitTextToSize("Objectif : " + seance.objectif, largeurColonne - 6)
            : []
          const contenuLignes = seance?.contenu
            ? doc.splitTextToSize(seance.contenu, largeurColonne - 6)
            : []
          const hauteurTexte = objectifLignes.length * 3.6 + contenuLignes.length * 3.6
          const hauteurBloc = 12 + hauteurTexte + (hauteurTexte > 0 ? 3 : 0)

          if (y + hauteurBloc > pageHeight - 12) break

          doc.setDrawColor(226, 232, 240)
          doc.setLineWidth(0.2)
          doc.roundedRect(x, y, largeurColonne, hauteurBloc, 1.5, 1.5, "S")

          let yTexte = y + 5

          doc.setFontSize(8.5)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(30, 41, 59)
          doc.text(creneau.heure_debut + " - " + creneau.heure_fin, x + 2.5, yTexte)
          yTexte += 4.2

          doc.setFontSize(7.5)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(...(hexEnRgb(creneau.couleur)))
          doc.text(creneau.matiere, x + 2.5, yTexte)
          yTexte += 4

          doc.setFont("helvetica", "normal")
          doc.setFontSize(7.5)
          doc.setTextColor(71, 85, 105)

          if (objectifLignes.length > 0) {
            doc.text(objectifLignes, x + 2.5, yTexte)
            yTexte += objectifLignes.length * 3.6
          }

          if (contenuLignes.length > 0) {
            doc.setTextColor(100, 116, 139)
            doc.text(contenuLignes, x + 2.5, yTexte)
            yTexte += contenuLignes.length * 3.6
          }

          y += hauteurBloc + 3
        }
      })

      const nomFichier = "cahier-journal_" + dateEnISO(lundiCourant) + ".pdf"
      doc.save(nomFichier)
    } finally {
      setExportEnCours(false)
    }
  }

  const loading = loadingCreneaux || loadingSeances
  const jourUniqueSemaine = JOURS_INDEX[jourUnique.getDay()]
  const jourUniqueISO = dateEnISO(jourUnique)
  const creneauxJourUnique = jourUniqueSemaine ? (creneauxParJour.get(jourUniqueSemaine) ?? []) : []
  const jourUniqueVacances = estEnVacances(jourUniqueISO)
  const jourUniqueNomVacances = jourUniqueVacances ? getNomVacances(jourUniqueISO) : null

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Cahier Journal</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setVueMode("semaine")}
              className={"px-3 py-1 text-xs font-medium rounded-md transition-colors " + (vueMode === "semaine" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Vue semaine
            </button>
            <button
              onClick={() => setVueMode("jour")}
              className={"px-3 py-1 text-xs font-medium rounded-md transition-colors " + (vueMode === "jour" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Vue jour
            </button>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={loading || exportEnCours}
            className="px-3 py-1.5 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            {exportEnCours ? "Export en cours..." : "Exporter en PDF"}
          </button>
        </div>
      </div>

      <PenseBete semaineDebut={dateEnISO(lundiCourant)} />

      {vueMode === "semaine" && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => changerSemaine(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-colors text-lg"
            aria-label="Semaine precedente"
          >
            {"<"}
          </button>
          <div className="text-center min-w-[16rem]">
            <p className="text-xl font-semibold text-slate-800">{formatPlageSemaine(lundiCourant, vendrediCourant)}</p>
            <button
              onClick={() => setLundiCourant(lundiDeLaSemaine(new Date()))}
              className="text-xs text-slate-400 hover:text-sky-600 transition-colors"
            >
              Revenir a aujourd'hui
            </button>
          </div>
          <button
            onClick={() => changerSemaine(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-colors text-lg"
            aria-label="Semaine suivante"
          >
            {">"}
          </button>
        </div>
      )}

      {vueMode === "jour" && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => changerJour(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-colors text-lg"
            aria-label="Jour precedent"
          >
            {"<"}
          </button>
          <div className="text-center min-w-[16rem]">
            <p className="text-xl font-semibold text-slate-800 capitalize">{formatDateLongue(jourUnique)}</p>
            <button
              onClick={() => setJourUnique(new Date())}
              className="text-xs text-slate-400 hover:text-sky-600 transition-colors"
            >
              Revenir a aujourd'hui
            </button>
          </div>
          <button
            onClick={() => changerJour(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-colors text-lg"
            aria-label="Jour suivant"
          >
            {">"}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4 text-center">Erreur : {error}</p>}
      {loading && <p className="text-slate-400 text-sm text-center">Chargement...</p>}

      {!loading && vueMode === "semaine" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {joursDeLaSemaine.map(({ jour, date }) => {
            const dateISO = dateEnISO(date)
            const creneauxDuJour = creneauxParJour.get(jour) ?? []
            const estAujourdhui = dateISO === dateEnISO(new Date())
            const vacances = estEnVacances(dateISO)
            const nomVacances = vacances ? getNomVacances(dateISO) : null

            return (
              <div key={jour} className={"flex flex-col" + (vacances ? " opacity-60" : "")}>
                <div className="mb-2 pb-1.5 border-b border-slate-200">
                  <p className={"text-xs font-semibold capitalize " + (estAujourdhui ? "text-sky-600" : "text-slate-700")}>
                    {jour}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">{formatDateLongue(date).split(" ").slice(1).join(" ")}</p>
                </div>

                {vacances && (
                  <div className="bg-slate-100 border border-dashed border-slate-300 rounded-lg p-3 text-center">
                    <p className="text-[11px] text-slate-500 font-medium">Vacances</p>
                    {nomVacances && <p className="text-[10px] text-slate-400 mt-0.5">{nomVacances}</p>}
                  </div>
                )}

                {!vacances && (
                  <div className="space-y-1.5 flex-1">
                    {creneauxDuJour.length === 0 && (
                      <p className="text-[11px] text-slate-300 italic">Aucun creneau</p>
                    )}

                    {creneauxDuJour.map((creneau) => {
                      const cle = creneau.id + "-" + dateISO
                      const seance = seanceParCle.get(cle)
                      const aDuContenu = !!(seance?.contenu || seance?.objectif)

                      return (
                        <button
                          key={creneau.id}
                          onClick={() => ouvrirSeance(creneau, dateISO)}
                          className="w-full text-left bg-white rounded-lg shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all overflow-hidden"
                        >
                          <div className="px-2 pt-1.5 pb-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-slate-700">
                                {creneau.heure_debut} - {creneau.heure_fin}
                              </span>
                              {seance?.objectif_realise && (
                                <span className="text-emerald-500 text-[11px]">OK</span>
                              )}
                            </div>
                            <span
                              className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: creneau.couleur + "22", color: creneau.couleur }}
                            >
                              {creneau.matiere}
                            </span>
                          </div>

                          {aDuContenu && (
                            <div className="mx-2 mb-1.5 mt-0.5 bg-slate-50 border border-slate-100 rounded-md px-2 py-1">
                              {seance?.objectif && (
                                <p className="text-[10px] font-medium text-slate-600 truncate">
                                  {seance.objectif}
                                </p>
                              )}
                              {seance?.contenu && (
                                <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                                  {seance.contenu}
                                </p>
                              )}
                            </div>
                          )}
                          {!aDuContenu && (
                            <p className="text-[10px] text-slate-300 italic px-2 pb-1.5">Cliquer pour preparer...</p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && vueMode === "jour" && (
        <div className="max-w-2xl mx-auto">
          {jourUniqueVacances && (
            <div className="bg-slate-100 border border-dashed border-slate-300 rounded-lg p-6 text-center">
              <p className="text-sm font-medium text-slate-600">Vacances scolaires</p>
              {jourUniqueNomVacances && <p className="text-xs text-slate-400 mt-1">{jourUniqueNomVacances}</p>}
            </div>
          )}

          {!jourUniqueVacances && !jourUniqueSemaine && (
            <p className="text-slate-400 text-sm text-center italic">Pas de cours ce jour.</p>
          )}

          {!jourUniqueVacances && jourUniqueSemaine && creneauxJourUnique.length === 0 && (
            <p className="text-slate-400 text-sm text-center italic">Aucun creneau prevu ce jour.</p>
          )}

          {!jourUniqueVacances && (
          <div className="space-y-3">
            {creneauxJourUnique.map((creneau) => {
              const cle = creneau.id + "-" + jourUniqueISO
              const seance = seanceParCle.get(cle)

              return (
                <button
                  key={creneau.id}
                  onClick={() => ouvrirSeance(creneau, jourUniqueISO)}
                  className="w-full text-left bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all overflow-hidden p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {creneau.heure_debut} - {creneau.heure_fin}
                    </span>
                    {seance?.objectif_realise && (
                      <span className="text-emerald-500 text-xs font-medium">Objectif realise</span>
                    )}
                  </div>
                  <span
                    className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: creneau.couleur + "22", color: creneau.couleur }}
                  >
                    {creneau.matiere}
                  </span>

                  {seance?.objectif && (
                    <p className="text-sm font-medium text-slate-600 mt-1">{seance.objectif}</p>
                  )}
                  {seance?.contenu ? (
                    <p className="text-sm text-slate-500 leading-snug mt-1">{seance.contenu}</p>
                  ) : (
                    <p className="text-sm text-slate-300 italic mt-1">Cliquer pour preparer cette seance...</p>
                  )}
                </button>
              )
            })}
          </div>
          )}
        </div>
      )}

      <SeanceJournalModal
        isOpen={modalOuverte}
        onClose={() => setModalOuverte(false)}
        onSave={handleSave}
        creneau={creneauSelectionne}
        dateLabel={
          creneauSelectionne
            ? formatDateLongue(new Date(dateSelectionnee + "T00:00:00"))
            : ""
        }
        seanceExistante={seanceCourante}
      />
    </div>
  )
}