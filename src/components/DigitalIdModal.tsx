import { DogProfile, Language } from "../types"
import { TRANSLATIONS } from "../data/translations"
import { useState } from "react"

interface Props {
  dog: DogProfile
  lang: Language
  onClose: () => void
}

export function DigitalIdModal({ dog, lang, onClose }: Props) {
  const t = TRANSLATIONS[lang]
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(`Smart Street Dog Pass for ${dog.name} (${dog.code}) - ${dog.area} | Track: ${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div id="digital-id-modal-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div id="digital-id-modal-card" className="bg-white dark:bg-[#1a0f07] text-[#2c1a0e] dark:text-[#f0e6d8] rounded-[24px] max-w-md w-full overflow-hidden shadow-2xl border border-[#ede5d8] dark:border-[#2e1a0a]">
        {/* Header */}
        <div className="no-print px-6 py-4 border-b border-[#ede5d8] dark:border-[#2e1a0a] flex items-center justify-between bg-[#faf6f1] dark:bg-[#221208]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h3 className="text-[15px] font-700 text-[#784920] dark:text-[#d4a876]">
              {t.digitalIdTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Printable Pass Container */}
        <div className="p-6">
          <div
            id="printable-digital-id-pass"
            className="relative rounded-2xl overflow-hidden p-5 border-2 border-[#784920]/30 dark:border-[#d4a876]/40 bg-gradient-to-br from-[#fdfbf7] to-[#f4ede3] dark:from-[#231409] dark:to-[#190c05] shadow-sm"
          >
            {/* Watermark seal */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-4 border-[#784920]/10 dark:border-[#d4a876]/10 flex items-center justify-center pointer-events-none">
              <span className="text-4xl opacity-20">🐾</span>
            </div>

            {/* Header in pass */}
            <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#dbc8ad] dark:border-[#3d2414]">
              <div>
                <p className="text-[9px] font-700 tracking-wider uppercase text-[#784920] dark:text-[#d4a876]">
                  Chhatrapati Sambhajinagar Smart City Initiative
                </p>
                <h4 className="text-[16px] font-800 tracking-tight text-stone-900 dark:text-white">
                  {dog.name}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  Tag ID: <strong className="text-[#784920] dark:text-[#d4a876]">{dog.code}</strong>
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-700 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Verified ABC
              </span>
            </div>

            {/* Photo + Details */}
            <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
              <img
                src={dog.photo}
                alt={dog.name}
                className="w-24 h-24 rounded-xl object-cover border border-[#dbc8ad] dark:border-[#3d2414] shadow-xs"
              />
              <div className="text-[11px] space-y-1">
                <p><span className="text-stone-500 dark:text-stone-400">Breed:</span> <strong>{dog.breed}</strong></p>
                <p><span className="text-stone-500 dark:text-stone-400">Gender / Age:</span> <strong>{dog.gender} • {dog.approxAge}</strong></p>
                <p><span className="text-stone-500 dark:text-stone-400">Home Territory:</span> <strong>{dog.area}</strong></p>
                <p><span className="text-stone-500 dark:text-stone-400">Microchip:</span> <span className="font-mono text-[10px]">{dog.vetRecord.microchipId}</span></p>
                <p><span className="text-stone-500 dark:text-stone-400">Vaccine Batch:</span> <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{dog.vetRecord.vaccineBatch}</span></p>
              </div>
            </div>

            {/* QR Code & Authority Note */}
            <div className="mt-4 pt-3 border-t border-[#dbc8ad] dark:border-[#3d2414] flex items-center justify-between">
              {/* Synthetic high-res SVG QR representation */}
              <div className="p-1.5 bg-white rounded-lg border border-stone-300 shadow-xs flex flex-col items-center">
                <svg viewBox="0 0 60 60" className="w-12 h-12">
                  <rect width="60" height="60" fill="white"/>
                  {/* Top Left Marker */}
                  <rect x="5" y="5" width="16" height="16" fill="#784920"/>
                  <rect x="8" y="8" width="10" height="10" fill="white"/>
                  <rect x="10" y="10" width="6" height="6" fill="#784920"/>
                  {/* Top Right Marker */}
                  <rect x="39" y="5" width="16" height="16" fill="#784920"/>
                  <rect x="42" y="8" width="10" height="10" fill="white"/>
                  <rect x="44" y="10" width="6" height="6" fill="#784920"/>
                  {/* Bottom Left Marker */}
                  <rect x="5" y="39" width="16" height="16" fill="#784920"/>
                  <rect x="8" y="42" width="10" height="10" fill="white"/>
                  <rect x="10" y="44" width="6" height="6" fill="#784920"/>
                  {/* Random QR payload dots */}
                  <rect x="25" y="8" width="4" height="4" fill="#784920"/>
                  <rect x="31" y="12" width="4" height="4" fill="#784920"/>
                  <rect x="25" y="25" width="10" height="10" fill="#784920"/>
                  <rect x="39" y="25" width="4" height="4" fill="#784920"/>
                  <rect x="47" y="32" width="6" height="4" fill="#784920"/>
                  <rect x="25" y="42" width="6" height="6" fill="#784920"/>
                  <rect x="35" y="46" width="6" height="4" fill="#784920"/>
                  <rect x="47" y="45" width="4" height="6" fill="#784920"/>
                </svg>
                <span className="text-[7px] text-stone-600 font-mono mt-0.5">SCAN-PASS</span>
              </div>
              <div className="text-right pl-3">
                <p className="text-[10px] font-700 text-[#784920] dark:text-[#d4a876]">
                  MGM Animal Welfare Cell
                </p>
                <p className="text-[9px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                  Protected under Prevention of Cruelty to Animals Act. Community animal in managed care.
                </p>
                <p className="text-[9px] font-mono text-stone-400 mt-1">Helpline: +91 98221 45789</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="no-print flex gap-2 pt-5">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl border border-[#dbc8ad] dark:border-[#4a2e1c] text-[12px] font-600 hover:bg-[#faf6f1] dark:hover:bg-[#2a160a] transition-colors flex items-center justify-center gap-1.5"
            >
              🖨️ {t.printPass}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-xl bg-[#784920] hover:bg-[#633a18] text-white text-[12px] font-600 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? "✓ Link Copied!" : `🔗 ${t.sharePass}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
