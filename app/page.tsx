"use client";

import Link from "next/link"
import { ArrowRight, Building, Map, Search, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBox from "@/components/search-box"
import { useState, useEffect } from "react"

// Enhanced image mapping function for buildings with better fallbacks
function getBuildingImagePath(buildingId: string): string {
  // Real image paths
  const imageMap: Record<string, string> = {
    "CDMM": "/images/buildings/cdmm.jpg",
    "GDN": "/images/buildings/gdn.jpg", 
    "SMV": "/images/buildings/smv.jpg"
  };
  
  // Fallback descriptions for better placeholders
  const buildingDescriptions: Record<string, string> = {
    "CDMM": "Centre for Disaster Mitigation",
    "GDN": "G.D. Naidu Building",
    "SMV": "Sri M.Vishweshwaraiah Building"
  };
  
  // Return the image path based on buildingId
  return imageMap[buildingId] || 
    `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(buildingDescriptions[buildingId] || buildingId)}`;
}

// Enhanced component for building preview cards - FIXED EQUAL HEIGHT
function BuildingCard({ id, name, fullName }: { id: string, name: string, fullName: string }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Handle image loading status
  useEffect(() => {
    const img = new Image();
    img.src = getBuildingImagePath(name);
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, [name]);

  return (
    <Link href={`/buildings/${id.toLowerCase()}`} className="group">
      <div className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 group-hover:translate-y-[-8px] h-full flex flex-col">
        {/* Fixed image height */}
        <div className="h-48 bg-gray-800 relative overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ 
              backgroundImage: `url('${getBuildingImagePath(name)}')`,
              opacity: imageLoaded ? 1 : 0.7
            }}
          />
          {(!imageLoaded || imageError) && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center p-4">
                <div className="text-xl font-bold">{name}</div>
                <div className="text-sm text-gray-400">{fullName}</div>
              </div>
            </div>
          )}
        </div>
        {/* Fixed content height */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
          {/* Fixed height for description with overflow handling */}
          <div className="h-16 mb-4 overflow-hidden">
            <p className="text-gray-400 line-clamp-2">
              {fullName}
            </p>
          </div>
          {/* Push "Explore" to the bottom */}
          <div className="mt-auto flex items-center text-primary">
            <span>Explore</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  // Building data for consistent usage
  const buildings = [
    { id: "cdmm", name: "CDMM", fullName: "Centre for Disaster Mitigation and Management" },
    { id: "gdn", name: "GDN", fullName: "G.D. Naidu Building" },
    { id: "smv", name: "SMV", fullName: "Sri M.Vishweshwaraiah Building" }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with better image handling */}
      <section className="relative">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div
          className="h-[70vh] bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/images/main.jpg')", 
            backgroundPosition: "center 40%" 
          }}
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4 animate-fade-in drop-shadow-lg">
              VIT Vellore Infrastructure Catalog
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up drop-shadow-md">
              Explore our campus buildings, facilities, and navigate with ease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link href="/buildings">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Explore Buildings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/navigation">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Navigate Campus <Map className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {/* Login Button */}
              <Link href="/auth/login">
                <Button size="lg" variant="secondary" className="bg-white/90 text-black hover:bg-white">
                  Login <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-black">
        <div className="container px-4 md:px-6 mx-auto">
          <SearchBox />
        </div>
      </section>

      {/* Buildings Preview - UPDATED WITH ENHANCED BUILDING CARDS */}
      <section className="py-16 bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Campus Buildings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buildings.map((building) => (
              <BuildingCard 
                key={building.id}
                id={building.id}
                name={building.name}
                fullName={building.fullName}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-black">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg">
              <Building className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Building Details</h3>
              <p className="text-gray-400">
                Comprehensive information about each building, including facilities, labs, and auditoriums.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <Map className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Navigation</h3>
              <p className="text-gray-400">External and internal navigation to help you find your way around campus.</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <Search className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Search</h3>
              <p className="text-gray-400">Quickly find specific rooms, labs, or facilities across the campus.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}