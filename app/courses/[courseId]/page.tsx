'use client';

import React from 'react';
import { genesisCourse } from '@/data/courses/genesis';
import { Course } from '@/types/course';
import { BookOpen, Clock, Star, Users2, GraduationCap, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// This would typically come from an API or database
const getCourse = (courseId: string): Course | null => {
  // For now, we only have the Genesis course
  if (courseId === 'genesis') {
    return genesisCourse;
  }
  return null;
};

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }): React.ReactElement {
  const resolvedParams = React.use(params);
  const course = getCourse(resolvedParams.courseId);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="pl-64">
      {/* Course Header */}
      <div className="h-[60vh] relative">
        {/* Course Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${course.image})` }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>

        {/* Course Info Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                  {course.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm">{course.rating}</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {course.lessons} lessons
                </div>
                <div className="flex items-center gap-2">
                  <Users2 className="w-5 h-5" />
                  {course.students.toLocaleString()} students
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Course Sections */}
            <div className="space-y-8">
              {course.sections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                    {section.description && (
                      <p className="text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {section.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <PlayCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {lesson.duration}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Instructor</h3>
              <div className="flex items-center gap-4">
                <img
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium">{course.instructor.name}</h4>
                  <p className="text-sm text-gray-600">{course.instructor.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">{course.instructor.bio}</p>
            </div>

            {/* Course Info Cards */}
            {course.prerequisites && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.objectives && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">What You'll Learn</h3>
                <ul className="space-y-2">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.materials && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-4">Materials Needed</h3>
                <ul className="space-y-2">
                  {course.materials.map((material, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <BookOpen className="w-4 h-4 mt-0.5 text-gray-400" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
