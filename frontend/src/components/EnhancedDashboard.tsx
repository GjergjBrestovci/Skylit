import React, { useState, useEffect } from 'react';
import { TemplateGallery } from './TemplateGallery';
import { SamplePrompts } from './SamplePrompts';
import { ProjectCard } from './ProjectCard';
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

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  prompt: string;
  techStack: {
    framework: string;
    styling: string;
    features: string[];
  };
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'projects' | 'templates' | 'prompts'>('create');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<'all' | 'starred' | 'archived'>('all');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Load projects on component mount
  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    }
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/get-projects');
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ));
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleProjectDuplicate = () => {
    // Refresh projects list after duplication
    loadProjects();
  };

  const handleProjectView = (project: Project) => {
    // Navigate to project view/edit
    console.log('Open project:', project);
  };

  const handleTemplateSelect = (template: Template, enhancedPrompt: string) => {
    setSelectedTemplate(template);
    setPrompt(enhancedPrompt);
    setActiveTab('create');
  };

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setActiveTab('create');
  };

  const getFilteredProjects = () => {
    switch (projectFilter) {
      case 'starred':
        return projects.filter(p => p.starred && !p.archived);
      case 'archived':
        return projects.filter(p => p.archived);
      default:
        return projects.filter(p => !p.archived);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Create New Website</h2>
              {selectedTemplate && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">Using Template: {selectedTemplate.name}</h3>
                      <p className="text-blue-700 text-sm">{selectedTemplate.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your website
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the website you want to create..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Browse Templates
                </button>
                <button
                  onClick={() => setActiveTab('prompts')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Sample Prompts
                </button>
                <button
                  disabled={!prompt.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Generate Website
                </button>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
              <div className="flex gap-2">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Projects</option>
                  <option value="starred">Starred</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  New Project
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredProjects().map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleProjectUpdate}
                    onDelete={handleProjectDelete}
                    onDuplicate={handleProjectDuplicate}
                    onView={handleProjectView}
                  />
                ))}
              </div>
            )}

            {getFilteredProjects().length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📁</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {projectFilter === 'starred' ? 'No starred projects' :
                   projectFilter === 'archived' ? 'No archived projects' :
                   'No projects yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {projectFilter === 'all' ? 'Create your first website to get started' : 
                   `No ${projectFilter} projects found`}
                </p>
                {projectFilter === 'all' && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create New Project
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'templates':
        return <TemplateGallery onSelectTemplate={handleTemplateSelect} />;

      case 'prompts':
        return <SamplePrompts onSelectPrompt={handlePromptSelect} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  data-tour="create-tab"
                  onClick={() => setActiveTab('create')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Create
                </button>
                <button
                  data-tour="projects-tab"
                  onClick={() => setActiveTab('projects')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Projects
                </button>
                <button
                  data-tour="templates-tab"
                  onClick={() => setActiveTab('templates')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'templates'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Templates
                </button>
                <button
                  data-tour="prompts-tab"
                  onClick={() => setActiveTab('prompts')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'prompts'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Inspiration
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};
