import { useState, useMemo } from "react"
import { useNotesCalendrier } from "../../hooks/useNotesCalendrier"
import { estEnVacances, getNomVacances } from "../../utils/vacances"
import NoteJourModal from "./NoteJourModal"

const MOIS_ANNEE_SCOLAIRE = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7]
const NOMS_MOIS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"]
const NOMS_JOURS_COURT = ["L", "M", "M", "J", "V", "S", "D"]

function dateEnISO(date: Date): string {
  return date.toISOString().split("T")[0]
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

function anneeCiviledepuisIndexMois(anneeScolaireDebut: number, moisIndex: number): number {
  return moisIndex >= 8 ? anneeScolaireDebut : anneeScolaireDebut + 1
}

function genererJoursDuMois(annee: number, mois: number): (Date | null)[] {
  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const jours: (Date | null)[] = []

  let decalageDebut = premierJour.getDay() - 1
  if (decalageDebut < 0) decalageDebut = 6
  for (let i = 0; i < decalageDebut; i++) jours.push(null)

  for (let j = 1; j <= dernierJour.getDate(); j++) {
    jours.push(new Date(annee, mois, j))
  }

  return jours
}

function anneeScolaireDepuisDate(date: Date): number {
  const mois = date.getMonth()
  const annee = date.getFullYear()
  return mois >= 8 ? annee : annee - 1
}

type Props = {
  anneeScolaireDebut?: number
}

export default function Calendrier({ anneeScolaireDebut = 2025 }: Props) {
  const [vueMode, setVueMode] = useState<"annee" | "mois">("mois")
  const [moisIndexAffiche, setMoisIndexAffiche] = useState(() => {
    const maintenant = new Date()
    const moisActuel = maintenant.getMonth()
    const idx = MOIS_ANNEE_SCOLAIRE.indexOf(moisActuel)
    return idx === -1 ? 0 : idx
  })
  const [anneeScolaireAffichee, setAnneeScolaireAffichee] = useState(() => {
    return anneeScolaireDepuisDate(new Date())
  })
  const { notes, sauvegarderNote } = useNotesCalendrier()
  const [modalOuverte, setModalOuverte] = useState(false)
  const [dateSelectionnee, setDateSelectionnee] = useState<Date | null>(null)

  const noteParDate = useMemo(() => {
    const map = new Map<string, string>()
    for (const n of notes) map.set(n.date, n.contenu)
    return map
  }, [notes])

  const ouvrirNote = (date: Date) => {
    setDateSelectionnee(date)
    setModalOuverte(true)
  }

  const handleSaveNote = async (contenu: string) => {
    if (!dateSelectionnee) return
    await sauvegarderNote(dateEnISO(dateSelectionnee), contenu)
  }

  const changerMois = (delta: number) => {
    setMoisIndexAffiche((prev) => prev + delta)
  }

  const changerAnneeScolaireAffichee = (delta: number) => {
    setAnneeScolaireAffichee((prev) => prev + delta)
  }

  const renduJourCase = (date: Date | null, compact: boolean) => {
    if (!date) return <div className={compact ? "h-6" : "h-20"} />

    const dateISO = dateEnISO(date)
    const vacances = estEnVacances(dateISO)
    const nomVacances = vacances ? getNomVacances(dateISO) : null
    const aUneNote = noteParDate.has(dateISO) && noteParDate.get(dateISO) !== ""
    const estAujourdhui = dateISO === dateEnISO(new Date())
    const estWeekendOuMercredi = [0, 3, 6].includes(date.getDay())

    if (compact) {
      return (
        <button
          onClick={() => ouvrirNote(date)}
          title={nomVacances ?? undefined}
          className={
            "h-6 w-full text-[10px] rounded flex items-center justify-center relative " +
            (estAujourdhui ? "bg-sky-600 text-white font-semibold" :
              vacances ? "bg-amber-50 text-amber-400" :
              estWeekendOuMercredi ? "text-slate-300" : "text-slate-600 hover:bg-slate-100")
          }
        >
          {date.getDate()}
          {aUneNote && <span className="absolute bottom-0 right-0.5 w-1 h-1 rounded-full bg-emerald-500" />}
        </button>
      )
    }

    return (
      <button
        onClick={() => ouvrirNote(date)}
        className={
          "h-20 w-full rounded-md border text-left p-1.5 flex flex-col " +
          (estAujourdhui ? "border-sky-400 bg-sky-50" :
            vacances ? "border-amber-200 bg-amber-50" :
            "border-slate-100 hover:border-slate-300 hover:bg-slate-50")
        }
      >
        <span className={"text-xs font-medium " + (estAujourdhui ? "text-sky-700" : vacances ? "text-amber-500" : "text-slate-600")}>
          {date.getDate()}
        </span>
        {vacances && nomVacances && (
          <span className="text-[9px] text-amber-500 leading-tight mt-0.5 line-clamp-2">{nomVacances}</span>
        )}
        {aUneNote && (
          <span className="text-[9px] text-slate-500 leading-tight mt-auto line-clamp-2 bg-white/70 rounded px-1 py-0.5">
            {noteParDate.get(dateISO)}
          </span>
        )}
      </button>
    )
  }

  const anneesScolaireDecalage = Math.floor(moisIndexAffiche / 12)
  const moisIndexDansAnnee = mod(moisIndexAffiche, 12)
  const moisCourantIndex = MOIS_ANNEE_SCOLAIRE[moisIndexDansAnnee]
  const anneeScolaireCourante = anneeScolaireDebut + anneesScolaireDecalage
  const anneeCourante = anneeCiviledepuisIndexMois(anneeScolaireCourante, moisCourantIndex)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Calendrier</h2>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setVueMode("annee")}
            className={"px-3 py-1 text-xs font-medium rounded-md transition-colors " + (vueMode === "annee" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Vue annee
          </button>
          <button
            onClick={() => setVueMode("mois")}
            className={"px-3 py-1 text-xs font-medium rounded-md transition-colors " + (vueMode === "mois" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
          >
            Vue mois
          </button>
        </div>
      </div>

      {vueMode === "mois" && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => changerMois(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          >
            {"<"}
          </button>
          <p className="text-lg font-semibold text-slate-800 min-w-[12rem] text-center capitalize">
            {NOMS_MOIS[moisCourantIndex]} {anneeCourante}
          </p>
          <button
            onClick={() => changerMois(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          >
            {">"}
          </button>
        </div>
      )}

      {vueMode === "annee" && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => changerAnneeScolaireAffichee(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          >
            {"<"}
          </button>
          <p className="text-lg font-semibold text-slate-800 min-w-[14rem] text-center">
            Annee scolaire {anneeScolaireAffichee} - {anneeScolaireAffichee + 1}
          </p>
          <button
            onClick={() => changerAnneeScolaireAffichee(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          >
            {">"}
          </button>
        </div>
      )}

      {vueMode === "mois" && (
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {NOMS_JOURS_COURT.map((j, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-slate-400">{j}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {genererJoursDuMois(anneeCourante, moisCourantIndex).map((date, i) => (
              <div key={i}>{renduJourCase(date, false)}</div>
            ))}
          </div>
        </div>
      )}

      {vueMode === "annee" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOIS_ANNEE_SCOLAIRE.map((moisIdx) => {
            const annee = anneeCiviledepuisIndexMois(anneeScolaireAffichee, moisIdx)
            return (
              <div key={moisIdx} className="border border-slate-200 rounded-lg p-2 bg-white">
                <p className="text-xs font-semibold text-slate-700 text-center mb-1.5">
                  {NOMS_MOIS[moisIdx]} {annee}
                </p>
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {NOMS_JOURS_COURT.map((j, i) => (
                    <div key={i} className="text-center text-[8px] text-slate-300">{j}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {genererJoursDuMois(annee, moisIdx).map((date, i) => (
                    <div key={i}>{renduJourCase(date, true)}</div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <NoteJourModal
        isOpen={modalOuverte}
        onClose={() => setModalOuverte(false)}
        onSave={handleSaveNote}
        dateLabel={
          dateSelectionnee
            ? dateSelectionnee.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : ""
        }
        contenuExistant={dateSelectionnee ? (noteParDate.get(dateEnISO(dateSelectionnee)) ?? "") : ""}
      />
    </div>
  )
}