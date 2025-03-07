'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, BookOpen, Users, Star, Play, BookmarkPlus, GraduationCap, ChevronDown, CheckCircle, Lock, Share2, Download, Heart, MessageCircle, Check, FileText, VideoIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { motion } from 'framer-motion';

// Define proper types for lessons and sections
interface Lesson {
  title: string;
  description: string;
  duration: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  tags: string[];
}

interface CourseSection {
  title: string;
  lessons: Lesson[];
}

interface LessonRowProps {
  lesson: Lesson;
  sectionIndex: number;
  lessonIndex: number;
  onToggleCompleted: (sectionIndex: number, lessonIndex: number) => void;
}

function LessonRow({ lesson, sectionIndex, lessonIndex, onToggleCompleted }: LessonRowProps): JSX.Element {
  return (
    <div 
      className={`group relative rounded-xl p-2 sm:p-3 mb-1.5 sm:mb-2 last:mb-0 transition-all duration-200 touch-target
        ${lesson.isCompleted ? 'bg-accent/10' : 'bg-secondary hover:bg-secondary/80'}`}
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onToggleCompleted(sectionIndex, lessonIndex)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
          aria-label={lesson.isCompleted ? "Mark as incomplete" : "Mark as completed"}
        >
          {lesson.isCompleted ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-accent/20 flex items-center justify-center">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
            </div>
          ) : (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 border-muted-foreground/30 group-hover:border-muted-foreground/50 transition-colors duration-200" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-medium text-foreground truncate">
                {lesson.title}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                {lesson.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] sm:text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                  {lesson.duration}
                </span>
              </div>
            </div>
            
            <a
              href={`/courses/genesis/lessons/${sectionIndex}-${lessonIndex}`}
              className="shrink-0 p-2 rounded-lg bg-secondary hover:bg-accent/20 text-muted-foreground hover:text-accent/80 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Start lesson"
            >
              {lesson.isLocked ? (
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenesisCoursePage() {
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]); // Default expand first section
  const [sections, setSections] = useState<CourseSection[]>([
    {
      title: "Introduction to Genesis",
      lessons: [
        { 
          title: "Overview and Historical Context", 
          description: "An introduction to the Book of Genesis and its historical and cultural context.", 
          duration: "15 min", 
          isCompleted: true,
          tags: ["Video", "Text"]
        },
        { 
          title: "Authorship and Dating", 
          description: "Examining the traditional and scholarly views on who wrote Genesis and when.", 
          duration: "22 min", 
          isCompleted: true,
          tags: ["Video", "Quiz"]
        },
        { 
          title: "Literary Structure and Themes", 
          description: "Understanding how Genesis is organized and its major theological themes.", 
          duration: "18 min", 
          isCompleted: false,
          tags: ["Text", "Discussion"]
        }
      ]
    },
    {
      title: "Creation Narratives",
      lessons: [
        { 
          title: "Genesis 1: The Seven Days of Creation", 
          description: "A detailed examination of the first creation account in Genesis 1:1-2:3.", 
          duration: "25 min", 
          isCompleted: false,
          tags: ["Video", "Discussion"]
        },
        { 
          title: "Genesis 2: The Garden of Eden", 
          description: "Exploring the second creation account focusing on Adam and Eve.", 
          duration: "20 min", 
          isCompleted: false,
          tags: ["Video", "Exercise"]
        },
        { 
          title: "Scientific Perspectives on Creation", 
          description: "How various Christian traditions interpret Genesis in light of modern science.", 
          duration: "30 min", 
          isCompleted: false,
          tags: ["Video", "Reading"]
        }
      ]
    },
    {
      title: "The Fall and Its Consequences",
      lessons: [
        { 
          title: "Genesis 3: The Original Sin", 
          description: "Analyzing the account of Adam and Eve's disobedience and its consequences.", 
          duration: "22 min", 
          isCompleted: false,
          tags: ["Video", "Text"]
        },
        { 
          title: "Cain and Abel", 
          description: "Examining the story of the first murder and its implications.", 
          duration: "18 min", 
          isCompleted: false,
          tags: ["Text", "Discussion"]
        },
        { 
          title: "The Genealogies and the Spread of Sin", 
          description: "Tracing the lineage from Adam to Noah and the increasing corruption.", 
          duration: "15 min", 
          isCompleted: false,
          tags: ["Video", "Quiz"]
        }
      ]
    },
    {
      title: "The Flood Narrative",
      lessons: [
        { 
          title: "Noah and God's Decision", 
          description: "Understanding why God chose to send the flood and Noah's righteousness.", 
          duration: "20 min", 
          isCompleted: false,
          tags: ["Video", "Exercise"]
        },
        { 
          title: "The Flood and the Ark", 
          description: "Details of the flood account and parallels with other ancient flood stories.", 
          duration: "25 min", 
          isCompleted: false,
          tags: ["Video", "Reading"]
        },
        { 
          title: "The Covenant with Noah", 
          description: "Exploring God's promises after the flood and their significance.", 
          duration: "15 min", 
          isCompleted: false,
          tags: ["Text", "Quiz"]
        }
      ]
    },
    {
      title: "The Tower of Babel and Transition",
      lessons: [
        { 
          title: "The Table of Nations", 
          description: "Examining the genealogies of Noah's sons and the origins of nations.", 
          duration: "18 min", 
          isCompleted: false,
          tags: ["Text", "Activity"]
        },
        { 
          title: "The Tower of Babel", 
          description: "Analyzing the story of human pride and divine intervention.", 
          duration: "20 min", 
          isCompleted: false,
          tags: ["Video", "Discussion"]
        },
        { 
          title: "Transition to the Patriarchal Narratives", 
          description: "Bridging from primeval history to the stories of Abraham and his descendants.", 
          duration: "15 min", 
          isLocked: true,
          tags: ["Video", "Reading"]
        }
      ]
    }
  ]);
  
  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const completedLessons = sections.reduce((acc, section) => 
    acc + section.lessons.filter(lesson => lesson.isCompleted).length, 0);
  
  const progress = Math.round((completedLessons / totalLessons) * 100);
  
  const toggleExpandedSection = (sectionIndex: number) => {
    setExpandedSections(prevExpanded => {
      if (prevExpanded.includes(sectionIndex)) {
        return prevExpanded.filter(i => i !== sectionIndex);
      } else {
        return [...prevExpanded, sectionIndex];
      }
    });
  };

  const toggleCompletedLesson = (sectionIndex: number, lessonIndex: number) => {
    const newSections = sections.map((section, i) => {
      if (i === sectionIndex) {
        return {
          ...section,
          lessons: section.lessons.map((lesson, j) => {
            if (j === lessonIndex) {
              return { ...lesson, isCompleted: !lesson.isCompleted };
            }
            return lesson;
          }),
        };
      }
      return section;
    });
    setSections(newSections);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-accent/20 selection:text-accent">
      {/* Hero Section */}
      <div className="relative min-h-[240px] sm:min-h-[280px] md:min-h-[320px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full md:max-w-[calc(100%-280px)] lg:max-w-[calc(100%-320px)]">
            <Image
              src="/images/card-background.jpg"
              alt="Genesis Course Background"
              fill
              className="object-cover opacity-10"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/90" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="w-full md:max-w-[calc(100%-280px)] lg:max-w-[calc(100%-320px)]">
              <div className="inline-flex flex-wrap items-center gap-2 mb-3 p-1 bg-secondary rounded-md">
                <span className="px-2 py-1 text-xs text-accent bg-accent/10 rounded-md">Old Testament</span>
                <div className="flex items-center gap-1 text-muted-foreground px-2 py-1">
                  <Star className="w-3.5 h-3.5 fill-accent/80 text-transparent" strokeWidth={1.5} />
                  <span className="text-xs">4.8</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-2 sm:mb-3">
                Genesis
              </h1>

              <p className="text-sm text-muted-foreground max-w-2xl mb-4 sm:mb-5">
                Explore the foundational book of the Bible, discovering the origins of creation, humanity's
                relationship with God, and the beginnings of God's redemptive plan.
              </p>

              {/* Course progress bar */}
              <div className="mb-4 sm:mb-6 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Course Progress</span>
                  <span className="text-[10px] sm:text-xs text-foreground">{completedLessons}/{totalLessons} lessons</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6 bg-secondary rounded-md">
                <div className="flex flex-wrap items-center gap-2 sm:gap-6 px-2 sm:px-4 py-1 sm:py-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">8 weeks</span>
                  </div>
                  <div className="hidden sm:block w-px h-3 bg-secondary" />
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">24 lessons</span>
                  </div>
                  <div className="hidden sm:block w-px h-3 bg-secondary" />
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">1,234 enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button className="px-3 sm:px-5 py-2 bg-accent/90 hover:bg-accent text-foreground/90 hover:text-foreground rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Continue Learning
                </button>
                <button 
                  className={`px-3 sm:px-5 py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground/90 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm border border-secondary ${isSaved ? 'text-accent/90 border-accent/20' : ''}`}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  {isSaved ? (
                    <>
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent/50 text-accent/90" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Save for Later
                    </>
                  )}
                </button>
                
                <div className="sm:ml-auto flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                  <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground/90 transition-all duration-200">
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground/90 transition-all duration-200">
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Main content */}
          <div className="flex-1 order-2 md:order-1">
            {/* Course Sections */}
            <div className="space-y-5 sm:space-y-6">
              {sections.map((section, i) => (
                <div 
                  key={i}
                  className="relative bg-background rounded-2xl p-2 sm:p-3 backdrop-blur-sm border border-background overflow-hidden group"
                >
                  {/* Section gradients */}
                  <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-500" />
                  <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-500" />
                  
                  <div className="relative">
                    {/* Section header */}
                    <div 
                      className="flex justify-between items-center p-2 sm:p-3 cursor-pointer"
                      onClick={() => toggleExpandedSection(i)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent/10 flex items-center justify-center backdrop-blur-md">
                          <span className="text-xs sm:text-sm font-medium text-foreground">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h2 className="text-sm sm:text-base font-medium text-foreground">{section.title}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {section.lessons.filter(l => l.isCompleted).length}/{section.lessons.length} completed
                        </span>
                        <div className={`transform transition-transform duration-200 ${expandedSections.includes(i) ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Section lessons */}
                    {expandedSections.includes(i) && (
                      <div className="px-2 sm:px-3 pb-3 space-y-2">
                        {section.lessons.map((lesson, j) => (
                          <LessonRow 
                            key={j}
                            lesson={lesson}
                            sectionIndex={i}
                            lessonIndex={j}
                            onToggleCompleted={toggleCompletedLesson}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-64 lg:w-80 shrink-0 order-1 md:order-2">
            <div className="space-y-4 sm:space-y-5 sticky top-4">
              {/* Instructor */}
              <div className="bg-background rounded-2xl p-4 sm:p-5 backdrop-blur-sm border border-background relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                
                <div className="relative">
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Your Instructor</h3>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                      <Image
                        src="/images/instructor-avatar.jpg"
                        alt="Instructor"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 40px, 48px"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-foreground">Dr. Michael Cohen</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Biblical Scholar & Historian</p>
                    </div>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs text-muted-foreground mb-4">
                    Dr. Cohen has spent over 20 years studying ancient Biblical texts and teaches with a focus on historical context and modern application.
                  </p>
                  
                  <button className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground/90 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-sm border border-secondary">
                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Message Instructor
                  </button>
                </div>
              </div>
              
              {/* Prerequisites */}
              <div className="bg-background rounded-2xl p-4 sm:p-5 backdrop-blur-sm border border-background relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                
                <div className="relative">
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Prerequisites</h3>
                  
                  <div className="space-y-2 sm:space-y-3 mb-1">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-0.5 sm:p-1 mt-0.5 rounded-md bg-secondary">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent/80" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">No prior knowledge of Hebrew or ancient languages required</p>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-0.5 sm:p-1 mt-0.5 rounded-md bg-secondary">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent/80" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">Basic understanding of Biblical narrative is helpful but not required</p>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-0.5 sm:p-1 mt-0.5 rounded-md bg-secondary">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent/80" />
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">Access to a study Bible (any translation) is recommended</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resources */}
              <div className="bg-background rounded-2xl p-4 sm:p-5 backdrop-blur-sm border border-background relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
                
                <div className="relative">
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Resources</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <button className="w-full p-2 sm:p-3 bg-secondary hover:bg-secondary/80 rounded-xl backdrop-blur-sm border border-secondary flex items-center gap-2 sm:gap-3 transition-all duration-200 group">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center backdrop-blur-md shrink-0">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs sm:text-sm text-foreground group-hover:text-foreground/90 transition-colors duration-200 truncate">Genesis Study Guide</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">PDF • 2.4 MB</p>
                      </div>
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-accent/80 transition-colors duration-200 shrink-0" />
                    </button>
                    
                    <button className="w-full p-2 sm:p-3 bg-secondary hover:bg-secondary/80 rounded-xl backdrop-blur-sm border border-secondary flex items-center gap-2 sm:gap-3 transition-all duration-200 group">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center backdrop-blur-md shrink-0">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs sm:text-sm text-foreground group-hover:text-foreground/90 transition-colors duration-200 truncate">Reading List & References</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">PDF • 1.1 MB</p>
                      </div>
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-accent/80 transition-colors duration-200 shrink-0" />
                    </button>
                    
                    <button className="w-full p-2 sm:p-3 bg-secondary hover:bg-secondary/80 rounded-xl backdrop-blur-sm border border-secondary flex items-center gap-2 sm:gap-3 transition-all duration-200 group">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 flex items-center justify-center backdrop-blur-md shrink-0">
                        <VideoIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent/80" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs sm:text-sm text-foreground group-hover:text-foreground/90 transition-colors duration-200 truncate">Timeline Visualization</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Video • 6:24</p>
                      </div>
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-accent/80 transition-colors duration-200 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
