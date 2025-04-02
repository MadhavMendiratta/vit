import Link from "next/link"
import { ArrowRight, Building, Map, Search, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchBox from "@/components/search-box"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="h-[70vh] bg-cover bg-center"
          style={{ backgroundImage: "url('/placeholder.svg?height=1080&width=1920')" }}
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4 animate-fade-in">
              VIT Vellore Infrastructure Catalog
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up">
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

      {/* Buildings Preview */}
      <section className="py-16 bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Campus Buildings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["CDMM", "GDN", "SMV"].map((building) => (
              <Link href={`/buildings/${building.toLowerCase()}`} key={building} className="group">
                <div className="bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 group-hover:translate-y-[-8px]">
                  <div className="h-48 bg-gray-800 relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('/placeholder.svg?height=400&width=600&text=${building}')` }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{building}</h3>
                    <p className="text-gray-400 mb-4">
                      {building === "CDMM" && "Centre for Disaster Mitigation and Management"}
                      {building === "GDN" && "G.D. Naidu Building"}
                      {building === "SMV" && "Sri M.Vishweshwaraiah Building"}
                    </p>
                    <div className="flex items-center text-primary">
                      <span>Explore</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                </div>
              </Link>
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