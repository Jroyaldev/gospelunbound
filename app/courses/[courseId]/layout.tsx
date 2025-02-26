'use client';

import Link from 'next/link';
import { Home, FileText, BookOpen, Users, Info } from 'lucide-react';

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar - Fixed */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[#E5E7EB] bg-white/80 backdrop-blur-xl p-6 flex flex-col gap-6 z-30">
        <div className="mb-8">
          <Link href="/" className="text-xl font-semibold">
            Gospel <span className="text-gray-500">Unbound</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="nav-link">
            <Home className="w-5 h-5" />
            Home
          </Link>
          <Link href="/resources" className="nav-link">
            <FileText className="w-5 h-5" />
            Resources
          </Link>
          <Link href="/courses" className="nav-link active">
            <BookOpen className="w-5 h-5" />
            Courses
          </Link>
          <Link href="/community" className="nav-link">
            <Users className="w-5 h-5" />
            Community
          </Link>
          <Link href="/about" className="nav-link">
            <Info className="w-5 h-5" />
            About
          </Link>
        </nav>
      </aside>

      {children}
    </div>
  );
}
