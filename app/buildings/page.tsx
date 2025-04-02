import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function BuildingsPage() {
  const buildings = [
    {
      id: "cdmm",
      name: "CDMM",
      fullName: "Centre for Disaster Mitigation and Management",
      description: "Houses research labs, faculty cabins, and conference rooms focused on disaster management studies.",
      facilities: ["Research Labs", "Conference Rooms", "Faculty Cabins", "GIS Lab"],
      floors: 4,
    },
    {
      id: "gdn",
      name: "GDN",
      fullName: "G.D. Naidu Building",
      description:
        "Home to engineering labs, workshops, and classrooms for mechanical and civil engineering departments.",
      facilities: ["Engineering Labs", "Workshops", "Classrooms", "Research Centers"],
      floors: 2,
    },
    {
      id: "smv",
      name: "SMV",
      fullName: "S.M. Viswanathan Building",
      description:
        "Houses biotechnology labs, research facilities, and classrooms for life sciences and biotechnology.",
      facilities: ["Biotechnology Labs", "Research Labs", "Classrooms", "Auditoriums"],
      floors: 4,
    },
  ]

  return (
    <div className="container px-4 md:px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Campus Buildings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {buildings.map((building) => (
          <Link href={`/buildings/${building.id}`} key={building.id} className="group">
            <div className="bg-gray-900 rounded-lg overflow-hidden h-full transition-transform duration-300 group-hover:translate-y-[-8px]">
              <div className="h-48 bg-gray-800 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('/placeholder.svg?height=400&width=600&text=${building.name}')` }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{building.name}</h2>
                <h3 className="text-lg text-gray-400 mb-4">{building.fullName}</h3>
                <p className="text-gray-300 mb-4">{building.description}</p>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Facilities:</h4>
                  <ul className="list-disc list-inside text-gray-400">
                    {building.facilities.map((facility, index) => (
                      <li key={index}>{facility}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center text-primary">
                  <span>View Details</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

