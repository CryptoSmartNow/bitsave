import { useState, useCallback, useEffect } from 'react';

interface Comment {
  _id: string;
  postId: string;
  walletAddress: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  likes: number;
  likedBy: string[];
  parentCommentId?: string;
}

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false
  });

  const fetchComments = useCallback(async (reset = false) => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const skip = reset ? 0 : pagination.skip;
      const response = await fetch(
        `/api/blog/comments?postId=${postId}&limit=${pagination.limit}&skip=${skip}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: CommentsResponse = await response.json();
      
      if (reset) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      
      setPagination({
        ...data.pagination,
        skip: reset ? data.pagination.limit : skip + data.pagination.limit
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, pagination.limit, pagination.skip]);

  const addComment = useCallback(async (
    walletAddress: string, 
    content: string, 
    parentCommentId?: string
  ) => {
    if (!postId || !walletAddress || !content.trim()) {
      throw new Error('Missing required fields');
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          walletAddress,
          content: content.trim(),
          parentCommentId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const result = await response.json();
      
      // Add the new comment to the top of the list
      setComments(prev => [result.comment, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      
      return result.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [postId]);

  const loadMoreComments = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchComments(false);
    }
  }, [fetchComments, loading, pagination.hasMore]);

  const refreshComments = useCallback(() => {
    setPagination(prev => ({ ...prev, skip: 0 }));
    fetchComments(true);
  }, [fetchComments]);

  useEffect(() => {
    if (postId) {
      refreshComments();
    }
  }, [postId]); // Only depend on postId, not refreshComments to avoid infinite loop

  return {
    comments,
    loading,
    submitting,
    pagination,
    addComment,
    loadMoreComments,
    refreshComments
  };
}