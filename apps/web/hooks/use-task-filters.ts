import { useState, useEffect } from 'react'

export function useTaskFilters() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [category, setCategory] = useState('ALL')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const clearFilters = () => {
    setSearch('')
    setStatus('ALL')
    setPriority('ALL')
    setCategory('ALL')
  }

  return {
    search,
    setSearch,
    debouncedSearch,
    status,
    setStatus,
    priority,
    setPriority,
    category,
    setCategory,
    clearFilters
  }
}
