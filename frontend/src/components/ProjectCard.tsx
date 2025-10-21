import { useState } from 'react';
import { apiClient } from '../utils/apiClient';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  starred?: boolean;
  archived?: boolean;
  previewUrl?: string;
  previewId?: string;
}

interface ProjectCardProps {
  project: Project;
  onUpdate: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (projectId: string) => void;
  onDuplicate: (projectId: string) => void;
  onView: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onUpdate,
  onDelete,
  onDuplicate,
  onView
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    
    setLoading(true);
    try {
      await apiClient.put(`/api/projects/${project.id}`, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });
      
      onUpdate(project.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStar = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/projects/${project.id}`, {
        starred: !project.starred
      });
      
      onUpdate(project.id, { starred: !project.starred });
    } catch (error) {
      console.error('Failed to toggle star:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/api/projects/${project.id}`, {
        archived: !project.archived
      });
      
      onUpdate(project.id, { archived: !project.archived });
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.delete(`/api/projects/${project.id}`);
      onDelete(project.id);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/api/projects/${project.id}/duplicate`, {
        name: `${project.name} (Copy)`
      });
      onDuplicate(project.id);
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 relative ${loading ? 'opacity-50' : ''} ${project.archived ? 'bg-gray-50' : ''}`}>
      {/* Star and Menu */}
      <div className="flex justify-between items-start mb-4">
        <button
          onClick={handleToggleStar}
          className={`p-1 rounded-full transition-colors ${
            project.starred 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-300 hover:text-yellow-500'
          }`}
          disabled={loading}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    handleDuplicate();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    handleToggleArchive();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {project.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full text-gray-600 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || loading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(project.name);
                  setEditDescription(project.description || '');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {project.name}
              {project.archived && (
                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                  Archived
                </span>
              )}
            </h3>
            {project.description && (
              <p className="text-gray-600 text-sm">{project.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Project Preview */}
      <div className="mb-4">
        <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Website Preview</span>
          </div>
        </div>
      </div>

      {/* Project Meta */}
      <div className="text-xs text-gray-500 mb-4">
        <div>Created: {formatDate(project.createdAt)}</div>
        {project.updatedAt && project.updatedAt !== project.createdAt && (
          <div>Updated: {formatDate(project.updatedAt)}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(project)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Open Project
        </button>
        {project.previewUrl && (
          <button
            onClick={() => window.open(project.previewUrl, '_blank')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Preview
          </button>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
