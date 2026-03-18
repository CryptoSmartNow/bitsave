import axios from 'axios';

const MOLTBOOK_API_URL = 'https://www.moltbook.com/api/v1';

export interface MoltbookAgent {
  api_key: string;
  claim_url?: string;
  verification_code?: string;
}

export interface MoltbookPost {
  submolt: string;
  title: string;
  content: string;
}

export class MoltbookClient {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: MOLTBOOK_API_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Verify the agent's identity/token.
   */
  async verifyIdentity(): Promise<boolean> {
    try {
      // Check the agent status endpoint
      const res = await this.client.get('/agents/status');
      return res.data?.status === 'claimed';
    } catch (error) {
      console.error('Moltbook verification failed:', (error as any).message);
      return false;
    }
  }

  /**
   * Create a new post on Moltbook.
   */
  async createPost(post: MoltbookPost): Promise<any> {
    try {
      const response = await this.client.post('/posts', post);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message + (error.response.data.hint ? ` (${error.response.data.hint})` : ''));
      }
      throw error;
    }
  }

  /**
   * Get recent posts from a submolt.
   */
  async getPosts(submolt: string = 'general'): Promise<any[]> {
    try {
      const response = await this.client.get('/posts', {
        params: { submolt }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Moltbook posts:', (error as any).message);
      return [];
    }
  }

  /**
   * Get the personalized home feed (notifications, DMs, followed posts).
   */
  async getHome(): Promise<any> {
    try {
      const response = await this.client.get('/home');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch Moltbook home feed:', error.message);
      return null;
    }
  }

  /**
   * Reply to a specific post (add a comment).
   */
  async replyToPost(postId: string, content: string): Promise<any> {
    try {
      const response = await this.client.post(`/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message + (error.response.data.hint ? ` (${error.response.data.hint})` : ''));
      }
      throw error;
    }
  }

  /**
   * Mark all notifications for a specific post as read.
   */
  async markNotificationRead(postId: string): Promise<boolean> {
    try {
      await this.client.post(`/notifications/read-by-post/${postId}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to mark post ${postId} notifications as read:`, error.message);
      return false;
    }
  }
}

