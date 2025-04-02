"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLabSuggestions } from "@/lib/buildings"

export default function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get all lab suggestions
  const allSuggestions = getLabSuggestions()

  // Update suggestions based on query
  const updateSuggestions = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const searchTermLower = searchQuery.toLowerCase()
    const matchedSuggestions = allSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(searchTermLower))
      .slice(0, 5) // Limit to 5 suggestions

    setSuggestions(matchedSuggestions)
  }

  // Update suggestions when query changes
  useEffect(() => {
    updateSuggestions(query)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto relative">
      <div className="relative flex-1">
        <Input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for buildings, labs, or facilities..."
          className="flex-1 bg-gray-900 border-gray-700 text-white"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden"
          >
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Button type="submit" className="bg-primary hover:bg-primary/90">
        <Search className="mr-2 h-4 w-4" /> Search
      </Button>
    </form>
  )
}

