const API_BASE_URL = 'http://localhost:5000/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`Making API request to: ${url}`);
  console.log('Request options:', { method: options.method || 'GET', headers });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Error response data:', errorData);
      } catch (e) {
        // If response is not JSON, get text instead
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('Error response text:', text);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Response data received:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default apiRequest;