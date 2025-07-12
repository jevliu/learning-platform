import React, { useState } from 'react';
import { fetchWithAuth } from './api';
import { setToken } from './api';

const LoginScreen = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // 登录处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name, password }),
      });
      setToken(response.token);
      onLoginSuccess(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    setRegisterSuccess(false);
    try {
      await fetchWithAuth('/auth/register-student', {
        method: 'POST',
        body: JSON.stringify({ name: registerName, password: registerPassword }),
      });
      setRegisterSuccess(true);
      setRegisterName('');
      setRegisterPassword('');
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              学生注册
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              请输入您的姓名和密码注册账号
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="registerName" className="sr-only">姓名</label>
                <input
                  id="registerName"
                  name="registerName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="姓名"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="registerPassword" className="sr-only">密码</label>
                <input
                  id="registerPassword"
                  name="registerPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="密码"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
            </div>
            {registerError && (
              <div className="text-red-600 text-sm text-center">{registerError}</div>
            )}
            {registerSuccess && (
              <div className="text-green-600 text-sm text-center">注册成功，请返回登录！</div>
            )}
            <div>
              <button
                type="submit"
                disabled={registerLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {registerLoading ? '注册中...' : '注册'}
              </button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                返回登录
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录学习平台
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入您的姓名和密码登录
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">姓名</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">密码</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              注册账号
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
