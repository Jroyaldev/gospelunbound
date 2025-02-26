'use client';

import React from 'react';
import { genesisCourse } from '@/data/courses/genesis';
import { Course, Lesson } from '@/types/course';
import { ArrowLeft, ChevronRight, BookOpen, MessageCircle } from 'lucide-react';
import Link from 'next/link';

// This would typically come from an API or database
const getCourseAndLesson = (courseId: string, lessonId: string): { course: Course; lesson: Lesson } | null => {
  if (courseId === 'genesis') {
    const course = genesisCourse;
    const lesson = course.sections
      .flatMap(section => section.lessons)
      .find(lesson => lesson.id === lessonId);
    
    if (lesson) {
      return { course, lesson };
    }
  }
  return null;
};

function VideoContent({ content }: { content: any }): React.ReactElement {
  return (
    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-8">
      <div className="w-full h-full flex items-center justify-center text-white">
        Video Player Placeholder
      </div>
    </div>
  );
}

function TextContent({ content }: { content: any }): React.ReactElement {
  return (
    <div className="prose prose-blue max-w-none mb-8">
      {content.body.split('\\n').map((paragraph: string, index: number) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

function ScriptureContent({ content }: { content: any }): React.ReactElement {
  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 text-blue-600 mb-2">
        <BookOpen className="w-5 h-5" />
        <span className="font-medium">{content.reference}</span>
      </div>
      <p className="text-gray-900">{content.text}</p>
      <p className="text-sm text-gray-500 mt-2">{content.translation}</p>
    </div>
  );
}

function DiscussionContent({ content }: { content: any }): React.ReactElement {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 text-gray-900 mb-2">
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">Discussion Question</span>
      </div>
      <p className="text-gray-900 mb-2">{content.question}</p>
      <p className="text-sm text-gray-600">{content.prompt}</p>
    </div>
  );
}

const ContentComponent: Record<string, any> = {
  video: VideoContent,
  text: TextContent,
  scripture: ScriptureContent,
  discussion: DiscussionContent,
};

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; lessonId: string }> 
}): React.ReactElement {
  const resolvedParams = React.use(params);
  const data = getCourseAndLesson(resolvedParams.courseId, resolvedParams.lessonId);

  if (!data) {
    return <div>Lesson not found</div>;
  }

  const { course, lesson } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-100 z-20">
        <div className="h-full flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${course.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Course
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="text-sm text-gray-600">{course.title}</div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="font-medium">{lesson.title}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 pl-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{lesson.description}</p>

          {/* Lesson Contents */}
          {lesson.contents.map((content, index) => {
            const Component = ContentComponent[content.type];
            return Component ? (
              <Component key={index} content={content.content} />
            ) : null;
          })}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t">
            <button className="px-6 py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 rounded-lg hover:bg-gray-50">
              <ArrowLeft className="w-5 h-5" />
              Previous Lesson
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              Next Lesson
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
