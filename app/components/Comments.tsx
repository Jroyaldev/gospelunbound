'use client'

import { useState } from 'react'
import { useAuth } from '@/app/context/auth-context'
import { Comment } from '@/app/lib/types'
import { MessageCircle, Heart, Reply, Clock, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createComment, toggleLike } from '@/app/lib/supabase/database'

interface CommentsProps {
  comments: Comment[]
  courseId?: string
  lessonId?: string
}

export default function Comments({ comments: initialComments, courseId, lessonId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isLoading } = useAuth()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const comment = await createComment(user.id, {
        content: newComment,
        course_id: courseId,
        lesson_id: lessonId
      })
      
      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!user) return
    if (!replyText.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const reply = await createComment(user.id, {
        content: replyText,
        parent_id: parentId,
        course_id: courseId,
        lesson_id: lessonId
      })
      
      if (reply) {
        // Update the comments state to include the new reply
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            }
          }
          return comment
        }))
        
        setReplyText('')
        setReplyToId(null)
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleLike = async (commentId: string) => {
    if (!user) return
    
    try {
      const success = await toggleLike(user.id, commentId)
      
      if (success) {
        // Update UI to reflect the like/unlike
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              has_liked: !comment.has_liked,
              likes_count: comment.has_liked 
                ? (comment.likes_count || 1) - 1 
                : (comment.likes_count || 0) + 1
            }
          }
          
          // Check if the comment is in replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    has_liked: !reply.has_liked,
                    likes_count: reply.has_liked 
                      ? (reply.likes_count || 1) - 1 
                      : (reply.likes_count || 0) + 1
                  }
                }
                return reply
              })
            }
          }
          
          return comment
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium tracking-tight">Discussion ({comments.length})</h2>
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="border border-border rounded-md overflow-hidden">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              className="w-full p-3 h-24 focus:outline-none resize-none bg-background text-foreground"
              required
            />
            <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-800">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-primary text-sm font-medium text-primary-foreground rounded-md
                  hover:bg-primary/90 disabled:bg-muted-foreground/50 disabled:cursor-not-allowed
                  min-h-11 min-w-20 flex items-center justify-center"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 border border-border rounded-md bg-gray-50 dark:bg-gray-800 text-center mb-6">
          <p className="text-muted-foreground mb-2">
            Join the conversation
          </p>
          <Link
            href="/auth/sign-in"
            className="text-primary hover:text-primary/90 font-medium"
          >
            Sign in to comment
          </Link>
        </div>
      )}
      
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            Be the first to start the discussion!
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border border-border rounded-md p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                  {comment.user?.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.username || 'User'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {comment.user?.username?.charAt(0) || comment.user?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {comment.user?.username || comment.user?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center mt-0.5">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    
                    {user && user.id === comment.user_id && (
                      <div className="flex space-x-2">
                        <button className="text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-foreground whitespace-pre-line">
                    {comment.content}
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4">
                    <button
                      onClick={() => user && handleLike(comment.id)}
                      className={`flex items-center gap-1 text-sm ${
                        comment.has_liked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      disabled={!user}
                    >
                      <Heart className={`h-4 w-4 ${comment.has_liked ? 'fill-current' : ''}`} />
                      <span>{comment.likes_count || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      disabled={!user}
                    >
                      <Reply className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Reply form */}
              {user && replyToId === comment.id && (
                <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="pl-12 mt-3">
                  <div className="border border-border rounded-md overflow-hidden">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.user?.username || comment.user?.full_name || 'Anonymous'}...`}
                      className="w-full p-3 h-20 focus:outline-none resize-none bg-background text-foreground"
                      required
                    />
                    <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => setReplyToId(null)}
                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground mr-2 hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !replyText.trim()}
                        className="px-3 py-1.5 bg-primary text-sm font-medium text-primary-foreground rounded-md
                          hover:bg-primary/90 disabled:bg-muted-foreground/50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-12 space-y-4 mt-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="border-l-2 border-border pl-4 py-1">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0">
                          {reply.user?.avatar_url ? (
                            <img
                              src={reply.user.avatar_url}
                              alt={reply.user.username || 'User'}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                              {reply.user?.username?.charAt(0) || reply.user?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {reply.user?.username || reply.user?.full_name || 'Anonymous'}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(reply.created_at)}
                              </p>
                            </div>
                            
                            {user && user.id === reply.user_id && (
                              <div className="flex space-x-2">
                                <button className="text-muted-foreground hover:text-foreground">
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button className="text-muted-foreground hover:text-red-500">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-1.5 text-foreground whitespace-pre-line text-sm">
                            {reply.content}
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-4">
                            <button
                              onClick={() => user && handleLike(reply.id)}
                              className={`flex items-center gap-1 text-xs ${
                                reply.has_liked 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              disabled={!user}
                            >
                              <Heart className={`h-3.5 w-3.5 ${reply.has_liked ? 'fill-current' : ''}`} />
                              <span>{reply.likes_count || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
