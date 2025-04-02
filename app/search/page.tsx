"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Building, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { buildings, getLabSuggestions } from "@/lib/buildings"

// Type for search results
type SearchResult = {
  buildingId: string
  buildingName: string
  roomNo: string
  roomName: string
  floor: string
  department: string
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const initialQuery = searchParams.q || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get all lab suggestions
  const allSuggestions = getLabSuggestions()

  // Search function
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const searchTermLower = searchQuery.toLowerCase()

    buildings.forEach((building) => {
      building.rooms.forEach((room) => {
        // Determine floor from room number
        let floor = "Ground Floor"
        if (room.roomNo.startsWith("G")) {
          floor = "Ground Floor"
        } else if (room.roomNo.startsWith("1")) {
          floor = "First Floor"
        } else if (room.roomNo.startsWith("2")) {
          floor = "Second Floor"
        } else if (room.roomNo.startsWith("3")) {
          floor = "Third Floor"
        }

        // Check if room name or number matches search term
        if (
          room.roomName.toLowerCase().includes(searchTermLower) ||
          room.roomNo.toLowerCase().includes(searchTermLower) ||
          room.department.toLowerCase().includes(searchTermLower)
        ) {
          searchResults.push({
            buildingId: building.id,
            buildingName: building.name,
            roomNo: room.roomNo,
            roomName: room.roomName,
            floor,
            department: room.department,
          })
        }
      })
    })

    setResults(searchResults)
  }

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

  // Handle search on initial load and when query changes
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  // Update suggestions when query changes
  useEffect(() => {
    updateSuggestions(query)
  }, [query])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
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
    performSearch(query)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    performSearch(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Search Facilities</h1>

      <form onSubmit={handleSearch} className="mb-8 relative">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for labs, rooms, or facilities..."
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
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </form>

      {results.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Search Results ({results.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <Link
                href={`/buildings/${result.buildingId}/facilities?highlight=${result.roomNo}`}
                key={index}
                className="group"
              >
                <div className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
                        {result.buildingName}
                      </span>
                      <span className="text-gray-400 text-sm">{result.floor}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {result.roomName}
                    </h3>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Room: {result.roomNo}</span>
                      <span>{result.department}</span>
                    </div>
                    <div className="mt-4 flex items-center text-primary text-sm">
                      <Building className="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No results found for "{query}"</p>
          <p className="text-gray-500 mt-2">Try searching for a lab name, room number, or department</p>
        </div>
      ) : null}
    </div>
  )
}

