'use client'

import { useState, useEffect, useCallback } from 'react'
import { isStandalone, isIOS } from '@/lib/utils'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(isStandalone())

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setShowGuide(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Auto-show modal after 2.5s if not installed and not dismissed
  useEffect(() => {
    if (isInstalled) return
    if (localStorage.getItem('oda-modal-never')) return
    if (sessionStorage.getItem('oda-modal-shown')) return

    const t = setTimeout(() => {
      if (deferredPrompt && !isIOS()) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setDeferredPrompt(null)
          }
        })
      } else if (isIOS() || !deferredPrompt) {
        setShowGuide(true)
      }
      sessionStorage.setItem('oda-modal-shown', '1')
    }, 2500)

    return () => clearTimeout(t)
  }, [deferredPrompt, isInstalled])

  const promptInstall = useCallback(async () => {
    if (isStandalone()) return false

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
      return outcome === 'accepted'
    } else {
      setShowGuide(true)
      return false
    }
  }, [deferredPrompt])

  const neverShow = useCallback(() => {
    localStorage.setItem('oda-modal-never', '1')
    setShowGuide(false)
  }, [])

  return {
    canInstall: !!deferredPrompt || isIOS() || !isInstalled,
    isInstalled,
    isIOSDevice: isIOS(),
    promptInstall,
    showGuide,
    setShowGuide,
    neverShow,
  }
}
