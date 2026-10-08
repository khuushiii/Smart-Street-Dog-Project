import { useState, useEffect } from "react"
import { DogProfile, Language } from "../types"
import { TRANSLATIONS } from "../data/translations"

interface Props {
  dogs: DogProfile[]
  lang: Language
  onSelectDog: (dog: DogProfile) => void
  onClose: () => void
}

export function QrScannerModal({ dogs, lang, onSelectDog, onClose }: Props) {
  const t = TRANSLATIONS[lang]
  const [scanning, setScanning] = useState(true)
  const [detectedDog, setDetectedDog] = useState<DogProfile | null>(null)

  useEffect(() => {
    // Auto-detect after 2 seconds for a realistic scanning experience
    const timer = setTimeout(() => {
      // Pick a random dog or the first one
      const sample = dogs[Math.floor(Math.random() * dogs.length)]
      setDetectedDog(sample)
      setScanning(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [dogs])

  const handleManualPick = (dog: DogProfile) => {
    setDetectedDog(dog)
    setScanning(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#1a0f07] text-[#2c1a0e] dark:text-[#f0e6d8] rounded-[24px] max-w-md w-full overflow-hidden shadow-2xl border border-[#ede5d8] dark:border-[#2e1a0a]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ede5d8] dark:border-[#2e1a0a] flex items-center justify-between bg-[#faf6f1] dark:bg-[#221208]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📷</span>
            <h3 className="text-[15px] font-700 text-[#784920] dark:text-[#d4a876]">
              {t.qrScannerTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 text-center">
          {/* Scanner Viewfinder Box */}
          <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-700 flex flex-col items-center justify-center shadow-inner">
            {/* Camera feed simulation backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-black opacity-90 flex items-center justify-center">
              <span className="text-6xl opacity-20">🐾</span>
            </div>

            {/* Viewfinder Target Borders */}
            <div className="absolute inset-6 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"/>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"/>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"/>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg"/>
            </div>

            {/* Laser scanning bar */}
            {scanning && (
              <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce"/>
            )}

            {/* Detected Tag Overlay */}
            {detectedDog && !scanning ? (
              <div className="relative z-10 p-4 bg-white/95 dark:bg-stone-900/95 rounded-xl border border-emerald-500 shadow-lg text-center max-w-[220px]">
                <div className="w-12 h-12 rounded-full mx-auto overflow-hidden border-2 border-emerald-500 mb-2">
                  <img src={detectedDog.photo} alt={detectedDog.name} className="w-full h-full object-cover"/>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">✓ Tag Verified</p>
                <p className="text-[14px] font-bold text-stone-900 dark:text-white">{detectedDog.name}</p>
                <p className="text-[11px] font-mono text-stone-500">{detectedDog.code}</p>
              </div>
            ) : (
              <div className="relative z-10 text-white/80 text-[12px] font-medium px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xs">
                {t.simulatingScan}
              </div>
            )}
          </div>

          <p className="text-[12px] text-stone-500 dark:text-stone-400 mt-4 leading-relaxed">
            {detectedDog && !scanning ? t.tagDetected : t.qrScannerDesc}
          </p>

          {/* Action if detected */}
          {detectedDog && !scanning ? (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setScanning(true)
                  setDetectedDog(null)
                }}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-[12px] font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Scan Again
              </button>
              <button
                onClick={() => {
                  onSelectDog(detectedDog)
                  onClose()
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#784920] hover:bg-[#633a18] text-white text-[12px] font-semibold transition-colors"
              >
                {t.viewProfileNow}
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Simulate Scanning Specific Tag:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {dogs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleManualPick(d)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#faf6f1] dark:bg-[#221208] border border-[#ede5d8] dark:border-[#381c0e] font-medium hover:border-[#784920] transition-colors"
                  >
                    🏷️ {d.name} ({d.code})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
