"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLabSuggestions } from "@/lib/buildings"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get all lab suggestions
  const allSuggestions = getLabSuggestions()

  // Update suggestions based on query
  const updateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const searchTermLower = query.toLowerCase()
    const matchedSuggestions = allSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(searchTermLower))
      .slice(0, 5) // Limit to 5 suggestions

    setSuggestions(matchedSuggestions)
  }

  // Update suggestions when query changes
  useEffect(() => {
    updateSuggestions(searchQuery)
  }, [searchQuery])

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

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">VIT Vellore</span>
        </Link>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/buildings" className="transition-colors hover:text-primary">
              Buildings
            </Link>
            <Link href="/navigation" className="transition-colors hover:text-primary">
              Navigation
            </Link>
          </nav>
          <div className="hidden md:flex ml-auto">
            <form action="/search" method="get" className="flex relative">
              <Input
                ref={searchInputRef}
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Quick search..."
                className="w-[200px] bg-gray-900 border-gray-700 text-white mr-2"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full mt-1 w-[200px] bg-gray-900 border border-gray-700 rounded-md shadow-lg overflow-hidden"
                >
                  <ul className="py-1">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm truncate"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="flex md:hidden ml-auto">
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="sr-only">Toggle Menu</span>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-16 left-0 z-50 w-full p-4 bg-black border-b border-gray-800">
            <nav className="grid gap-2">
              <Link
                href="/"
                className="flex items-center py-2 text-lg font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/buildings"
                className="flex items-center py-2 text-lg font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Buildings
              </Link>
              <Link
                href="/navigation"
                className="flex items-center py-2 text-lg font-semibold hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Navigation
              </Link>
              <form action="/search" method="get" className="mt-4">
                <Input
                  name="q"
                  placeholder="Search..."
                  className="w-full bg-gray-900 border-gray-700 text-white mb-2"
                />
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </form>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

