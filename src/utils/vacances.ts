interface PeriodeVacances {
  nom: string;
  debut: string; // YYYY-MM-DD
  fin: string;   // YYYY-MM-DD
}

const VACANCES: PeriodeVacances[] = [
  // Année scolaire 2025-2026 (Zone C)
  { nom: "Vacances de la Toussaint", debut: "2025-10-18", fin: "2025-11-02" },
  { nom: "Vacances de Noël", debut: "2025-12-20", fin: "2026-01-04" },
  { nom: "Vacances d'hiver", debut: "2026-02-21", fin: "2026-03-08" },
  { nom: "Vacances de printemps", debut: "2026-04-18", fin: "2026-05-03" },
  { nom: "Vacances d'été", debut: "2026-07-04", fin: "2026-08-31" },

  // Année scolaire 2026-2027 (Zone C)
  { nom: "Vacances de la Toussaint", debut: "2026-10-17", fin: "2026-11-01" },
  { nom: "Vacances de Noël", debut: "2026-12-19", fin: "2027-01-03" },
  { nom: "Vacances d'hiver", debut: "2027-02-06", fin: "2027-02-21" },
  { nom: "Vacances de printemps", debut: "2027-04-10", fin: "2027-04-25" },
  { nom: "Vacances d'été", debut: "2027-07-07", fin: "2027-08-31" },
];

export function getNomVacances(dateISO: string): string | null {
  for (const v of VACANCES) {
    if (dateISO >= v.debut && dateISO <= v.fin) {
      return v.nom;
    }
  }
  return null;
}

export function estEnVacances(dateISO: string): boolean {
  return getNomVacances(dateISO) !== null;
}