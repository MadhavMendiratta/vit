import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black py-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">VIT Vellore</h3>
            <p className="text-gray-400 text-sm">Infrastructure Catalog System</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/buildings" className="text-gray-400 hover:text-primary">
                  Buildings
                </Link>
              </li>
              <li>
                <Link href="/navigation" className="text-gray-400 hover:text-primary">
                  Navigation
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Buildings</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/buildings/cdmm" className="text-gray-400 hover:text-primary">
                  CDMM
                </Link>
              </li>
              <li>
                <Link href="/buildings/gdn" className="text-gray-400 hover:text-primary">
                  GDN
                </Link>
              </li>
              <li>
                <Link href="/buildings/smv" className="text-gray-400 hover:text-primary">
                  SMV
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-sm text-gray-400">
              <p>VIT University</p>
              <p>Vellore, Tamil Nadu</p>
              <p>India - 632014</p>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} VIT Vellore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

