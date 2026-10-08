import { useState } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (officerName: string) => void
  dark: boolean
  lang?: any
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  dark,
}: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    setTimeout(() => {
      if (username.trim() === "admin" && password === "admin123") {
        setIsSubmitting(false)
        onLoginSuccess("Administrator")
      } else {
        setIsSubmitting(false)
        setErrorMsg("Invalid username or password.")
      }
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-sm rounded-[22px] overflow-hidden shadow-2xl border transition-all"
        style={{
          background: dark ? "#1c1007" : "#ffffff",
          borderColor: dark ? "#2e1a0a" : "#ede5d8",
          color: dark ? "#f0e6d8" : "#2c1a0e",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{
            background: dark ? "#241308" : "#fbf7f2",
            borderColor: dark ? "#331c0e" : "#f0e6d8",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs text-[19px]"
              style={{ background: "#784920", color: "#ffffff" }}
            >
              🔐
            </div>
            <div>
              <h3 className="text-[16px] font-700 tracking-tight">
                Admin Portal Login
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Enter your credentials to manage records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 text-[11.5px] flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-[12px] font-600 mb-1.5 opacity-80">
              Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border bg-stone-50 dark:bg-[#201108] border-stone-200 dark:border-[#381f10] focus:outline-none focus:ring-2 focus:ring-[#784920]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-600 opacity-80">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#784920] dark:text-[#d4a876] hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border bg-stone-50 dark:bg-[#201108] border-stone-200 dark:border-[#381f10] focus:outline-none focus:ring-2 focus:ring-[#784920]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-[13px] font-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#784920] hover:bg-[#653c19] text-white text-[13px] font-600 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
