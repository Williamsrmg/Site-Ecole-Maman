import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useEleves } from "../../hooks/useEleves"
import type { Eleve } from "../../types/eleve"
import EleveModal from "./EleveModal"

export default function ElevesTable() {
  const { eleves, loading, error, addEleve, updateEleve, deleteEleve } = useEleves()
  const [modalOuverte, setModalOuverte] = useState(false)
  const [eleveSelectionne, setEleveSelectionne] = useState<Eleve | null>(null)

  const ouvrirNouvelEleve = () => {
    setEleveSelectionne(null)
    setModalOuverte(true)
  }

  const ouvrirModification = (eleve: Eleve) => {
    setEleveSelectionne(eleve)
    setModalOuverte(true)
  }

  const exporterPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text("Liste des eleves", 14, 15)

    const colonnes = ["Nom", "Prenom", "Sexe", "Naissance", "Niveau", "Assurance", "Cooperative"]
    const lignes = eleves.map((eleve) => [
      eleve.nom,
      eleve.prenom,
      eleve.sexe,
      eleve.date_naissance,
      eleve.niveau,
      eleve.assurance_scolaire ? "Oui" : "Non",
      `${eleve.montant_cooperative} EUR`,
    ])

    autoTable(doc, {
      head: [colonnes],
      body: lignes,
      startY: 20,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    })

    doc.save("liste-eleves.pdf")
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Eleves</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exporterPDF}
            className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200"
          >
            Exporter en PDF
          </button>
          <button
            onClick={ouvrirNouvelEleve}
            className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            + Nouvel eleve
          </button>
        </div>
      </div>

      {loading && <p className="text-slate-500 text-sm p-4">Chargement des eleves...</p>}
      {error && <p className="text-red-500 text-sm p-4">Erreur : {error}</p>}

      {!loading && !error && eleves.length === 0 &&(
        <p className="text-slate-500 text-sm p-4">Aucun eleve enregistre.</p>
      )}

      {!loading && !error && eleves.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Nom</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Prenom</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Sexe</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Naissance</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Niveau</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Assurance</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Cooperative</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {eleves.map((eleve) => (
                <tr key={eleve.id}>
                  <td className="px-4 py-2">{eleve.nom}</td>
                  <td className="px-4 py-2">{eleve.prenom}</td>
                  <td className="px-4 py-2">{eleve.sexe}</td>
                  <td className="px-4 py-2">{eleve.date_naissance}</td>
                  <td className="px-4 py-2">{eleve.niveau}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        eleve.assurance_scolaire
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {eleve.assurance_scolaire ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{eleve.montant_cooperative} EUR</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => ouvrirModification(eleve)}
                      className="text-sky-600 hover:underline text-xs mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteEleve(eleve.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EleveModal
        isOpen={modalOuverte}
        onClose={() => setModalOuverte(false)}
        onSave={async (data) => {
          if (eleveSelectionne) {
            await updateEleve(eleveSelectionne.id, data)
          } else {
            await addEleve(data)
          }
        }}
        onDelete={
          eleveSelectionne
            ? async () => {
                await deleteEleve(eleveSelectionne.id)
              }
            : undefined
        }
        eleveExistant={eleveSelectionne}
      />
    </div>
  )
}