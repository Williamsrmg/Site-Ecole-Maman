import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"

export type NiveauClasse = "CP" | "CE1" | "CE2" | "CM1" | "CM2"

export interface AnneeScolaire {
  libelle: string // ex: "2025-2026"
  niveau: NiveauClasse
}

interface AppContextType {
  anneeScolaire: AnneeScolaire | null
  setAnneeScolaire: (annee: AnneeScolaire) => void
}

const STORAGE_KEY = "app:anneeScolaire"

const defaultAnneeScolaire: AnneeScolaire = {
  libelle: "2026-2027",
  niveau: "CM1",
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [anneeScolaire, setAnneeScolaireState] = useState<AnneeScolaire | null>(
    () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : defaultAnneeScolaire
      } catch {
        return defaultAnneeScolaire
      }
    }
  )

  useEffect(() => {
    if (anneeScolaire) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(anneeScolaire))
    }
  }, [anneeScolaire])

  const setAnneeScolaire = (annee: AnneeScolaire) => {
    setAnneeScolaireState(annee)
  }

  return (
    <AppContext.Provider value={{ anneeScolaire, setAnneeScolaire }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext doit être utilisé à l'intérieur d'un AppProvider")
  }
  return context
}
