import { Discussion, Group, UserProfile } from '@/types/community';

export const currentUser: UserProfile = {
  id: 'user1',
  name: 'Sarah Johnson',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  role: 'member',
  joinDate: '2024-12-01',
  bio: 'Passionate about progressive Christianity and interfaith dialogue',
  location: 'San Francisco, CA',
  interests: ['Progressive Christianity', 'Social Justice', 'Biblical Studies'],
  badges: ['Early Member', 'Active Contributor']
};

export const discussions: Discussion[] = [
  {
    id: 'disc1',
    title: 'How do you reconcile faith and science in your spiritual journey?',
    content: 'I have been exploring the intersection of faith and scientific understanding...',
    author: {
      id: 'user2',
      name: 'Michael Chen',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      role: 'moderator',
      joinDate: '2024-11-15'
    },
    createdAt: '2025-02-19T10:30:00Z',
    category: 'Faith & Science',
    tags: ['Science', 'Faith', 'Discussion'],
    likes: 24,
    replies: 12,
    isPinned: true
  },
  {
    id: 'disc2',
    title: 'Modern interpretations of Genesis creation narrative',
    content: 'Looking to discuss various modern interpretations of Genesis...',
    author: {
      id: 'user3',
      name: 'Emily Martinez',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      role: 'member',
      joinDate: '2024-12-20'
    },
    createdAt: '2025-02-18T15:45:00Z',
    category: 'Biblical Studies',
    tags: ['Genesis', 'Interpretation', 'Discussion'],
    likes: 18,
    replies: 8
  }
];

export const groups: Group[] = [
  {
    id: 'group1',
    name: 'Progressive Christianity Discussion',
    description: 'A space for discussing progressive Christian theology and practice',
    image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800',
    category: 'Theology',
    members: 256,
    isPrivate: false,
    topics: ['Theology', 'Social Justice', 'Biblical Interpretation']
  },
  {
    id: 'group2',
    name: 'Faith & Science Bridge',
    description: 'Bridging the gap between scientific understanding and faith',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800',
    category: 'Faith & Science',
    members: 189,
    isPrivate: false,
    topics: ['Science', 'Faith', 'Integration']
  },
  {
    id: 'group3',
    name: 'Biblical Hebrew Study Group',
    description: 'Learn and discuss Biblical Hebrew together',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
    category: 'Language Study',
    members: 124,
    isPrivate: true,
    topics: ['Hebrew', 'Biblical Languages', 'Study Group']
  }
];
