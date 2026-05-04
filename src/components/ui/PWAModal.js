'use client'

import { isIOS } from '@/lib/utils'

export default function PWAModal({ isOpen, onClose, onNeverShow }) {
  if (!isOpen) return null

  const handleInstall = async () => {
    if (window.installPWA) {
      await window.installPWA()
    }
    onClose()
  }

  const handleNeverShow = () => {
    onNeverShow?.()
    onClose()
  }

  const isIOSDevice = isIOS()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#D4920A] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">ODA</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Installer ODA Market</h2>
              <p className="text-sm text-gray-500">Accès rapide et hors-ligne</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Installez ODA Market pour accéder rapidement à la marketplace,
            recevoir des notifications et fonctionner hors-ligne.
          </p>

          {/* iOS Instructions */}
          {isIOSDevice && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Sur iOS :</h3>
              <ol className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#D4920A] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700">Appuyez sur le bouton de partage</span>
                  <span className="text-xl">📤</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#D4920A] text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700">Sélectionnez "Sur l'écran d'accueil"</span>
                  <span className="text-xl">📱</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-[#D4920A] text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700">Confirmez en tapant "Ajouter"</span>
                  <span className="text-xl">✓</span>
                </li>
              </ol>
            </div>
          )}

          {/* Install Button (Android) */}
          {!isIOSDevice && (
            <button
              onClick={handleInstall}
              className="w-full bg-[#D4920A] hover:bg-[#b87808] text-white font-semibold py-3 px-6 rounded-xl mb-3 transition-colors"
            >
              📲 Installer maintenant
            </button>
          )}

          {/* Never show button */}
          <button
            onClick={handleNeverShow}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
          >
            Ne plus afficher
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
      `}</style>
    </div>
  )
}
