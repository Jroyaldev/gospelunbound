export type ResourceType = 'article' | 'video' | 'audio' | 'pdf' | 'study-guide' | 'infographic';

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  author?: string;
  date: string;
  duration?: string;
  image: string;
  url: string;
  tags: string[];
  featured?: boolean;
};
