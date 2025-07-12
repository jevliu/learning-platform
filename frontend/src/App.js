import React, { useState, useEffect } from 'react';
import { getToken, removeToken, getUser, fetchWithAuth, uploadFile } from './api';
import LoginScreen from './LoginScreen';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  ExternalLink,
  LogOut,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom';

// 笔记详情页组件
function NoteDetail({ notes }) {
  const { id } = useParams();
  const note = notes.find(n => String(n.id) === String(id));
  const navigate = useNavigate();
  if (!note) return <div className="p-8">未找到该笔记 <button onClick={() => navigate(-1)} className="text-indigo-600 ml-2">返回</button></div>;
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">{note.title}</h2>
      <ReactMarkdown
        className="prose max-w-none text-gray-600"
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {note.content}
      </ReactMarkdown>
      <div className="mt-6 text-right">
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">返回</button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 表单状态
  const [showClassForm, setShowClassForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // 表单数据
  const [classForm, setClassForm] = useState({ name: '', description: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', file: null });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', video_url: '' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = getUser();
      if (userData) {
        setUser(userData);
        loadClasses();
      } else {
        removeToken();
      }
    }
  }, []);

  const handleLoginSuccess = (response) => {
    setUser(response.user);
    loadClasses();
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    setClasses([]);
    setSelectedClass(null);
    setMaterials([]);
    setVideos([]);
    setNotes([]);
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/classes');
      setClasses(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClassData = async (classId) => {
    try {
      setLoading(true);
      const [materialsData, videosData, notesData] = await Promise.all([
        fetchWithAuth(`/classes/${classId}/materials`),
        fetchWithAuth(`/classes/${classId}/videos`),
        fetchWithAuth(`/classes/${classId}/notes`)
      ]);
      setMaterials(materialsData);
      setVideos(videosData);
      setNotes(notesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    loadClassData(classItem.id);
  };

  // 班级操作
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetchWithAuth('/classes', {
        method: 'POST',
        body: JSON.stringify(classForm),
      });
      setClassForm({ name: '', description: '' });
      setShowClassForm(false);
      loadClasses();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('确定要删除这个班级吗？')) return;
    
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${classId}`, { method: 'DELETE' });
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
        setMaterials([]);
        setVideos([]);
        setNotes([]);
      }
      loadClasses();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 资料操作
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.file) {
      setError('请选择文件');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', materialForm.title);
      formData.append('description', materialForm.description);
      formData.append('file', materialForm.file);

      await uploadFile(`/classes/${selectedClass.id}/materials`, formData);
      setMaterialForm({ title: '', description: '', file: null });
      setShowMaterialForm(false);
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('确定要删除这个资料吗？')) return;
    
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${selectedClass.id}/materials/${materialId}`, { method: 'DELETE' });
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 视频操作
  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${selectedClass.id}/videos`, {
        method: 'POST',
        body: JSON.stringify(videoForm),
      });
      setVideoForm({ title: '', description: '', video_url: '' });
      setShowVideoForm(false);
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('确定要删除这个视频吗？')) return;
    
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${selectedClass.id}/videos/${videoId}`, { method: 'DELETE' });
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 笔记操作
  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${selectedClass.id}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteForm),
      });
      setNoteForm({ title: '', content: '' });
      setShowNoteForm(false);
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('确定要删除这个笔记吗？')) return;
    
    try {
      setLoading(true);
      await fetchWithAuth(`/classes/${selectedClass.id}/notes/${noteId}`, { method: 'DELETE' });
      loadClassData(selectedClass.id);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isTeacher = user.role === 'teacher';

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">学习平台</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {isTeacher ? '教师' : '学生'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <Routes>
            <Route path="/note/:id" element={<NoteDetail notes={notes} />} />
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 左侧班级列表 */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">班级列表</h2>
                      {isTeacher && (
                        <button
                          onClick={() => setShowClassForm(true)}
                          className="p-1 text-indigo-600 hover:text-indigo-500"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {loading ? (
                      <div className="text-center py-4">加载中...</div>
                    ) : (
                      <div className="space-y-2">
                        {classes.map((classItem) => (
                          <div
                            key={classItem.id}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              selectedClass?.id === classItem.id
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => handleClassSelect(classItem)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                                {classItem.description && (
                                  <p className="text-sm text-gray-500 mt-1">{classItem.description}</p>
                                )}
                              </div>
                              {isTeacher && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClass(classItem.id);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧内容区域 */}
                <div className="lg:col-span-3">
                  {selectedClass ? (
                    <div className="space-y-6">
                      {/* 班级信息 */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.name}</h2>
                        {selectedClass.description && (
                          <p className="text-gray-600">{selectedClass.description}</p>
                        )}
                      </div>

                      {/* 资料管理 */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">学习资料</h3>
                          </div>
                          {isTeacher && (
                            <button
                              onClick={() => setShowMaterialForm(true)}
                              className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              <Plus className="h-4 w-4" />
                              <span>上传资料</span>
                            </button>
                          )}
                        </div>

                        {materials.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">暂无资料</p>
                        ) : (
                          <div className="space-y-3">
                            {materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <h4 className="font-medium">{material.title}</h4>
                                    {material.description && (
                                      <p className="text-sm text-gray-500">{material.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={`http://localhost:3001/uploads/${material.file_path}`}
                                    download={material.original_filename}
                                    className="text-indigo-600 hover:text-indigo-500"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                  {isTeacher && (
                                    <button
                                      onClick={() => handleDeleteMaterial(material.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 视频管理 */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Video className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">视频资源</h3>
                          </div>
                          {isTeacher && (
                            <button
                              onClick={() => setShowVideoForm(true)}
                              className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              <Plus className="h-4 w-4" />
                              <span>添加视频</span>
                            </button>
                          )}
                        </div>

                        {videos.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">暂无视频</p>
                        ) : (
                          <div className="space-y-3">
                            {videos.map((video) => (
                              <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center space-x-3">
                                  <Video className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <h4 className="font-medium">{video.title}</h4>
                                    {video.description && (
                                      <p className="text-sm text-gray-500">{video.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a
                                    href={video.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-500"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                  {isTeacher && (
                                    <button
                                      onClick={() => handleDeleteVideo(video.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 笔记管理 */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900">学习笔记</h3>
                          </div>
                          {isTeacher && (
                            <button
                              onClick={() => setShowNoteForm(true)}
                              className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              <Plus className="h-4 w-4" />
                              <span>添加笔记</span>
                            </button>
                          )}
                        </div>

                        {notes.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">暂无笔记</p>
                        ) : (
                          <div className="space-y-3">
                            {notes.map((note) => (
                              <div key={note.id} className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4 text-gray-400" />
                                  <Link to={`/note/${note.id}`} className="font-medium text-indigo-700 hover:underline">
                                    {note.title}
                                  </Link>
                                </div>
                                {isTeacher && (
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">选择班级</h3>
                      <p className="text-gray-500">请从左侧选择一个班级来查看学习内容</p>
                    </div>
                  )}
                </div>
              </div>
            } />
          </Routes>
        </div>

        {/* 模态框 */}
        {showClassForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">创建新班级</h3>
              <form onSubmit={handleCreateClass}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">班级名称</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      value={classForm.description}
                      onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '创建中...' : '创建'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClassForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMaterialForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">上传资料</h3>
              <form onSubmit={handleUploadMaterial}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">标题</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">文件</label>
                    <input
                      type="file"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '上传中...' : '上传'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showVideoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">添加视频</h3>
              <form onSubmit={handleAddVideo}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">标题</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">描述</label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      value={videoForm.description}
                      onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">视频链接</label>
                    <input
                      type="url"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://..."
                      value={videoForm.video_url}
                      onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '添加中...' : '添加'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideoForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNoteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">添加笔记</h3>
              <form onSubmit={handleAddNote}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">标题</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">内容</label>
                    <textarea
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows="6"
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '添加中...' : '添加'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;