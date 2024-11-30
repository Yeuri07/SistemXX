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
  media_url?: string;
  media_type?: 'image' | 'video';
  created_at: string;
  username: string;
}

interface PostLikesResponse {
  likes: number;
  isLikedByUser: boolean;
}

export async function registerUser(username: string, password: string, email: string): Promise<AuthResponse | null> {
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

export async function createPost(content: string, media?: File, token: string): Promise<Post | null> {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
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

// export async function getPosts(token: string): Promise<Post[]> {
//   try {
//     const response = await fetch(`${API_URL}/posts`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return [];
//   }
// }

export async function getPosts(token: string, page: number = 1, limit: number = 10): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
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
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
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

export async function getPostLikes(postId: number, token: string): Promise<PostLikesResponse> {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return {
        likes: data.likes,
        isLikedByUser: data.isLikedByUser,
      };
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error getting post likes:', error);
    return {
      likes: 0,
      isLikedByUser: false,
    };
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
    const date = await response.json()
 
    return date;
    
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
      return data;
    }
    throw new Error(data.message);
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

export async function getUserProfile(username: string, token: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/users/profile/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserPosts(username: string, token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/users/${username}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}