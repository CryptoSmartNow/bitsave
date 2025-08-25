'use client';

import React, { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { MessageCircle, Send, Wallet, ChevronDown } from 'lucide-react';

interface CommentsProps {
  postId: string;
  className?: string;
}



export default function Comments({ postId, className = '' }: CommentsProps) {
  const {
    comments,
    loading,
    submitting,
    pagination,
    addComment,
    loadMoreComments
  } = useComments(postId);
  
  const [newComment, setNewComment] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const connectWallet = async () => {
    try {
      // Simple wallet connection simulation
      // In a real app, you'd integrate with MetaMask, WalletConnect, etc.
      if (typeof window !== 'undefined' && (window as Window & { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum) {
        const accounts = await (window as Window & { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setShowCommentForm(true);
        }
      } else {
        // Fallback for demo purposes
        const demoAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        setWalletAddress(demoAddress);
        setIsWalletConnected(true);
        setShowCommentForm(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !walletAddress) {
      return;
    }

    try {
      await addComment(walletAddress, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-[#81D7B4]/20 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-[#81D7B4]" />
            Comments ({pagination.total})
          </h3>
          
          {!isWalletConnected && (
            <button
              onClick={connectWallet}
              className="flex items-center px-4 py-2 bg-[#81D7B4] text-white rounded-xl hover:bg-[#6bc4a1] transition-colors shadow-sm"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet to Comment
            </button>
          )}
        </div>

        {/* Comment Form */}
        {isWalletConnected && showCommentForm && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="mb-3">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Wallet className="w-4 h-4 mr-1" />
                Connected: {formatWalletAddress(walletAddress)}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 border border-[#81D7B4]/30 rounded-xl focus:ring-2 focus:ring-[#81D7B4]/50 focus:border-[#81D7B4] resize-none text-black bg-gray-50/50 transition-all"
                rows={3}
                maxLength={1000}
                disabled={submitting}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newComment.length}/1000
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCommentForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center px-4 py-2 bg-[#81D7B4] text-white rounded-xl hover:bg-[#6bc4a1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {loading && comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4] mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {comment.walletAddress.slice(2, 4).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {formatWalletAddress(comment.walletAddress)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreComments}
              disabled={loading}
              className="flex items-center mx-auto px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              {loading ? 'Loading...' : 'Load More Comments'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}