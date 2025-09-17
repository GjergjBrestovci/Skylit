import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';

interface SamplePrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SamplePrompts: React.FC<SamplePromptsProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<SamplePrompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamplePrompts();
  }, [selectedCategory, selectedDifficulty]);

  const loadSamplePrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);

      const response = await apiClient.get(`/api/sample-prompts?${params.toString()}`);
      setPrompts(response.prompts);
    } catch (error) {
      console.error('Failed to load sample prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return '🏢';
      case 'portfolio': return '🎨';
      case 'ecommerce': return '🛒';
      case 'blog': return '📝';
      case 'landing': return '🚀';
      case 'personal': return '👤';
      default: return '🌐';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sample Prompts</h3>
        <p className="text-gray-600">Get inspired with these example prompts for different types of websites</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="business">Business</option>
          <option value="portfolio">Portfolio</option>
          <option value="ecommerce">E-commerce</option>
          <option value="blog">Blog</option>
          <option value="landing">Landing Page</option>
          <option value="personal">Personal</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getCategoryIcon(prompt.category)}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{prompt.title}</h4>
                  <span className="text-sm text-gray-500 capitalize">{prompt.category}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                {prompt.difficulty}
              </span>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {prompt.prompt}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectPrompt(prompt.prompt)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Use This Prompt
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(prompt.prompt)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                title="Copy prompt"
              >
                📋
              </button>
            </div>
          </div>
        ))}
      </div>

      {prompts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💡</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};
