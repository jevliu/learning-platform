import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://localhost:3001/api';

// Token管理
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// 从JWT获取用户信息
export const getUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('JWT解析错误:', error);
    removeToken();
    return null;
  }
};

// 带认证的API请求
export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (response.status === 401) {
      removeToken();
      window.location.reload();
      throw new Error('认证失败，请重新登录');
    }
    
    if (response.status === 403) {
      throw new Error('权限不足');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '请求失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
};

// 文件上传API请求
export const uploadFile = async (url, formData) => {
  const token = getToken();
  
  const config = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (response.status === 401) {
      removeToken();
      window.location.reload();
      throw new Error('认证失败，请重新登录');
    }
    
    if (response.status === 403) {
      throw new Error('权限不足');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '上传失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('文件上传错误:', error);
    throw error;
  }
}; 