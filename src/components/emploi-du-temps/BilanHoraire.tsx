import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabaseClient"

const QUOTAS = [
  { id: "francais", label: "Français", keywords: ["fran", "lect", "orth", "gram", "conj", "vocab", "litt", "poé", "prod", "écrit"], targetMinutes: 480 },
  { id: "maths", label: "Mathématiques", keywords: ["math", "calc", "géom", "numér", "prob", "grand", "mesure"], targetMinutes: 300 },
  { id: "eps", label: "E.P.S", keywords: ["eps", "sport", "motric", "gym", "piscine"], targetMinutes: 180 },
  { id: "arts", label: "Arts & Musique", keywords: ["art", "musi", "chant", "dessin", "plast"], targetMinutes: 120 },
  { id: "langues", label: "Langues vivantes", keywords: ["angl", "lang", "lv", "espagnol", "allemand"], targetMinutes: 90 },
  { id: "sciences", label: "Sciences & Techno", keywords: ["scienc", "svt", "techno", "qmlm"], targetMinutes: 75 },
  { id: "geo", label: "Géographie", keywords: ["géo"], targetMinutes: 75 },
  { id: "hist", label: "Histoire & EMC", keywords: ["hist", "emc", "moral", "civi"], targetMinutes: 75 },
]

function getMinutes(timeStr: string) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(":").map(Number)
  return (h * 60) + (m || 0)
}

function formatMinutes(totalMins: number) {
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${h}h${m.toString().padStart(2, "0")}`
}

export default function BilanHoraire() {
  const [creneaux, setCreneaux] = useState<any[]>([])

  const fetchCreneaux = async () => {
    const { data } = await supabase.from("creneaux").select("*")
    if (data) setCreneaux(data)
  }

  useEffect(() => {
    fetchCreneaux()

    // Écoute les modifications en temps réel sur la base de données
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'creneaux' },
        () => { fetchCreneaux() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const totals = QUOTAS.map(q => ({ ...q, currentMinutes: 0 }))

  creneaux.forEach(c => {
    if (!c.heure_debut || !c.heure_fin || !c.matiere) return
    const duration = getMinutes(c.heure_fin) - getMinutes(c.heure_debut)
    if (duration <= 0) return

    const mat = c.matiere.toLowerCase()
    for (const q of totals) {
      if (q.keywords.some(kw => mat.includes(kw))) {
        q.currentMinutes += duration
        break
      }
    }
  })

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 mt-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Bilan Hebdomadaire des Quotas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {totals.map(q => {
          const percentage = Math.min(100, Math.round((q.currentMinutes / q.targetMinutes) * 100))
          const isOver = q.currentMinutes > q.targetMinutes
          const isComplete = q.currentMinutes === q.targetMinutes
          
          let colorClass = "bg-sky-500"
          let textColor = "text-sky-600"
          if (isOver) { colorClass = "bg-orange-500"; textColor = "text-orange-600" }
          if (isComplete) { colorClass = "bg-emerald-500"; textColor = "text-emerald-600" }

          return (
            <div key={q.id} className="border border-slate-100 rounded-md p-3 bg-slate-50">
              <p className="text-sm font-medium text-slate-700 truncate mb-1">{q.label}</p>
              <div className="flex justify-between items-end mb-2">
                <span className={`text-lg font-bold ${textColor}`}>
                  {formatMinutes(q.currentMinutes)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {formatMinutes(q.targetMinutes)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}