import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Eleve } from "../../types/eleve"

type Props = {
  eleves: Eleve[]
}

export default function ExportPdfButton({ eleves }: Props) {
  const handleExport = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text("Liste des eleves", 14, 15)

    const dateExport = new Date().toLocaleDateString("fr-FR")
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text("Exporte le " + dateExport, 14, 21)
    doc.setTextColor(0)

    const head = [[
      "Nom",
      "Prenom",
      "Sexe",
      "Naissance",
      "Niveau",
      "Assurance",
      "Cooperative",
    ]]

    const body = eleves.map((eleve) => [
      eleve.nom,
      eleve.prenom,
      eleve.sexe,
      eleve.date_naissance,
      eleve.niveau,
      eleve.assurance_scolaire ? "Oui" : "Non",
      eleve.montant_cooperative.toFixed(2) + " EUR",
    ])

    autoTable(doc, {
      head: head,
      body: body,
      startY: 26,
      theme: "grid",
      styles: {
        fontSize: 9,
        textColor: [30, 30, 30],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    doc.save("liste-eleves-" + dateExport.replaceAll("/", "-") + ".pdf")
  }

  return (
    <button
      onClick={handleExport}
      className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
    >
      Exporter en PDF
    </button>
  )
}
