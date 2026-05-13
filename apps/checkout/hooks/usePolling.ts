import { useState, useEffect, useRef } from 'react'
import { getCheckoutStatus } from '@/lib/api'

export function usePolling(uuid: string, active: boolean, onApproved: () => void) {
  const [status, setStatus] = useState<string>('pending')
  const [pixData, setPixData] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!active) return

    intervalRef.current = setInterval(async () => {
      const res = await getCheckoutStatus(uuid)
      setStatus(res.status)
      if (res.pix) setPixData(res.pix)
      if (res.status === 'approved') {
        clearInterval(intervalRef.current!)
        onApproved()
      }
    }, 3000)

    return () => clearInterval(intervalRef.current!)
  }, [uuid, active, onApproved])

  return { status, pixData }
}
