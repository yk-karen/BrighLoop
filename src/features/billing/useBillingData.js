import { useCallback, useEffect, useState } from 'react'

export function useBillingData(loader) {
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      setState({ data: await loader(), loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error: error.message || 'Unable to load billing data.' })
    }
  }, [loader])

  useEffect(() => {
    // Initial async loading intentionally updates this hook's state.
    // oxlint-disable-next-line react/set-state-in-effect
    reload()
  }, [reload])

  return { ...state, reload }
}
