"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Building, MapPin, Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildings } from "@/lib/buildings"

// Type definitions for better type safety
interface Room {
  roomNo: string
  roomName: string
  department: string
}

interface Building {
  id: string
  name: string
  floors: number
  rooms: Room[]
}

export default function NavigationPage() {
  const [selectedBuilding, setSelectedBuilding] = useState("")
  const [selectedFloor, setSelectedFloor] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [showMap, setShowMap] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get the current building data
  const currentBuilding = useMemo(() => 
    buildings.find((b) => b.id === selectedBuilding), 
    [selectedBuilding]
  )

  // Get floors for the selected building
  const floors = useMemo(() => 
    currentBuilding
      ? Array.from({ length: currentBuilding.floors }, (_, i) => (i === 0 ? "Ground Floor" : `Floor ${i}`))
      : [],
    [currentBuilding]
  )

  // Get rooms for the selected floor with improved logic
  const rooms = useMemo(() => {
    if (!currentBuilding || !selectedFloor) return []
    
    return currentBuilding.rooms.filter((room) => {
      // More robust floor detection logic
      if (selectedFloor === "Ground Floor") {
        // Check for both "G" prefix and "0" prefix for ground floor rooms
        return room.roomNo.startsWith("G") || room.roomNo.startsWith("0");
      } else {
        // For other floors, extract floor number and match more intelligently
        const floorNum = selectedFloor.split(" ")[1]
        
        // Handle both cases: floor number as prefix or embedded in room number
        return room.roomNo.startsWith(floorNum) || 
               (room.roomNo.length >= 3 && room.roomNo.charAt(0) === floorNum);
      }
    }).sort((a, b) => a.roomNo.localeCompare(b.roomNo));  // Sort rooms by number
  }, [currentBuilding, selectedFloor])

  const getDetailedDirections = (buildingId: string, floor: string, roomNo: string) => {
    try {
      // Get the current building data
      const building = buildings.find((b) => b.id === buildingId)
      if (!building) return <p className="text-red-400">Building information not available.</p>

      // Get the selected room
      const room = building.rooms.find((r) => r.roomNo === roomNo)
      if (!room) return <p className="text-red-400">Room information not available.</p>

      // Improved nearby facilities calculation
      const isOnSameFloor = (roomNum: string) => {
        if (floor === "Ground Floor") {
          return roomNum.startsWith("G") || roomNum.startsWith("0");
        } else {
          const floorNum = floor.split(" ")[1];
          return roomNum.startsWith(floorNum) || 
                 (roomNum.length >= 3 && roomNum.charAt(0) === floorNum);
        }
      };

      const getRoomNumber = (roomNum: string) => {
        return parseInt(roomNum.replace(/\D/g, ""), 10) || 0;
      };

      const nearbyFacilities = building.rooms
        .filter(r => 
          // Must be different from the target room
          r.roomNo !== roomNo && 
          // Must be on the same floor
          isOnSameFloor(r.roomNo) &&
          // Room number should be close
          Math.abs(getRoomNumber(r.roomNo) - getRoomNumber(roomNo)) <= 3 &&
          // Should be a significant facility
          (r.roomName.toLowerCase().includes("lab") ||
           r.roomName.toLowerCase().includes("toilet") ||
           r.roomName.toLowerCase().includes("washroom") ||
           r.roomName.toLowerCase().includes("class"))
        )
        .slice(0, 2); // Get up to 2 nearby facilities

      // Generate directions
      return (
        <>
          <p>1. Enter the {building.name} building from the main entrance.</p>
          {floor === "Ground Floor" ? (
            <p>2. You are already on the Ground Floor.</p>
          ) : (
            <p>2. Take the stairs or elevator to reach {floor}.</p>
          )}
          <p>
            3. Look for Room {roomNo} ({room.roomName}).
          </p>
          {nearbyFacilities.length > 0 && (
            <p>4. The room is located near {nearbyFacilities.map((r) => `${r.roomName} (${r.roomNo})`).join(" and ")}.</p>
          )}
          <p>5. The room belongs to the {room.department} department.</p>
        </>
      )
    } catch (error) {
      console.error("Error generating directions:", error);
      return <p className="text-red-400">Unable to generate directions. Please try again.</p>;
    }
  }

  const handleNavigate = () => {
    if (selectedBuilding && selectedFloor && selectedRoom) {
      setIsLoading(true);
      // Simulate API call or processing time
      setTimeout(() => {
        setShowMap(true);
        setIsLoading(false);
      }, 500);
    }
  }

  // Complete reset functionality
  const handleReset = () => {
    setShowMap(false);
    setSelectedRoom("");
    setSelectedFloor("");
    setSelectedBuilding("");
  }

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Campus Navigation</h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Building</label>
                <Select
                  value={selectedBuilding}
                  onValueChange={(value) => {
                    setSelectedBuilding(value);
                    setSelectedFloor("");
                    setSelectedRoom("");
                    setShowMap(false);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBuilding && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Floor</label>
                  <Select
                    value={selectedFloor}
                    onValueChange={(value) => {
                      setSelectedFloor(value);
                      setSelectedRoom("");
                      setShowMap(false);
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((floor, index) => (
                        <SelectItem key={index} value={floor}>
                          {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedFloor && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Room {rooms.length === 0 && "- No rooms available"}
                  </label>
                  <Select
                    value={selectedRoom}
                    onValueChange={(value) => {
                      setSelectedRoom(value);
                      setShowMap(false);
                    }}
                    disabled={isLoading || rooms.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={rooms.length === 0 ? "No rooms available" : "Select a room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.length > 0 ? (
                        rooms.map((room, index) => (
                          <SelectItem key={index} value={room.roomNo}>
                            {room.roomNo} - {room.roomName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">
                          No rooms available on this floor
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleNavigate} 
                disabled={!selectedBuilding || !selectedFloor || !selectedRoom || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" /> Navigate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!showMap ? (
            <div className="bg-gray-900 p-6 rounded-lg h-full flex items-center justify-center shadow-md">
              <div className="text-center">
                <Building className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-xl font-medium mb-2">Select a destination</h2>
                <p className="text-gray-400">Choose a building, floor, and room to navigate to</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-md">
              <div className="p-4 bg-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span>
                    {currentBuilding?.name} &gt; {selectedFloor} &gt; Room {selectedRoom}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">External Navigation</h3>
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">Google Maps Integration</p>
                      <p className="text-xs text-gray-500">
                        (External navigation will be integrated with Google Maps API)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Internal Navigation</h3>
                  <div className="aspect-video bg-gray-800 rounded-lg p-4">
                    <div className="h-full flex flex-col">
                      <div className="text-center mb-4">
                        <h4 className="font-medium">Directions to Room {selectedRoom}</h4>
                        <p className="text-sm text-gray-400">
                          {currentBuilding?.name} &gt; {selectedFloor}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <div className="text-gray-300 space-y-2">
                          {getDetailedDirections(selectedBuilding, selectedFloor, selectedRoom)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}