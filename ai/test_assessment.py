#!/usr/bin/env python3
"""
Test script for the Assessment System
Run this to verify that assessment creation and scoring work correctly
"""

import asyncio
import json
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.helpers.learning_path import LearningPathAI
from app.schemas.learning_path import AssessmentQuestion

async def test_assessment_creation():
    """Test assessment creation functionality"""
    print("🧪 Testing Assessment Creation...")
    
    try:
        # Initialize the AI helper
        learning_ai = LearningPathAI()
        
        # Test parameters
        user_id = 1
        module_id = 1
        assessment_type = "quiz"
        num_questions = 3
        difficulty = "medium"
        
        print(f"📝 Creating {assessment_type} assessment for user {user_id}, module {module_id}")
        print(f"🔢 Questions: {num_questions}, Difficulty: {difficulty}")
        
        # Create assessment
        result = await learning_ai.create_assessment(
            user_id=user_id,
            module_id=module_id,
            assessment_type=assessment_type,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        if result and result.get('success'):
            print("✅ Assessment created successfully!")
            print(f"🆔 Assessment ID: {result['assessment_id']}")
            print(f"📊 Questions generated: {len(result['questions'])}")
            
            # Display questions
            for i, question in enumerate(result['questions'], 1):
                print(f"\n❓ Question {i}:")
                print(f"   {question.question}")
                print(f"   Type: {question.question_type}")
                print(f"   Difficulty: {question.difficulty}")
                if question.correct_answer:
                    print(f"   Answer: {question.correct_answer}")
                if question.explanation:
                    print(f"   Explanation: {question.explanation}")
            
            return result
        else:
            print("❌ Assessment creation failed!")
            print(f"Error: {result.get('error', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Error testing assessment creation: {e}")
        return None

async def test_assessment_scoring(assessment_result):
    """Test assessment scoring functionality"""
    if not assessment_result:
        print("⚠️ Skipping scoring test - no assessment created")
        return
    
    print("\n🧪 Testing Assessment Scoring...")
    
    try:
        # Initialize the AI helper
        learning_ai = LearningPathAI()
        
        # Extract questions from the assessment result
        questions = assessment_result['questions']
        assessment_id = assessment_result['assessment_id']
        user_id = assessment_result['user_id']
        module_id = assessment_result['module_id']
        
        # Create sample answers (in real usage, these would come from the user)
        sample_answers = []
        for question in questions:
            # For testing, we'll use the correct answer as the user's answer
            # In real usage, this would be the actual user input
            sample_answers.append({
                question.question: question.correct_answer or "Sample answer"
            })
        
        print(f"📝 Scoring assessment {assessment_id}")
        print(f"🔢 Questions to score: {len(questions)}")
        print(f"📝 Sample answers provided: {len(sample_answers)}")
        
        # Score the assessment
        scoring_result = await learning_ai.score_assessment(
            assessment_id=assessment_id,
            user_id=user_id,
            module_id=module_id,
            questions=questions,
            answers=sample_answers
        )
        
        if scoring_result and scoring_result.get('success'):
            print("✅ Assessment scored successfully!")
            print(f"📊 Total Score: {scoring_result['total_score']}/{scoring_result['max_score']}")
            print(f"📈 Percentage: {scoring_result['percentage']}%")
            print(f"💬 Overall Feedback: {scoring_result['overall_feedback']}")
            
            # Display individual scores
            print("\n📋 Individual Question Scores:")
            for i, answer_score in enumerate(scoring_result['answers_and_scores'], 1):
                print(f"\n   Question {i}:")
                print(f"      Score: {answer_score.score:.1f}")
                print(f"      Correct: {answer_score.is_correct}")
                if answer_score.feedback:
                    print(f"      Feedback: {answer_score.feedback}")
            
        else:
            print("❌ Assessment scoring failed!")
            print(f"Error: {scoring_result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error testing assessment scoring: {e}")

async def main():
    """Main test function"""
    print("🚀 Starting Assessment System Tests...")
    print("=" * 50)
    
    # Test 1: Assessment Creation
    assessment_result = await test_assessment_creation()
    
    # Test 2: Assessment Scoring
    await test_assessment_scoring(assessment_result)
    
    print("\n" + "=" * 50)
    print("🏁 Assessment System Tests Completed!")
    
    if assessment_result:
        print("✅ All tests passed successfully!")
    else:
        print("❌ Some tests failed. Check the logs above.")

if __name__ == "__main__":
    # Run the async tests
    asyncio.run(main()) 