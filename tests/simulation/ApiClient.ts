/**
 * API Client for Simulation
 * Handles HTTP requests to the CBS Apex API during simulation
 */

import fetch, { RequestInit } from 'node-fetch';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 API Request: ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log(`📤 Request Data:`, JSON.stringify(data, null, 2));
    }
    
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(`✅ JSON Response:`, responseData);
        return responseData;
      } else {
        const responseText = await response.text();
        console.log(`✅ Text Response:`, responseText);
        return responseText;
      }
    } catch (error) {
      console.error(`❌ API Error:`, error);
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('Unknown API error');
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request('GET', endpoint);
  }

  async post(endpoint: string, data: any): Promise<any> {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint: string, data: any): Promise<any> {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint: string): Promise<any> {
    return this.request('DELETE', endpoint);
  }
}