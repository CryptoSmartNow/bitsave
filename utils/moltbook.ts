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
      // Based on docs, there might be a verification endpoint, 
      // or we just check if a simple call works.
      // Search result mentions: POST /api/v1/agents/verify-identity
      // But also mentions "extract header... verify token".
      // For a client, we usually just make a request.
      // Let's try to get the agent's own profile or a lightweight endpoint.
      // If specific verify endpoint exists:
      await this.client.post('/agents/verify-identity', {}, {
        headers: { 'X-Moltbook-App-Key': this.apiKey } 
      });
      return true;
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
    } catch (error) {
      // console.error('Failed to create Moltbook post:', (error as any).message);
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
}
