import os
import json
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.futurecast import FuturecastRequest, FuturecastResponse, RoadmapData, CareerPath, Milestone
from app.helpers.llm import get_gemini_text_completion
from datetime import datetime
import re
from google import genai

# Initialize Gemini client for structured output
client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def create_roadmap_prompt(request: FuturecastRequest) -> str:
    """
    Create a comprehensive prompt for Gemini AI to generate career roadmaps
    """
    
    # Extract user data
    career_goal = request.careerGoal
    timeline = request.timelineYears
    current_role = request.userProfile.currentRole
    skills = ", ".join(request.userProfile.skills)
    education = request.userProfile.education
    yoe = request.userProfile.yoe or str(request.userProfile.yearsOfExperience or 0)
    
    # Preferences
    work_env = request.preferences.workEnvironment or "flexible"
    salary_target = request.preferences.salary or "competitive"
    learning_style = request.preferences.learningStyle or "mixed"
    risk_tolerance = request.preferences.riskTolerance or "medium"
    
    # Market data
    salary_growth = request.marketData.averageSalaryGrowth if request.marketData else 0.08
    job_demand = request.marketData.jobDemandTrend if request.marketData else "stable"
    industry_growth = request.marketData.industryGrowthRate if request.marketData else 0.10
    
    prompt = f"""
You are an expert career advisor and AI assistant specializing in creating detailed, personalized career roadmaps. 

TASK: Generate a comprehensive career roadmap with 3-5 different paths to help someone achieve their career goal.

USER PROFILE:
- Current Role: {current_role}
- Target Role: {career_goal}
- Timeline: {timeline} years
- Current Skills: {skills}
- Education: {education}
- Years of Experience: {yoe}
- Work Environment Preference: {work_env}
- Target Salary: {salary_target}
- Learning Style: {learning_style}
- Risk Tolerance: {risk_tolerance}

MARKET CONDITIONS:
- Average Salary Growth: {salary_growth*100}% annually
- Job Demand Trend: {job_demand}
- Industry Growth Rate: {industry_growth*100}% annually

REQUIREMENTS:
1. Create 3-5 distinct career paths, each with different approaches (e.g., traditional promotion, skill pivot, industry switch, entrepreneurial)
2. Each path should have realistic milestones for each year in the timeline
3. Include expected salary progression based on market data
4. Suggest specific skills to learn at each milestone
5. Consider the user's preferences and constraints
6. Provide practical, actionable advice

IMPORTANT GUIDELINES:
- Be realistic about timelines and salary expectations
- Consider current market conditions and industry trends
- Ensure milestones build upon each other logically
- Include both technical and soft skills where appropriate
- Factor in the user's risk tolerance and learning style
- Provide actionable, specific guidance
- Make sure all salary figures are realistic for the market and location
- Include diverse path options (traditional, alternative, innovative approaches)

Generate a comprehensive career roadmap now.
"""
    
    return prompt

def generate_career_roadmap_structured(request: FuturecastRequest) -> FuturecastResponse:
    """
    Generate a career roadmap using Gemini's structured output with Pydantic models
    """
    try:
        # Create the prompt
        prompt = create_roadmap_prompt(request)
        
        print("PROMPT: ", prompt)
        
        # Use Gemini with structured output
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config={
                'temperature': 0.7,  # Slightly lower temperature for more consistent structure
                'response_mime_type': 'application/json',
                'response_schema': FuturecastResponse,
            },
        )
        
        # Get the parsed response directly
        parsed_response = response.parsed
        
        if isinstance(parsed_response, FuturecastResponse):
            # Enhance with market data and personalization
            enhanced_response = enhance_roadmap_with_market_data_structured(parsed_response, request)
            return enhanced_response
        else:
            # Fallback if parsing fails
            print("Warning: Structured response parsing failed, using fallback")
            return create_fallback_roadmap(request)
            
    except Exception as e:
        print(f"Error in structured roadmap generation: {str(e)}")
        # Fallback response in case of AI failure
        return create_fallback_roadmap(request)

def enhance_roadmap_with_market_data_structured(roadmap_response: FuturecastResponse, request: FuturecastRequest) -> FuturecastResponse:
    """
    Enhance the structured roadmap response with additional market insights and adjustments
    """
    try:
        # Add current timestamp
        roadmap_response.lastUpdated = datetime.utcnow()
        
        # Enhance salary projections based on market data
        if request.marketData:
            salary_growth = request.marketData.averageSalaryGrowth
            
            # Adjust salary expectations in each path
            for path in roadmap_response.roadmap.paths:
                for milestone in path.milestones:
                    if milestone.expectedSalary:
                        # Apply market growth rate adjustment
                        year = milestone.year
                        adjusted_salary = milestone.expectedSalary * (1 + salary_growth) ** (year - 1)
                        milestone.expectedSalary = round(adjusted_salary, -3)  # Round to nearest thousand
        
        # Add personalization based on user profile
        current_salary = request.userProfile.currentSalary
        if current_salary:
            # Ensure first year salaries are realistic based on current salary
            for path in roadmap_response.roadmap.paths:
                if path.milestones:
                    first_milestone = path.milestones[0]
                    if first_milestone.expectedSalary:
                        # Ensure reasonable growth from current salary
                        min_salary = current_salary * 1.05  # At least 5% growth
                        max_salary = current_salary * 1.25  # Max 25% growth in first year
                        first_milestone.expectedSalary = max(
                            min_salary,
                            min(first_milestone.expectedSalary, max_salary)
                        )
        
        # Set confidence based on data quality
        if not roadmap_response.confidence:
            # Calculate confidence based on available data
            confidence = 0.8  # Base confidence
            if request.userProfile.currentSalary:
                confidence += 0.1
            if len(request.userProfile.skills) >= 3:
                confidence += 0.05
            if request.marketData and request.marketData.emergingSkills:
                confidence += 0.05
            roadmap_response.confidence = min(confidence, 1.0)
        
        return roadmap_response
        
    except Exception as e:
        print(f"Warning: Could not enhance roadmap with market data: {str(e)}")
        return roadmap_response

def generate_career_roadmap(request: FuturecastRequest) -> FuturecastResponse:
    """
    Main function to generate a comprehensive career roadmap using structured Gemini AI
    """
    return generate_career_roadmap_structured(request)

def create_fallback_roadmap(request: FuturecastRequest) -> FuturecastResponse:
    """
    Create a basic fallback roadmap if AI generation fails
    """
    career_goal = request.careerGoal
    timeline = request.timelineYears
    current_role = request.userProfile.currentRole
    
    # Create basic milestones
    milestones = []
    years_per_milestone = max(1, timeline // 3)
    for i in range(0, timeline, years_per_milestone):
        year = i + 1
        if year <= timeline:
            milestone = Milestone(
                year=year,
                title=f"Milestone {year}: Progress toward {career_goal}",
                expectedSalary=None,
                skillsToLearn=["Core skills for the role"],
                notes="Develop relevant skills and gain experience",
                estimatedTimeToComplete=f"{years_per_milestone} year(s)",
                prerequisites=[],
                resources=["Industry courses and certifications"]
            )
            milestones.append(milestone)
    
    # Create a simple path
    fallback_path = CareerPath(
        pathId="path1",
        description=f"Traditional progression from {current_role} to {career_goal}",
        difficulty="medium",
        probability=0.7,
        riskLevel="medium",
        milestones=milestones,
        totalInvestment=None,
        alternativeOptions=[]
    )
    
    # Create roadmap data
    roadmap_data = RoadmapData(
        goal=career_goal,
        timelineYears=timeline,
        paths=[fallback_path],
        marketInsights={
            "salaryTrends": "Market data analysis pending",
            "demandForecast": "Stable demand expected",
            "emergingSkills": ["Industry-specific skills"],
            "riskFactors": ["Market volatility"]
        },
        recommendedPath="path1"
    )
    
    return FuturecastResponse(
        roadmap=roadmap_data,
        explanation="This is a basic roadmap. For detailed insights, please try again or contact support.",
        confidence=0.5,
        lastUpdated=datetime.utcnow()
    )

def validate_roadmap_data(data: Dict[str, Any]) -> bool:
    """
    Validate that the roadmap data has all required fields and proper structure
    """
    try:
        # Check main structure
        if not isinstance(data, dict):
            return False
            
        if "roadmap" not in data or "explanation" not in data:
            return False
            
        roadmap = data["roadmap"]
        if not isinstance(roadmap, dict):
            return False
            
        # Check roadmap structure
        required_fields = ["goal", "timelineYears", "paths"]
        for field in required_fields:
            if field not in roadmap:
                return False
                
        # Check paths structure
        paths = roadmap["paths"]
        if not isinstance(paths, list) or len(paths) == 0:
            return False
            
        # Validate each path
        for path in paths:
            if not isinstance(path, dict):
                return False
            path_required = ["pathId", "description", "milestones"]
            for field in path_required:
                if field not in path:
                    return False
                    
            # Validate milestones
            milestones = path["milestones"]
            if not isinstance(milestones, list):
                return False
                
            for milestone in milestones:
                if not isinstance(milestone, dict):
                    return False
                milestone_required = ["year", "title"]
                for field in milestone_required:
                    if field not in milestone:
                        return False
        
        return True
        
    except Exception:
        return False

