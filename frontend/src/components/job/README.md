# Job Posting Components

This directory contains components for displaying and interacting with job postings that include AI-generated learning modules and assessments.

## Components

### JobPostingCard
A reusable card component for displaying job posting summaries with:
- Job title, company, and location
- Experience level and job type indicators
- Learning path and assessment availability badges
- Application count and actions (View Details, Apply)
- Responsive design with Tailwind CSS using slate color palette

### JobDetailedView
A comprehensive job details page with:
- **Overview Tab**: Complete job description, requirements, and benefits
- **Learning Path Tab**: AI-generated learning modules with:
  - Module descriptions and estimated hours
  - Difficulty levels and prerequisites
  - Skills covered for each module
  - Sequential ordering with progress indicators
- **Assessment Tab**: Skills assessments with:
  - Assessment type and difficulty indicators
  - Question count and time limits
  - Passing score requirements
  - Submission statistics

## Features

### AI-Generated Content
- **Learning Paths**: Personalized learning modules created by AI based on job requirements
- **Assessments**: Skill-based assessments tailored to the specific role

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Proper loading indicators while fetching data
- **Error Handling**: User-friendly error messages
- **Interactive Elements**: Hover effects and smooth transitions

### Integration
- Connected to backend APIs for job data, learning paths, and assessments
- Supports both candidate and recruiter views
- Integrated with application tracking system

## Usage

```tsx
import { JobPostingCard } from './JobPostingCard';
import { JobDetailedView } from './JobDetailedView';

// Display job card
<JobPostingCard 
  job={jobData} 
  onViewDetails={handleView}
  onApply={handleApply}
  isApplied={hasApplied}
/>

// Full job details (used in routes)
<JobDetailedView />
```

## Styling
Components use Tailwind CSS with the slate color palette as preferred by the user, avoiding inline CSS styles.
