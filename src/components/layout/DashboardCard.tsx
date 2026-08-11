import type { LucideIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

type Props = {
  title: string
  description: string
  icon: LucideIcon
  to: string
  color: string
}

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  to,
  color,
}: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: color }}
      >
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </button>
  )
}

