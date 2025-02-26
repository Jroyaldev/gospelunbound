export type LessonContent = {
  type: 'text' | 'video' | 'audio' | 'quiz' | 'scripture' | 'discussion';
  content: any;
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  type: 'lesson' | 'quiz' | 'discussion';
  completed?: boolean;
  contents: LessonContent[];
};

export type Section = {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  instructor: {
    name: string;
    title: string;
    image: string;
    bio: string;
  };
  rating: number;
  students: number;
  lessons: number;
  progress: number;
  image: string;
  sections: Section[];
  prerequisites?: string[];
  objectives?: string[];
  materials?: string[];
};
