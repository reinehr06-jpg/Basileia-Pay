import { useState, useEffect } from 'react'
import { getCheckout } from '@/lib/api'

export function useTransaction(uuid: string) {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    getCheckout(uuid)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [uuid])

  return { data, loading, error }
}
