import { useState, useEffect, useCallback } from 'react'
import { restaurantService } from '@/features/restaurants/services/restaurantService'

export function useRestaurants({ cuisine, search } = {}) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await restaurantService.getAll({
      cuisine: cuisine || undefined,
      search: search || undefined,
    })

    if (err) {
      setError(err.message)
    } else {
      setRestaurants(data || [])
    }
    setLoading(false)
  }, [cuisine, search])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { restaurants, loading, error, refetch: fetch }
}
