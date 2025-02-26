import { Course } from '@/types/course';

export const genesisCourse: Course = {
  id: "genesis",
  title: "Genesis",
  description: "Explore the foundational book of the Bible, discovering the origins of creation, humanity's relationship with God, and the beginnings of God's redemptive plan.",
  duration: "8 weeks",
  category: "Old Testament",
  instructor: {
    name: "Dr. Sarah Cohen",
    title: "Professor of Old Testament Studies",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    bio: "Dr. Sarah Cohen has been teaching Old Testament studies for over 15 years. She holds a Ph.D. in Biblical Studies from Hebrew University and has published numerous works on Genesis."
  },
  rating: 4.8,
  students: 1234,
  lessons: 24,
  progress: 0,
  image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200",
  prerequisites: [
    "No prerequisites required",
    "Basic understanding of Bible study methods helpful but not required"
  ],
  objectives: [
    "Understand the structure and themes of Genesis",
    "Explore the creation narratives and their theological significance",
    "Analyze the patriarchal narratives and their relevance",
    "Connect Genesis themes to the broader biblical narrative"
  ],
  materials: [
    "Bible (any translation)",
    "Course workbook (provided)",
    "Optional: Bible dictionary"
  ],
  sections: [
    {
      id: "introduction",
      title: "Introduction to Genesis",
      order: 1,
      lessons: [
        {
          id: "genesis-overview",
          title: "Course Overview & Introduction to Genesis",
          description: "An overview of the book of Genesis and its significance in the Bible.",
          duration: "45 mins",
          order: 1,
          type: "lesson",
          contents: [
            {
              type: "video",
              content: {
                url: "https://example.com/videos/genesis-intro",
                thumbnail: "https://example.com/thumbnails/genesis-intro.jpg",
                duration: "15:00"
              }
            },
            {
              type: "text",
              content: {
                body: "Genesis, the first book of the Bible, serves as the foundation for understanding God's relationship with humanity and His plan for redemption. This book contains some of the most familiar stories in the Bible, including the creation account, the fall of humanity, Noah's ark, and the lives of the patriarchs.\n\nIn this course, we'll explore these narratives in depth, examining their historical context, theological significance, and relevance for today. We'll also discover how Genesis sets up major themes that run throughout the entire Bible."
              }
            },
            {
              type: "scripture",
              content: {
                reference: "Genesis 1:1",
                text: "In the beginning God created the heavens and the earth.",
                translation: "NIV"
              }
            },
            {
              type: "discussion",
              content: {
                question: "What preconceptions or previous understanding do you have about the book of Genesis?",
                prompt: "Share your thoughts with the group and discuss how these might influence your study of the text."
              }
            }
          ]
        },
        {
          id: "genesis-structure",
          title: "Structure and Composition",
          description: "Understanding how Genesis is organized and its literary features.",
          duration: "40 mins",
          order: 2,
          type: "lesson",
          contents: [
            {
              type: "text",
              content: {
                body: "Genesis is carefully structured around ten 'toledot' formulae (these are 'generations of' or 'accounts of' statements). We'll explore how this structure helps us understand the book's message and purpose."
              }
            }
          ]
        }
      ]
    },
    {
      id: "creation",
      title: "Creation Narratives",
      order: 2,
      lessons: [
        {
          id: "creation-day-1",
          title: "Creation: Day 1",
          description: "Exploring the first day of creation and its theological significance.",
          duration: "35 mins",
          order: 1,
          type: "lesson",
          contents: [
            {
              type: "video",
              content: {
                url: "https://example.com/videos/creation-day-1",
                thumbnail: "https://example.com/thumbnails/creation-day-1.jpg",
                duration: "10:00"
              }
            }
          ]
        }
      ]
    }
  ]
};
