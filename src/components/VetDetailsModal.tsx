import { DogProfile, Language } from "../types"
import { TRANSLATIONS } from "../data/translations"

interface Props {
  dog: DogProfile
  lang: Language
  onClose: () => void
}

export function VetDetailsModal({ dog, lang, onClose }: Props) {
  const t = TRANSLATIONS[lang]
  const v = dog.vetRecord

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#1a0f07] text-[#2c1a0e] dark:text-[#f0e6d8] rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-[#ede5d8] dark:border-[#2e1a0a]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ede5d8] dark:border-[#2e1a0a] flex items-center justify-between bg-[#faf6f1] dark:bg-[#221208]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#784920]/10 dark:bg-[#d4a876]/10 flex items-center justify-center text-[#784920] dark:text-[#d4a876]">
              🩺
            </div>
            <div>
              <h3 className="text-[15px] font-700 text-[#784920] dark:text-[#d4a876]">
                {dog.name}'s Health Summary ({dog.code})
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Simple health check & vaccination info for citizens
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
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Rabies Safety Highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <div>
                <p className="text-[13.5px] font-700 text-emerald-800 dark:text-emerald-300">
                  Rabies Protected & Safe
                </p>
                <p className="text-[11.5px] text-stone-600 dark:text-stone-300">
                  Vaccinated on <strong>{v.vaccineDate}</strong> • Valid until <strong>{v.vaccineExpiry}</strong>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              ✓ Fully Safe
            </span>
          </div>

          {/* Citizen-Friendly Health Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sterilisation */}
            <div className="rounded-xl border border-[#ede5d8] dark:border-[#381c0e] p-3.5 bg-[#faf6f1]/60 dark:bg-[#1f1007]/60 flex items-start gap-3">
              <span className="text-2xl mt-0.5">✂️</span>
              <div>
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block font-medium">Neutered / Sterilised</span>
                <span className="font-700 text-[13px] text-emerald-700 dark:text-emerald-400">Yes, Completed</span>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Ear-notched as per municipal animal welfare guidelines
                </p>
              </div>
            </div>

            {/* Deworming */}
            <div className="rounded-xl border border-[#ede5d8] dark:border-[#381c0e] p-3.5 bg-[#faf6f1]/60 dark:bg-[#1f1007]/60 flex items-start gap-3">
              <span className="text-2xl mt-0.5">🪱</span>
              <div>
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block font-medium">Deworming Treatment</span>
                <span className="font-700 text-[13px] text-emerald-700 dark:text-emerald-400">Up to date</span>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Last dose on {v.dewormingDate}
                </p>
              </div>
            </div>

            {/* Weight */}
            <div className="rounded-xl border border-[#ede5d8] dark:border-[#381c0e] p-3.5 bg-[#faf6f1]/60 dark:bg-[#1f1007]/60 flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚖️</span>
              <div>
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block font-medium">Body Weight</span>
                <span className="font-700 text-[13px] text-stone-800 dark:text-stone-200">{v.weightKg} kg</span>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Healthy body condition score
                </p>
              </div>
            </div>

            {/* General Temperament */}
            <div className="rounded-xl border border-[#ede5d8] dark:border-[#381c0e] p-3.5 bg-[#faf6f1]/60 dark:bg-[#1f1007]/60 flex items-start gap-3">
              <span className="text-2xl mt-0.5">🐶</span>
              <div>
                <span className="text-stone-500 dark:text-stone-400 text-[11px] block font-medium">Temperament</span>
                <span className="font-700 text-[13px] text-stone-800 dark:text-stone-200">{dog.nature}</span>
                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Accustomed to campus community
                </p>
              </div>
            </div>
          </div>

          {/* Simple Citizen Note */}
          <div className="rounded-xl border border-[#ede5d8] dark:border-[#381c0e] p-4 bg-[#faf6f1]/70 dark:bg-[#1f1007]/70">
            <h4 className="text-[12px] font-700 text-[#784920] dark:text-[#d4a876] mb-1 flex items-center gap-1.5">
              <span>📝</span> Caretaker & Vet Notes for Citizens
            </h4>
            <p className="text-[12px] text-stone-600 dark:text-stone-300 leading-relaxed">
              {v.clinicalNotes}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#784920] hover:bg-[#633a18] text-white text-[12px] font-semibold transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
