import { StaticImageData } from 'next/image';

export type UserProfile = {
  id: string;
  name: string;
  image: string;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
  bio?: string;
  location?: string;
  interests?: string[];
  badges?: string[];
};

export type Author = {
  id: string;
  name: string;
  image: string;
  role: 'admin' | 'moderator' | 'member';
  joinDate: string;
};

export type Discussion = {
  id: string;
  title: string;
  content: string;
  author: Author;
  createdAt: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  isPinned?: boolean;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  members: number;
  isPrivate: boolean;
  topics?: string[];
};
