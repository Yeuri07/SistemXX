const API_URL = 'http://localhost:5000';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  message: string;
  token: string;
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  username: string;
}

export async function registerUser(username: string,password: string, email: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}

export async function createPost(content: string, token: string): Promise<Post | null> {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function getPosts(token: string): Promise<Post[]> {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function likePost(postId: number, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
}

export async function unlikePost(postId: number, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/unlike`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error unliking post:', error);
    return false;
  }
}

export async function getPostLikes(postId: number, token: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      return data.likes;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error getting post likes:', error);
    return 0;
  }
}

export async function createComment(postId: number, content: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating comment:', error);
    return false;
  }
}

export async function getComments(postId: number, token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      return data.comments;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}