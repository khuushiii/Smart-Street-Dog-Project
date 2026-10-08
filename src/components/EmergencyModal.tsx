import { useState } from "react"
import { DogProfile } from "../types"
import { TRANSLATIONS } from "../data/translations"
import { Language } from "../types"
import { reportIncident } from "../api"

interface Props {
  dog: DogProfile
  lang: Language
  onClose: () => void
}

export function EmergencyModal({ dog, lang, onClose }: Props) {
  const t = TRANSLATIONS[lang]
  const [category, setCategory] = useState<string>("injured")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const generatedId = `MGM-${Math.floor(1000 + Math.random() * 9000)}`
    setTicketId(generatedId)

    // Persist incident directly into Supabase via FastAPI backend
    reportIncident({
      dog_id: dog.id,
      dog_name: dog.name,
      dog_code: dog.code,
      category,
      location: dog.area,
      description: notes || "Distress / injury reported via citizen single-dog page",
      reporter_name: name || "Anonymous Citizen",
      reporter_phone: phone || "Not Provided",
      lat: dog.coordinates?.lat,
      lng: dog.coordinates?.lng,
    })
      .then((res) => {
        if (res && res.ticket_id) {
          setTicketId(res.ticket_id)
        }
      })
      .catch((err) => {
        console.warn("Backend report incident offline fallback:", err)
      })

    // Save incident to localStorage for admin dashboard reflection
    try {
      const stored = localStorage.getItem("smartdog_incidents")
      const incidents = stored ? JSON.parse(stored) : []
      const newReport = {
        id: generatedId,
        dogCode: dog.code,
        dogName: dog.name,
        breed: dog.breed,
        category,
        reporterName: name || "Anonymous Citizen",
        reporterPhone: phone || "Not Provided",
        notes: notes || "Distress / injury reported via citizen single-dog page",
        area: dog.area,
        lat: dog.coordinates.lat,
        lng: dog.coordinates.lng,
        timestamp: "Just now (" + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ")",
        status: "Pending Rescue Dispatch"
      }
      incidents.unshift(newReport)
      localStorage.setItem("smartdog_incidents", JSON.stringify(incidents))
    } catch {
      // ignore storage errors
    }
  }

  const handleCopyTicket = () => {
    if (!ticketId) return
    navigator.clipboard.writeText(`Ticket #${ticketId} - Smart Street Dog ${dog.code} (${dog.name}) at ${dog.area}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#1a0f07] text-[#2c1a0e] dark:text-[#f0e6d8] rounded-[22px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#ede5d8] dark:border-[#2e1a0a] transition-all">
        {/* Header */}
        <div className="px-6 py-5 bg-[#fff5f5] dark:bg-[#280a0a] border-b border-[#fecaca] dark:border-[#4a1818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[16px] font-700 text-red-600 dark:text-red-400">
                {ticketId ? t.ticketGenerated : t.reportIncident}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {dog.name} ({dog.code}) • {dog.area}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {ticketId ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#0f2413] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="text-[13px] font-700">Ticket #{ticketId}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {t.ticketNotice}
                  </p>
                </div>
              </div>

              <div className="bg-[#faf6f1] dark:bg-[#201108] p-4 rounded-xl border border-[#ede5d8] dark:border-[#331c10] text-[12px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Dog Identity:</span>
                  <span className="font-600">{dog.name} ({dog.code})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Target Area:</span>
                  <span className="font-600">{dog.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Live GPS Coordinates:</span>
                  <span className="font-mono">{dog.coordinates.lat}° N, {dog.coordinates.lng}° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-600">Dispatched • ETA 12 mins</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] text-[12px] font-600 hover:bg-[#faf6f1] dark:hover:bg-[#2a160a] transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Ticket Info"}
                </button>
                <a
                  href="tel:+919822145789"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-600 transition-colors flex items-center justify-center gap-2"
                >
                  📞 Call Helpline
                </a>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-[12px] font-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                {t.closeBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[12px] text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.reportSubtitle}
              </p>

              <div>
                <label className="block text-[11px] font-600 text-stone-700 dark:text-stone-300 mb-1">
                  {t.issueCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] bg-[#faf6f1] dark:bg-[#201108] text-[#2c1a0e] dark:text-[#f0e6d8] focus:outline-none focus:ring-2 focus:ring-[#784920]"
                >
                  <option value="injured">{t.catInjured}</option>
                  <option value="aggression">{t.catAggression}</option>
                  <option value="lost_collar">{t.catCollar}</option>
                  <option value="food_water">{t.catFood}</option>
                  <option value="sighting">{t.catSighting}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-600 text-stone-700 dark:text-stone-300 mb-1">
                    {t.yourName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-[13px] px-3.5 py-2 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] bg-[#faf6f1] dark:bg-[#201108] focus:outline-none focus:ring-2 focus:ring-[#784920]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-600 text-stone-700 dark:text-stone-300 mb-1">
                    {t.yourPhone}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98221XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-[13px] px-3.5 py-2 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] bg-[#faf6f1] dark:bg-[#201108] focus:outline-none focus:ring-2 focus:ring-[#784920]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-600 text-stone-700 dark:text-stone-300 mb-1">
                  {t.incidentDetails}
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe location details, physical injuries, or immediate observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-[12px] p-3 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] bg-[#faf6f1] dark:bg-[#201108] focus:outline-none focus:ring-2 focus:ring-[#784920]"
                />
              </div>

              {/* Geo-tag snapshot info */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#1a0f07] border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
                <span>📍 Auto-attached GPS: {dog.coordinates.lat}° N, {dog.coordinates.lng}° E</span>
                <span className="text-emerald-600 font-semibold">Active Tag</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-[13px] font-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  {t.closeBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-600 shadow-md transition-colors"
                >
                  {t.submitReport}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
