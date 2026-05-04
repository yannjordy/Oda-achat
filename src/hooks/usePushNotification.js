'use client'

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState(Notification?.permission || 'default')
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
    }
  }, [])

  const subscribeUserToPush = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications not supported on this browser')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready

      // Check for existing subscription
      let existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        setSubscription(existingSubscription)
        setLoading(false)
        return existingSubscription
      }

      // Request permission
      if (permission !== 'granted') {
        const permissionResult = await Notification.requestPermission()
        if (permissionResult !== 'granted') {
          setError('Notification permission denied')
          setLoading(false)
          return null
        }
        setPermission(permissionResult)
      }

      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
          ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          : null,
      })

      setSubscription(newSubscription)

      await fetch('/api/subscribe-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription.toJSON()),
      })

      setLoading(false)
      return newSubscription
    } catch (err) {
      console.error('Error subscribing to push:', err)
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [isSupported, permission])

  const unsubscribeUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        const success = await existingSubscription.unsubscribe()

        await fetch('/api/unsubscribe-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
        })

        if (success) {
          setSubscription(null)
        }
      }

      setLoading(false)
      return true
    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setError('Notifications not supported')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      return subscribeUserToPush()
    }

    return false
  }, [subscribeUserToPush])

  const testLocalNotification = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TEST_NOTIFICATION',
        title: 'ODA Market - Test',
        body: 'Les notifications push fonctionnent!',
      })
    }
  }, [])

  return {
    isSupported,
    permission,
    subscription,
    loading,
    error,
    subscribe: subscribeUserToPush,
    unsubscribe: unsubscribeUser,
    requestPermission,
    testNotification: testLocalNotification,
  }
}
