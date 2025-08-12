import os
import json
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.futurecast import FuturecastRequest, FuturecastResponse, RoadmapData, CareerPath, Milestone, SimpleLLMResponse
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

TASK: Generate a comprehensive career roadmap with exactly 3 different paths to help someone achieve their career goal.

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
1. Create exactly 3 distinct career paths with different approaches
2. Each path should be realistic and achievable
3. Include probability values between 0.1 and 1.0
4. Use difficulty levels: "easy", "medium", or "hard"
5. Use risk levels: "low", "medium", or "high"
6. Provide practical market insights

STRUCTURE REQUIREMENTS:
- goal: The target career goal exactly as provided
- timelineYears: The timeline exactly as provided  
- explanation: Comprehensive explanation of the roadmap (2-3 sentences)
- confidence: Your confidence in this roadmap (0.1 to 1.0)
- path1Id through path3Id: Use "path1", "path2", "path3"
- path1Description through path3Description: Brief description of each approach
- path1Difficulty through path3Difficulty: "easy", "medium", or "hard"
- path1Probability through path3Probability: Success probability (0.1 to 1.0)
- path1RiskLevel through path3RiskLevel: "low", "medium", or "high"
- recommendedPathId: The ID of your recommended path ("path1", "path2", or "path3")
- marketSalaryTrends: Brief salary trend analysis for this role
- marketDemandForecast: Job market demand forecast
- marketEmergingSkills: Comma-separated list of emerging skills
- marketRiskFactors: Comma-separated list of potential risks

Generate the career roadmap now with all required fields.
"""
    
    return prompt

def convert_simple_to_complex(simple_resp: SimpleLLMResponse, request: FuturecastRequest) -> FuturecastResponse:
    """
    Convert the simple flat LLM response to the complex structured response
    """
    # Create paths with basic milestones
    paths = []
    
    # Path 1
    path1_milestones = create_milestones_for_path(
        request.timelineYears, 
        simple_resp.path1Description,
        request.userProfile.currentSalary
    )
    paths.append(CareerPath(
        pathId=simple_resp.path1Id,
        description=simple_resp.path1Description,
        difficulty=simple_resp.path1Difficulty,
        probability=simple_resp.path1Probability,
        riskLevel=simple_resp.path1RiskLevel,
        milestones=path1_milestones
    ))
    
    # Path 2
    path2_milestones = create_milestones_for_path(
        request.timelineYears, 
        simple_resp.path2Description,
        request.userProfile.currentSalary
    )
    paths.append(CareerPath(
        pathId=simple_resp.path2Id,
        description=simple_resp.path2Description,
        difficulty=simple_resp.path2Difficulty,
        probability=simple_resp.path2Probability,
        riskLevel=simple_resp.path2RiskLevel,
        milestones=path2_milestones
    ))
    
    # Path 3
    path3_milestones = create_milestones_for_path(
        request.timelineYears, 
        simple_resp.path3Description,
        request.userProfile.currentSalary
    )
    paths.append(CareerPath(
        pathId=simple_resp.path3Id,
        description=simple_resp.path3Description,
        difficulty=simple_resp.path3Difficulty,
        probability=simple_resp.path3Probability,
        riskLevel=simple_resp.path3RiskLevel,
        milestones=path3_milestones
    ))
    
    # Create market insights
    market_insights = {
        "salaryTrends": simple_resp.marketSalaryTrends,
        "demandForecast": simple_resp.marketDemandForecast,
        "emergingSkills": simple_resp.marketEmergingSkills.split(", "),
        "riskFactors": simple_resp.marketRiskFactors.split(", ")
    }
    
    # Create roadmap data
    roadmap_data = RoadmapData(
        goal=simple_resp.goal,
        timelineYears=simple_resp.timelineYears,
        paths=paths,
        marketInsights=market_insights,
        recommendedPath=simple_resp.recommendedPathId
    )
    
    return FuturecastResponse(
        roadmap=roadmap_data,
        explanation=simple_resp.explanation,
        confidence=simple_resp.confidence,
        lastUpdated=datetime.utcnow()
    )

def create_milestones_for_path(timeline_years: int, path_description: str, current_salary: float = None) -> List[Milestone]:
    """
    Create realistic milestones for a career path
    """
    milestones = []
    base_salary = current_salary or 80000
    
    for year in range(1, timeline_years + 1):
        # Calculate expected salary with growth
        salary_multiplier = 1 + (0.1 * year)  # 10% growth per year
        expected_salary = base_salary * salary_multiplier
        
        # Create milestone based on year
        if year == 1:
            title = "Build foundational skills and gain initial experience"
            skills = ["Core technical skills", "Industry knowledge", "Professional communication"]
        elif year <= timeline_years // 2:
            title = "Develop specialized expertise and leadership skills"
            skills = ["Advanced technical skills", "Project management", "Team collaboration"]
        else:
            title = "Achieve senior-level responsibilities and impact"
            skills = ["Strategic thinking", "Mentoring", "System design"]
        
        milestone = Milestone(
            year=year,
            title=title,
            expectedSalary=round(expected_salary, -3),  # Round to nearest thousand
            skillsToLearn=skills,
            notes=f"Focus on {path_description.lower()} approach",
            estimatedTimeToComplete="12 months",
            prerequisites=[],
            resources=["Online courses", "Professional development", "Networking"]
        )
        milestones.append(milestone)
    
    return milestones

def generate_career_roadmap_structured(request: FuturecastRequest) -> FuturecastResponse:
    """
    Generate a career roadmap using Gemini's simple structured output
    """
    try:
        # Create the prompt
        prompt = create_roadmap_prompt(request)
        
        print("PROMPT: ", prompt)
        
        # Use Gemini with simple structured output
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config={
                'temperature': 0.7,
                'response_mime_type': 'application/json',
                'response_schema': SimpleLLMResponse,
            },
        )
        
        # Get the parsed response
        simple_parsed = response.parsed
        
        if isinstance(simple_parsed, SimpleLLMResponse):
            # Convert to complex structure
            complex_response = convert_simple_to_complex(simple_parsed, request)
            
            # Enhance with market data
            enhanced_response = enhance_roadmap_with_market_data_structured(complex_response, request)
            return enhanced_response
        else:
            print("Warning: Structured response parsing failed, using fallback")
            return create_fallback_roadmap(request)
            
    except Exception as e:
        print(f"Error in structured roadmap generation: {str(e)}")
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

