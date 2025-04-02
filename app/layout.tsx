import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NextAuthProvider } from "@/components/auth/provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { SessionValidator } from "@/components/SessionValidator"
import { AuthProtection } from "@/components/AuthProtection" // Add this import

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "VIT Vellore Infrastructure Catalog",
  description: "Explore VIT Vellore campus buildings, facilities, and navigate with ease",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <NextAuthProvider>
          <SessionValidator />
          {/* Add AuthProtection wrapper around ThemeProvider */}
          <AuthProtection>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="dark" 
              enableSystem={false} 
              disableTransitionOnChange
            >
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </ThemeProvider>
          </AuthProtection>
        </NextAuthProvider>
      </body>
    </html>
  )
}