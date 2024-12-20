"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className={`fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 transition-transform duration-300 ${
      pathname === "/diary" ? "-translate-y-full hover:translate-y-0" : ""
    }`}>
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-light text-gray-900">
              Not Alone
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link 
              href="/diary"
              className={`${
                pathname === "/diary" 
                  ? "text-primary/90" 
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors text-sm font-light`}
            >
              Diary
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
