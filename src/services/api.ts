const API_URL = 'http://localhost:5000';

export async function registerUser(username: string, password: string, email: string) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('User registered successfully');
      return true;
    } else {
      console.error('Error registering user:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
}

export async function loginUser(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Login successful');
      return true;
    } else {
      console.error('Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return false;
  }
}

