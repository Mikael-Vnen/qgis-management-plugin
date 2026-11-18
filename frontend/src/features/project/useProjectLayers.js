import { useState, useEffect, useCallback, useRef } from 'react'
import { qgisListCurrentLayers } from '../../qgisBridge.js'

export default function useProjectLayers() {
  const [layers, setLayers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const latestRequest = useRef(0)

  const refreshLayers = useCallback(async () => {
    const requestId = ++latestRequest.current

    setLoading(true)
    setError('')

    try {
      const result = await qgisListCurrentLayers()

      if (!Array.isArray(result)) {
        throw new TypeError('QGIS returned an invalid layer list.')
      }

      if (requestId === latestRequest.current) {
        setLayers(result)
      }
    } catch (err) {
      if (requestId === latestRequest.current) {
        setError(err instanceof Error ? err.message : String(err))
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    function handleWindowOpened() {
      refreshLayers()
    }

    window.addEventListener('qgis-window-opened', handleWindowOpened)
    refreshLayers()

    return () => {
      window.removeEventListener('qgis-window-opened', handleWindowOpened)
      latestRequest.current += 1
    }
  }, [refreshLayers])

  return { layers, loading, error, refreshLayers }
}
