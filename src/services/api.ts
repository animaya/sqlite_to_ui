/**
 * API Service
 * 
 * Base service for making API requests.
 */

const API_BASE_URL = "/api";

/**
 * Make a GET request to the API
 * 
 * @param path API endpoint path
 * @returns Response data
 */
export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a POST request to the API
 * 
 * @param path API endpoint path
 * @param data Request data
 * @returns Response data
 */
export async function post<T>(path: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a PUT request to the API
 * 
 * @param path API endpoint path
 * @param data Request data
 * @returns Response data
 */
export async function put<T>(path: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Make a DELETE request to the API
 * 
 * @param path API endpoint path
 * @returns Response data
 */
export async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE"
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}
