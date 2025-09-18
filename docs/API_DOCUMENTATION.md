# SkyLit AI - API Documentation

## Overview

SkyLit AI provides a comprehensive REST API for AI-powered website generation. The API supports multiple frameworks, template-based generation, user management, and billing integration.

**Base URL**: `https://api.skylit.ai` (Production) | `http://localhost:5000/api` (Development)

**API Version**: v1

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

#### Refresh Token
```http
POST /api/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

## Website Generation

### Generate Website
Generate a website using AI with a custom prompt.

```http
POST /api/generate-site
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Create a modern portfolio website for a UX designer",
  "techStack": "react",
  "options": {
    "includeAnimations": true,
    "darkMode": true
  }
}
```

**Supported Tech Stacks**:
- `vanilla` - HTML, CSS, JavaScript
- `react` - React with CDN
- `vue` - Vue.js with CDN
- `nextjs` - Next.js structure
- `angular` - Angular components
- `svelte` - Svelte components

**Response (200)**:
```json
{
  "prompt": "Create a modern portfolio...",
  "enhancedPrompt": "Generate a fully responsive...",
  "analysis": "This prompt requires...",
  "requirements": ["Responsive design", "Dark theme"],
  "html": "<!DOCTYPE html>...",
  "css": "body { font-family: ...",
  "javascript": "// Interactive elements...",
  "notes": "Website generated successfully",
  "model": "gpt-4o-mini",
  "createdAt": "2024-01-15T10:30:00Z",
  "previewId": "preview_123",
  "previewUrl": "/api/preview/preview_123",
  "enhancementUsedAI": true,
  "creditsRemaining": 4
}
```

**Error Responses**:
- `402` - Insufficient credits
- `400` - Invalid prompt or tech stack
- `500` - Generation failed

### Generate from Template
Generate a website using a predefined template.

```http
POST /api/templates/{templateId}/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Acme Corp",
  "industry": "Technology",
  "colorScheme": "blue",
  "additionalFeatures": ["contact-form", "testimonials"]
}
```

## Templates

### Get Template Categories
```http
GET /api/templates/categories
```

**Response (200)**:
```json
{
  "categories": [
    {
      "id": "landing",
      "name": "Landing Pages",
      "description": "High-converting landing pages",
      "count": 12
    }
  ]
}
```

### Get Templates
```http
GET /api/templates?category=landing&difficulty=intermediate
```

**Query Parameters**:
- `category` (optional): Filter by category
- `difficulty` (optional): `beginner`, `intermediate`, `advanced`, `all`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200)**:
```json
{
  "templates": [
    {
      "id": "landing-saas",
      "name": "SaaS Landing Page",
      "description": "Convert visitors with this SaaS landing page",
      "category": "landing",
      "thumbnail": "/templates/landing-saas.jpg",
      "techStack": {
        "framework": "React",
        "styling": "Tailwind CSS",
        "features": ["responsive", "animations"]
      },
      "tags": ["saas", "landing", "conversion"],
      "difficulty": "intermediate"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get Template Details
```http
GET /api/templates/{templateId}
```

## Project Management

### Save Project
```http
POST /api/save-project
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Portfolio Website",
  "description": "Personal portfolio showcasing my work",
  "code": {
    "html": "<!DOCTYPE html>...",
    "css": "body { font-family: ...",
    "js": "// JavaScript code..."
  },
  "metadata": {
    "prompt": "Create a portfolio website",
    "techStack": {
      "framework": "react",
      "styling": "tailwind",
      "features": ["responsive", "dark-mode"]
    },
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get User Projects
```http
GET /api/get-projects?page=1&limit=10&search=portfolio
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `sortBy` (optional): `created_at`, `name`, `updated_at`
- `order` (optional): `asc`, `desc`

### Get Project Details
```http
GET /api/get-project/{projectId}
Authorization: Bearer <token>
```

### Update Project
```http
PUT /api/projects/{projectId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "starred": true,
  "archived": false
}
```

### Delete Project
```http
DELETE /api/projects/{projectId}
Authorization: Bearer <token>
```

### Duplicate Project
```http
POST /api/projects/{projectId}/duplicate
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Copy of Original Project"
}
```

## Billing & Credits

### Get User Credits
```http
GET /api/get-credits
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "credits": 5,
  "subscriptionPlan": "basic",
  "subscriptionStatus": "active",
  "nextBillingDate": "2024-02-15T00:00:00Z"
}
```

### Get Pricing Plans
```http
GET /api/pricing
```

**Response (200)**:
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "credits": 5,
      "features": ["5 website generations", "Basic templates"],
      "popular": false
    },
    {
      "id": "basic",
      "name": "Basic",
      "price": 9.99,
      "currency": "USD",
      "credits": 50,
      "features": ["50 website generations", "All templates", "Priority support"],
      "popular": true
    }
  ]
}
```

### Create Payment
```http
POST /api/create-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "basic",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

## Preview & Assets

### Get Website Preview
```http
GET /api/preview/{previewId}
```

Returns the generated website as HTML for preview.

### Delete Preview
```http
DELETE /api/preview/{previewId}
Authorization: Bearer <token>
```

## Health & Monitoring

### Health Check (Detailed)
```http
GET /api/health
```

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 25,
      "lastChecked": "2024-01-15T10:30:00Z"
    },
    "cache": {
      "status": "healthy",
      "responseTime": 5,
      "lastChecked": "2024-01-15T10:30:00Z"
    },
    "ai": {
      "status": "healthy",
      "responseTime": 150,
      "lastChecked": "2024-01-15T10:30:00Z"
    }
  },
  "metrics": {
    "memoryUsage": 65,
    "cpuUsage": 30,
    "responseTime": 85,
    "errorRate": 0.5
  }
}
```

### Simple Health Check
```http
GET /api/health/simple
```

Returns `OK` (200) or `UNHEALTHY` (503).

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

- `NO_TOKEN` - Missing authorization token
- `TOKEN_EXPIRED` - Access token has expired
- `INVALID_TOKEN` - Invalid or malformed token
- `NO_CREDITS` - Insufficient credits for operation
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Rate limit exceeded

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 attempts per 15 minutes per IP
- **Website Generation**: 5 requests per 5 minutes per IP
- **Payments**: 20 requests per hour per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642246800
```

## SDKs & Libraries

### JavaScript/TypeScript SDK

```bash
npm install @skylit/api-client
```

```typescript
import { SkyLitClient } from '@skylit/api-client';

const client = new SkyLitClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.skylit.ai'
});

// Generate website
const result = await client.generateWebsite({
  prompt: 'Create a portfolio website',
  techStack: 'react'
});
```

### Python SDK

```bash
pip install skylit-python
```

```python
from skylit import SkyLitClient

client = SkyLitClient(api_key='your_api_key')

# Generate website
result = client.generate_website(
    prompt='Create a portfolio website',
    tech_stack='react'
)
```

## Webhooks

Configure webhooks to receive real-time notifications about events.

### Supported Events

- `website.generated` - Website generation completed
- `payment.succeeded` - Payment processed successfully
- `subscription.updated` - Subscription status changed
- `credits.low` - User credits below threshold

### Webhook Payload Example

```json
{
  "event": "website.generated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "userId": "user_123",
    "projectId": "project_456",
    "techStack": "react",
    "creditsUsed": 1,
    "creditsRemaining": 4
  }
}
```

## Support

- **Documentation**: https://docs.skylit.ai
- **Support Email**: support@skylit.ai
- **Status Page**: https://status.skylit.ai
- **Discord Community**: https://discord.gg/skylit

---

*Last updated: September 18, 2025*
