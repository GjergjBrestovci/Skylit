import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Template categories and starter gallery
const TEMPLATE_CATEGORIES = [
  {
    id: 'business',
    name: 'Business',
    description: 'Professional websites for businesses and services'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your work and skills'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online stores and product catalogs'
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Content-focused websites and publications'
  },
  {
    id: 'landing',
    name: 'Landing Pages',
    description: 'Single-page marketing and conversion sites'
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Personal websites and profiles'
  }
];

const STARTER_TEMPLATES = [
  {
    id: 'modern-agency',
    name: 'Modern Agency',
    description: 'Clean, professional design for creative agencies',
    category: 'business',
    thumbnail: '/templates/modern-agency.jpg',
    prompt: 'Create a modern, minimalist website for a creative design agency. Include sections for services, portfolio showcase, team members, and contact. Use a bold color scheme with clean typography.',
    techStack: {
      framework: 'React',
      styling: 'Tailwind CSS',
      features: ['responsive', 'animations']
    },
    tags: ['professional', 'modern', 'agency', 'creative'],
    difficulty: 'intermediate'
  },
  {
    id: 'portfolio-developer',
    name: 'Developer Portfolio',
    description: 'Showcase your coding projects and skills',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-developer.jpg',
    prompt: 'Build a developer portfolio website with sections for about me, skills, projects, experience, and contact. Include interactive elements and code examples. Use a dark theme with accent colors.',
    techStack: {
      framework: 'React',
      styling: 'Tailwind CSS',
      features: ['dark-mode', 'interactive']
    },
    tags: ['developer', 'portfolio', 'dark-theme', 'interactive'],
    difficulty: 'intermediate'
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant Website',
    description: 'Appetizing design for restaurants and cafes',
    category: 'business',
    thumbnail: '/templates/restaurant-menu.jpg',
    prompt: 'Create an elegant restaurant website with menu sections, photo gallery, reservation system, and location details. Use warm colors and food photography layouts.',
    techStack: {
      framework: 'React',
      styling: 'Bootstrap',
      features: ['responsive', 'gallery']
    },
    tags: ['restaurant', 'food', 'elegant', 'booking'],
    difficulty: 'beginner'
  },
  {
    id: 'ecommerce-fashion',
    name: 'Fashion Store',
    description: 'Stylish e-commerce site for fashion brands',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-fashion.jpg',
    prompt: 'Design a fashion e-commerce website with product grids, individual product pages, shopping cart, and checkout flow. Use a clean, fashion-forward aesthetic with large product images.',
    techStack: {
      framework: 'React',
      styling: 'Styled Components',
      features: ['ecommerce', 'responsive']
    },
    tags: ['fashion', 'ecommerce', 'shopping', 'modern'],
    difficulty: 'advanced'
  },
  {
    id: 'blog-minimal',
    name: 'Minimal Blog',
    description: 'Clean, readable blog design',
    category: 'blog',
    thumbnail: '/templates/blog-minimal.jpg',
    prompt: 'Create a minimal blog website focused on readability. Include post listings, individual post pages, categories, and search. Use typography-focused design with plenty of whitespace.',
    techStack: {
      framework: 'Vanilla JS',
      styling: 'CSS Modules',
      features: ['responsive', 'search']
    },
    tags: ['blog', 'minimal', 'typography', 'clean'],
    difficulty: 'beginner'
  },
  {
    id: 'landing-saas',
    name: 'SaaS Landing Page',
    description: 'Convert visitors with this SaaS landing page',
    category: 'landing',
    thumbnail: '/templates/landing-saas.jpg',
    prompt: 'Build a high-converting SaaS landing page with hero section, features, pricing plans, testimonials, and CTA buttons. Use gradients and modern UI elements.',
    techStack: {
      framework: 'React',
      styling: 'Tailwind CSS',
      features: ['responsive', 'animations', 'forms']
    },
    tags: ['saas', 'landing', 'conversion', 'pricing'],
    difficulty: 'intermediate'
  }
];

const SAMPLE_PROMPTS = [
  {
    id: 'business-consulting',
    title: 'Business Consulting Firm',
    prompt: 'Create a professional website for a business consulting firm specializing in digital transformation. Include sections for services, case studies, team expertise, and client testimonials.',
    category: 'business',
    difficulty: 'intermediate'
  },
  {
    id: 'personal-trainer',
    title: 'Personal Trainer',
    prompt: 'Design a fitness website for a personal trainer. Include workout programs, nutrition tips, client transformations, booking system for sessions, and contact information.',
    category: 'personal',
    difficulty: 'beginner'
  },
  {
    id: 'tech-startup',
    title: 'Tech Startup',
    prompt: 'Build a modern website for a tech startup developing AI solutions. Include product features, pricing, team bios, investor information, and a demo request form.',
    category: 'business',
    difficulty: 'advanced'
  },
  {
    id: 'art-gallery',
    title: 'Art Gallery',
    prompt: 'Create an elegant art gallery website showcasing contemporary artworks. Include artist profiles, exhibition schedules, artwork collections, and online purchasing options.',
    category: 'portfolio',
    difficulty: 'intermediate'
  }
];

// Get all template categories
export const getTemplateCategories = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      categories: TEMPLATE_CATEGORIES
    });
  } catch (error) {
    console.error('Get template categories error:', error);
    res.status(500).json({ error: 'Failed to fetch template categories' });
  }
};

// Get templates by category or all templates
export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let filteredTemplates = [...STARTER_TEMPLATES];

    // Filter by category
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
    }

    // Search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.tags.some(tag => tag.includes(searchTerm))
      );
    }

    res.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Get specific template details
export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    
    const template = STARTER_TEMPLATES.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

// Get sample prompts for inspiration
export const getSamplePrompts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    
    let filteredPrompts = [...SAMPLE_PROMPTS];

    if (category && category !== 'all') {
      filteredPrompts = filteredPrompts.filter(p => p.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredPrompts = filteredPrompts.filter(p => p.difficulty === difficulty);
    }

    res.json({
      prompts: filteredPrompts,
      total: filteredPrompts.length
    });
  } catch (error) {
    console.error('Get sample prompts error:', error);
    res.status(500).json({ error: 'Failed to fetch sample prompts' });
  }
};

// Generate from template
export const generateFromTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params;
    const { customizations } = req.body;
    
    const template = STARTER_TEMPLATES.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Modify the template prompt with customizations
    let enhancedPrompt = template.prompt;
    
    if (customizations) {
      if (customizations.companyName) {
        enhancedPrompt += ` The company name is "${customizations.companyName}".`;
      }
      if (customizations.industry) {
        enhancedPrompt += ` The industry focus is ${customizations.industry}.`;
      }
      if (customizations.colorScheme) {
        enhancedPrompt += ` Use a ${customizations.colorScheme} color scheme.`;
      }
      if (customizations.additionalFeatures) {
        enhancedPrompt += ` Include these additional features: ${customizations.additionalFeatures.join(', ')}.`;
      }
    }

    res.json({
      template,
      enhancedPrompt,
      techStack: template.techStack,
      message: 'Template ready for generation. Use this enhanced prompt in the generate site endpoint.'
    });
  } catch (error) {
    console.error('Generate from template error:', error);
    res.status(500).json({ error: 'Failed to process template' });
  }
};
