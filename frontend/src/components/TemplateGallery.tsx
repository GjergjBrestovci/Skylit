import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

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

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template, enhancedPrompt: string) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customizations, setCustomizations] = useState({
    companyName: '',
    industry: '',
    colorScheme: '',
    additionalFeatures: [] as string[]
  });
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiClient.get(`/api/templates?${params.toString()}`);
      setTemplates(response.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/api/templates/categories');
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowCustomization(true);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await apiClient.post(`/api/templates/${selectedTemplate.id}/generate`, {
        customizations
      });

      onSelectTemplate(selectedTemplate, response.enhancedPrompt);
      setShowCustomization(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to generate from template:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced': return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-background text-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Template Gallery</h2>
        <p className="text-muted">Choose from our curated collection of professional website templates</p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-base px-4 py-2"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input-base px-4 py-2"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base px-4 py-2 flex-1 min-w-64"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div key={template.id} className="card rounded-xl border border-border bg-surface dark:bg-surface overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
              <div className="text-muted opacity-40">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-text">{template.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>

              <p className="text-muted text-sm mb-4">{template.description}</p>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-background dark:bg-background text-muted text-xs rounded-md border border-border">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 bg-background dark:bg-background text-muted text-xs rounded-md border border-border">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-muted mb-4">
                <span className="font-medium text-text">{template.techStack.framework}</span> + {template.techStack.styling}
              </div>

              <button
                onClick={() => handleTemplateSelect(template)}
                className="btn-primary w-full px-4 py-2"
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-text mb-2">No templates found</h3>
          <p className="text-muted">Try adjusting your search filters</p>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomization && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="card bg-surface-elevated dark:bg-surface-elevated rounded-xl border border-border max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-text mb-4">Customize "{selectedTemplate.name}"</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Company/Project Name
                </label>
                <input
                  type="text"
                  value={customizations.companyName}
                  onChange={(e) => setCustomizations({ ...customizations, companyName: e.target.value })}
                  className="input-base w-full px-3 py-2"
                  placeholder="My Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={customizations.industry}
                  onChange={(e) => setCustomizations({ ...customizations, industry: e.target.value })}
                  className="input-base w-full px-3 py-2"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Color Scheme
                </label>
                <select
                  value={customizations.colorScheme}
                  onChange={(e) => setCustomizations({ ...customizations, colorScheme: e.target.value })}
                  className="input-base w-full px-3 py-2"
                >
                  <option value="">Default</option>
                  <option value="blue and white">Blue & White</option>
                  <option value="dark and modern">Dark & Modern</option>
                  <option value="warm and inviting">Warm & Inviting</option>
                  <option value="professional and clean">Professional & Clean</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustomization(false)}
                className="btn-secondary flex-1 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUseTemplate}
                className="btn-primary flex-1 px-4 py-2"
              >
                Generate Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
