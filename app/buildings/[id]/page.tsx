import Link from "next/link"
import { ArrowLeft, Building, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getBuildingData } from "@/lib/buildings"

export default function BuildingPage({ params }: { params: { id: string } }) {
  const buildingId = params.id
  const building = getBuildingData(buildingId)

  if (!building) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-8">Building Not Found</h1>
        <p className="mb-8">The building you are looking for does not exist.</p>
        <Link href="/buildings">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Buildings
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/buildings" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Buildings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="h-[300px] md:h-[400px] bg-gray-800 rounded-lg mb-6 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/placeholder.svg?height=800&width=1200&text=${building.name}')` }}
            />
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">{building.name}</h1>
          <h2 className="text-xl text-gray-400 mb-4">{building.fullName}</h2>
          <p className="text-gray-300 mb-6">{building.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Facilities:</h3>
            <ul className="list-disc list-inside text-gray-400">
              {building.facilities.map((facility, index) => (
                <li key={index}>{facility}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/buildings/${buildingId}/facilities`}>
              <Button className="w-full">
                <Building className="mr-2 h-4 w-4" /> View Facilities
              </Button>
            </Link>
            <Link href={`/navigation?building=${buildingId}`}>
              <Button variant="outline" className="w-full">
                <Map className="mr-2 h-4 w-4" /> Navigate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="floor-plan">Floor Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="p-6 bg-gray-900 rounded-lg mt-4">
          <h3 className="text-2xl font-bold mb-4">About {building.name}</h3>
          <p className="text-gray-300 mb-4">{building.description}</p>
          <p className="text-gray-300 mb-4">
            The {building.name} building consists of {building.floors} floors, housing various facilities including{" "}
            {building.facilities.join(", ").toLowerCase()}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-gray-400">VIT Vellore Campus</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Floors</h4>
              <p className="text-gray-400">{building.floors} Floors</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="floor-plan" className="p-6 bg-gray-900 rounded-lg mt-4">
          <h3 className="text-2xl font-bold mb-6">Floor Plan</h3>

          {/* Ground Floor */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 bg-gray-800 p-3 rounded">Ground Floor</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Room No</th>
                    <th className="p-3 text-left">Room Name</th>
                    <th className="p-3 text-left">Area (sqft)</th>
                    <th className="p-3 text-left">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {building.rooms
                    .filter((room) => room.roomNo.startsWith("G"))
                    .map((room, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}>
                        <td className="p-3">{room.roomNo}</td>
                        <td className="p-3">{room.roomName}</td>
                        <td className="p-3">{room.area}</td>
                        <td className="p-3">{room.department}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* First Floor */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 bg-gray-800 p-3 rounded">First Floor</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Room No</th>
                    <th className="p-3 text-left">Room Name</th>
                    <th className="p-3 text-left">Area (sqft)</th>
                    <th className="p-3 text-left">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {building.rooms
                    .filter((room) => room.roomNo.startsWith("1"))
                    .map((room, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}>
                        <td className="p-3">{room.roomNo}</td>
                        <td className="p-3">{room.roomName}</td>
                        <td className="p-3">{room.area}</td>
                        <td className="p-3">{room.department}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Second Floor - Only show if building has more than 2 floors */}
          {building.floors > 2 && (
            <div className="mb-8">
              <h4 className="text-xl font-semibold mb-4 bg-gray-800 p-3 rounded">Second Floor</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-3 text-left">Room No</th>
                      <th className="p-3 text-left">Room Name</th>
                      <th className="p-3 text-left">Area (sqft)</th>
                      <th className="p-3 text-left">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {building.rooms
                      .filter((room) => room.roomNo.startsWith("2"))
                      .map((room, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}>
                          <td className="p-3">{room.roomNo}</td>
                          <td className="p-3">{room.roomName}</td>
                          <td className="p-3">{room.area}</td>
                          <td className="p-3">{room.department}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Third Floor - Only show if building has more than 3 floors */}
          {building.floors > 3 && (
            <div className="mb-8">
              <h4 className="text-xl font-semibold mb-4 bg-gray-800 p-3 rounded">Third Floor</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="p-3 text-left">Room No</th>
                      <th className="p-3 text-left">Room Name</th>
                      <th className="p-3 text-left">Area (sqft)</th>
                      <th className="p-3 text-left">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {building.rooms
                      .filter((room) => room.roomNo.startsWith("3"))
                      .map((room, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/50"}>
                          <td className="p-3">{room.roomNo}</td>
                          <td className="p-3">{room.roomName}</td>
                          <td className="p-3">{room.area}</td>
                          <td className="p-3">{room.department}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

