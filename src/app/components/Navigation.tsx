"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold">
              OpenAI Style
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              href="/dairy"
              className={`${
                pathname === "/dairy" 
                  ? "text-pink-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Dairy
            </Link>
            <Link 
              href="/about"
              className={`${
                pathname === "/about" 
                  ? "text-pink-600" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
