import { DogProfile, Language } from "../types"

interface Props {
  dogs?: DogProfile[]
  activeDog?: DogProfile
  onSelectDog?: (dog: DogProfile) => void
  lang?: Language
  dark?: boolean
  onSwitchToCitizen: () => void
}

export function AdminPortal({ onSwitchToCitizen }: Props) {
  return (
    <div className="w-full h-screen bg-[#fbf6f0] dark:bg-[#120a06] flex flex-col overflow-hidden">
      {/* Top Bar for Returning to Citizen Page */}
      <div className="bg-[#1f1209] text-[#f5ede3] border-b border-[#3d2414] px-6 py-2.5 flex items-center justify-between shadow-md z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCitizen}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#784920] hover:bg-[#8f5827] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>←</span>
            <span>Return to Citizen Dog View</span>
          </button>
          <span className="hidden sm:inline-block text-xs text-[#c8a68b] border-l border-[#3d2414] pl-3">
            Aurangabad Municipal Corporation • SmartDog Admin System
          </span>
        </div>


      </div>

      {/* Embedded Integrated Admin Dashboard */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#fbf6f0] dark:bg-[#120a06]">
        <iframe
          src="/admin-dashboard/index.html"
          title="SmartDog Admin Dashboard"
          className="w-full h-full border-0 block"
        />
      </div>
    </div>
  )
}
