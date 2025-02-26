export type UserProfile = {
  id: string;
  name: string;
  image: string;
  role: 'member' | 'moderator' | 'admin';
  joinDate: string;
  bio?: string;
  location?: string;
  interests?: string[];
  badges?: string[];
};

export type Discussion = {
  id: string;
  title: string;
  content: string;
  author: UserProfile;
  createdAt: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  isLiked?: boolean;
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
