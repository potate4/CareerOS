"""
Advanced AI Service for CareerOS Learning Path Generation
Supports multiple AI providers with fallback mechanisms
"""

import openai
import json
import logging
from typing import Dict, Any, Optional, List
from core.ai_config import ai_config

logger = logging.getLogger(__name__)

class AIService:
    """Main AI service for learning path generation"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.google_ai_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI service clients"""
        try:
            if ai_config.is_openai_configured():
                openai.api_key = ai_config.OPENAI_API_KEY
                self.openai_client = openai
                logger.info("✅ OpenAI client initialized")
            
            # Future: Initialize other AI clients
            # if ai_config.is_anthropic_configured():
            #     self.anthropic_client = anthropic.Client(ai_config.ANTHROPIC_API_KEY)
            #     logger.info("✅ Anthropic client initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize AI clients: {e}")
    
    def generate_learning_path(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate learning path using the best available AI service"""
        
        # Try primary AI service first
        if ai_config.PRIMARY_AI_SERVICE == "openai" and self.openai_client:
            try:
                logger.info("🤖 Using OpenAI GPT for learning path generation")
                return self._generate_with_openai(request_data)
            except Exception as e:
                logger.error(f"❌ OpenAI generation failed: {e}")
                if ai_config.ENABLE_FALLBACK:
                    logger.info("🔄 Falling back to rule-based generation")
                    return self._generate_rule_based(request_data)
        
        # Fallback to rule-based generation
        logger.info("📚 Using rule-based learning path generation")
        return self._generate_rule_based(request_data)
    
    def adapt_learning_path(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt existing learning path based on progress and market changes"""
        try:
            logger.info("🔄 Adapting learning path using AI")
            
            # For now, return a simple adaptation response
            # In the future, this could use OpenAI to analyze progress and suggest changes
            return {
                "updatedModules": [],
                "newModules": [],
                "overallProgress": request_data.get("currentProgress", 0.0),
                "currentStage": request_data.get("currentStage", "BEGINNER"),
                "estimatedWeeks": request_data.get("estimatedCompletionWeeks", 12),
                "adaptationReason": "Progress-based adaptation completed"
            }
        except Exception as e:
            logger.error(f"❌ Learning path adaptation failed: {e}")
            raise Exception(f"Failed to adapt learning path: {str(e)}")
    
    def _generate_with_openai(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate learning path using OpenAI GPT"""
        
        # Create detailed prompt
        prompt = self._create_openai_prompt(request_data)
        
        try:
            response = self.openai_client.ChatCompletion.create(
                model=ai_config.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert career counselor and learning path designer. Always respond with valid JSON."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=ai_config.OPENAI_MAX_TOKENS,
                temperature=ai_config.OPENAI_TEMPERATURE
            )
            
            gpt_response = response.choices[0].message.content
            logger.info("✅ OpenAI GPT response received")
            
            # Parse and validate response
            parsed_response = self._parse_openai_response(gpt_response)
            return parsed_response
            
        except Exception as e:
            logger.error(f"❌ OpenAI API call failed: {e}")
            raise Exception(f"AI service temporarily unavailable: {str(e)}")
    
    def _create_openai_prompt(self, request_data: Dict[str, Any]) -> str:
        """Create detailed prompt for OpenAI GPT"""
        
        career_goal = request_data.get("careerGoal", "Unknown")
        experience_level = request_data.get("experienceLevel", "BEGINNER")
        learning_pace = request_data.get("learningPace", "MODERATE")
        
        # Build skills context
        current_skills = request_data.get("currentSkills", {})
        skills_context = ""
        if current_skills:
            skills_list = [f"{skill} (Level: {level:.1f})" for skill, level in current_skills.items()]
            skills_context = f"Current Skills: {', '.join(skills_list)}"
        
        # Build additional context
        additional_context = []
        
        interview_perf = request_data.get("interviewPerformance")
        if interview_perf:
            scores = []
            if interview_perf.get("overallScore"): scores.append(f"Overall: {interview_perf['overallScore']}/10")
            if interview_perf.get("technicalScore"): scores.append(f"Technical: {interview_perf['technicalScore']}/10")
            if interview_perf.get("communicationScore"): scores.append(f"Communication: {interview_perf['communicationScore']}/10")
            if interview_perf.get("problemSolvingScore"): scores.append(f"Problem Solving: {interview_perf['problemSolvingScore']}/10")
            if scores:
                additional_context.append(f"Interview Performance: {', '.join(scores)}")
        
        market_trends = request_data.get("marketTrends", [])
        if market_trends:
            trends = [f"{t['skillName']} (Demand: {t['demandScore']}/10)" for t in market_trends]
            additional_context.append(f"Market Trends: {', '.join(trends)}")
        
        learning_history = request_data.get("learningHistory", {})
        if learning_history:
            lh = learning_history
            if lh.get("completedModules", 0) > 0 or lh.get("totalHoursSpent", 0) > 0:
                history_text = f"Learning History: {lh.get('completedModules', 0)} modules completed, {lh.get('totalHoursSpent', 0)} hours spent"
                if lh.get("averageRating"):
                    history_text += f", Rating: {lh['averageRating']}/5"
                additional_context.append(history_text)
        
        additional_notes = request_data.get("additionalNotes", "")
        if additional_notes:
            additional_context.append(f"Additional Notes: {additional_notes}")
        
        # Combine all context
        context_lines = [skills_context] + additional_context
        context_text = "\n".join([line for line in context_lines if line])
        
        prompt = f"""
You are an expert career counselor and learning path designer. Create a personalized learning path for the following request:

Career Goal: {career_goal}
Experience Level: {experience_level}
Learning Pace: {learning_pace}

{context_text}

Please generate a comprehensive learning path with the following structure (respond in JSON format):

{{
    "modules": [
        {{
            "title": "Module Title",
            "description": "Detailed description of what will be learned",
            "skillFocus": "Primary skill this module focuses on",
            "difficultyLevel": "BEGINNER/INTERMEDIATE/ADVANCED/EXPERT",
            "estimatedHours": 20,
            "marketRelevance": 8.5,
            "prerequisites": "Any prerequisites needed"
        }}
    ],
    "estimatedWeeks": 16,
    "marketDemandScore": 8.8,
    "marketTrends": "Analysis of current market demand for this career path",
    "skillGapAnalysis": {{
        "totalSkillsRequired": 15,
        "currentSkills": {len(current_skills)},
        "skillsToLearn": 10,
        "prioritySkills": ["Skill1", "Skill2", "Skill3"],
        "estimatedTimeToMastery": "6-8 months"
    }},
    "learningStrategy": "Detailed learning strategy including recommended resources, practice projects, and milestones"
}}

Make sure the learning path is:
1. Realistic for the experience level and learning pace
2. Aligned with current market demands
3. Progressive (builds skills step by step)
4. Includes practical projects and real-world applications
5. Adaptable to the user's current skill gaps
6. Based on the current skills provided (if any)
7. Optimized for the specified learning pace

Respond ONLY with valid JSON, no additional text or markdown formatting.
"""
        return prompt
    
    def _parse_openai_response(self, gpt_response: str) -> Dict[str, Any]:
        """Parse and validate OpenAI GPT response"""
        try:
            # Extract JSON from response (handle markdown formatting)
            json_start = gpt_response.find('{')
            json_end = gpt_response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise Exception("Invalid response format from AI")
            
            json_str = gpt_response[json_start:json_end]
            parsed_data = json.loads(json_str)
            
            # Validate required fields
            required_fields = ["modules", "estimatedWeeks", "marketDemandScore", "skillGapAnalysis", "learningStrategy"]
            for field in required_fields:
                if field not in parsed_data:
                    raise Exception(f"Missing required field: {field}")
            
            # Validate modules
            if not isinstance(parsed_data["modules"], list) or len(parsed_data["modules"]) == 0:
                raise Exception("Invalid or empty modules list")
            
            logger.info(f"✅ Successfully parsed AI response with {len(parsed_data['modules'])} modules")
            return parsed_data
            
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to parse JSON from AI response: {e}")
            raise Exception("Invalid JSON response from AI service")
        except Exception as e:
            logger.error(f"❌ Error parsing AI response: {e}")
            raise Exception(f"Failed to process AI response: {str(e)}")
    
    def _generate_rule_based(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate learning path using rule-based logic (fallback)"""
        logger.info("📚 Generating rule-based learning path")
        
        career_goal = request_data.get("careerGoal", "General Programming").lower()
        current_skills = request_data.get("currentSkills", {})
        experience_level = request_data.get("experienceLevel", "BEGINNER")
        learning_pace = request_data.get("learningPace", "MODERATE")
        
        # Define skill mappings for different career paths
        skill_mappings = {
            "full stack developer": [
                "HTML & CSS Fundamentals", "JavaScript Basics", "React Fundamentals",
                "Node.js & Express", "Database Design", "API Development",
                "DevOps Basics", "Advanced React Patterns"
            ],
            "data scientist": [
                "Python Fundamentals", "Data Analysis with Pandas", "Statistics Basics",
                "Machine Learning Fundamentals", "Data Visualization", "SQL for Data Science",
                "Deep Learning Basics", "ML Model Deployment"
            ],
            "devops engineer": [
                "Linux Fundamentals", "Git & Version Control", "Docker Basics",
                "Kubernetes Fundamentals", "CI/CD Pipelines", "Infrastructure as Code",
                "Monitoring & Logging", "Cloud Platform Basics"
            ],
            "frontend developer": [
                "HTML & CSS", "JavaScript ES6+", "React Fundamentals",
                "State Management", "CSS Frameworks", "Testing Fundamentals",
                "Performance Optimization", "Advanced React Patterns"
            ]
        }
        
        # Get skills for career path or use default
        base_skills = skill_mappings.get(career_goal, [
            "Programming Fundamentals", "Problem Solving", "Data Structures",
            "Algorithms", "Version Control", "Testing", "Documentation"
        ])
        
        # Generate modules
        modules = []
        for i, skill in enumerate(base_skills[:8]):  # Limit to 8 modules
            difficulty = self._get_difficulty_for_index(i, experience_level)
            estimated_hours = self._calculate_hours(difficulty, learning_pace)
            
            module = {
                "title": skill,
                "description": f"Comprehensive module to master {skill}",
                "skillFocus": skill,
                "difficultyLevel": difficulty,
                "estimatedHours": estimated_hours,
                "marketRelevance": 8.0 + (i * 0.2),  # Progressive relevance
                "prerequisites": "Basic programming knowledge" if i > 0 else None
            }
            modules.append(module)
        
        # Calculate estimated weeks based on learning pace
        total_hours = sum(m["estimatedHours"] for m in modules)
        estimated_weeks = self._calculate_weeks(total_hours, learning_pace)
        
        return {
            "modules": modules,
            "estimatedWeeks": estimated_weeks,
            "marketDemandScore": 8.0,
            "marketTrends": f"Strong demand for {career_goal.replace('_', ' ')} skills in current market",
            "skillGapAnalysis": {
                "totalSkillsRequired": len(base_skills),
                "currentSkills": len(current_skills),
                "skillsToLearn": len(base_skills),
                "prioritySkills": base_skills[:3],
                "estimatedTimeToMastery": f"{estimated_weeks} weeks"
            },
            "learningStrategy": "Focus on hands-on projects, practice coding daily, and build portfolio projects"
        }
    
    def _get_difficulty_for_index(self, index: int, experience_level: str) -> str:
        """Get difficulty level based on module index and user experience"""
        if experience_level == "BEGINNER":
            if index < 2: return "BEGINNER"
            elif index < 4: return "INTERMEDIATE"
            else: return "ADVANCED"
        elif experience_level == "INTERMEDIATE":
            if index < 1: return "BEGINNER"
            elif index < 3: return "INTERMEDIATE"
            else: return "ADVANCED"
        else:  # ADVANCED or EXPERT
            if index < 1: return "INTERMEDIATE"
            else: return "ADVANCED"
    
    def _calculate_hours(self, difficulty: str, learning_pace: str) -> int:
        """Calculate estimated hours based on difficulty and learning pace"""
        base_hours = {
            "BEGINNER": 15,
            "INTERMEDIATE": 25,
            "ADVANCED": 35,
            "EXPERT": 45
        }
        
        pace_multiplier = {
            "SLOW": 1.5,
            "MODERATE": 1.0,
            "FAST": 0.7,
            "INTENSIVE": 0.5
        }
        
        base = base_hours.get(difficulty, 25)
        multiplier = pace_multiplier.get(learning_pace, 1.0)
        return int(base * multiplier)
    
    def _calculate_weeks(self, total_hours: int, learning_pace: str) -> int:
        """Calculate estimated weeks based on total hours and learning pace"""
        hours_per_week = {
            "SLOW": 5,
            "MODERATE": 10,
            "FAST": 15,
            "INTENSIVE": 25
        }
        
        weekly_hours = hours_per_week.get(learning_pace, 10)
        weeks = total_hours / weekly_hours
        return max(4, int(weeks))  # Minimum 4 weeks

# Global AI service instance
ai_service = AIService()
