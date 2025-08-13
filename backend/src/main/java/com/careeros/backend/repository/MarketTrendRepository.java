package com.careeros.backend.repository;

import com.careeros.backend.model.MarketTrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketTrendRepository extends JpaRepository<MarketTrend, Long> {
    
    /**
     * Find market trends by skill name
     * @param skillName The skill name
     * @return List of market trends for the skill
     */
    List<MarketTrend> findBySkillName(String skillName);
    
    /**
     * Find market trends by skill names
     * @param skillNames List of skill names
     * @return List of market trends for the skills
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.skillName IN :skillNames")
    List<MarketTrend> findBySkillNames(@Param("skillNames") List<String> skillNames);
    
    /**
     * Find trending skills (trending up)
     * @return List of trending skills
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.trendingDirection = 'UP'")
    List<MarketTrend> findTrendingSkills();
    
    /**
     * Find skills with high demand score
     * @param minDemandScore The minimum demand score
     * @return List of high-demand skills
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.demandScore >= :minDemandScore ORDER BY mt.demandScore DESC")
    List<MarketTrend> findByDemandScoreAbove(@Param("minDemandScore") Double minDemandScore);
    
    /**
     * Find skills with high growth rate
     * @param minGrowthRate The minimum growth rate percentage
     * @return List of high-growth skills
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.growthRatePercentage >= :minGrowthRate ORDER BY mt.growthRatePercentage DESC")
    List<MarketTrend> findByGrowthRateAbove(@Param("minGrowthRate") Double minGrowthRate);
    
    /**
     * Find market trends by region
     * @param region The market region
     * @return List of market trends for the region
     */
    List<MarketTrend> findByMarketRegion(String region);
    
    /**
     * Find market trends by industry focus
     * @param industry The industry focus
     * @return List of market trends for the industry
     */
    List<MarketTrend> findByIndustryFocus(String industry);
    
    /**
     * Find recently updated market trends
     * @param since The date since when to look for updates
     * @return List of recently updated market trends
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.lastUpdated >= :since ORDER BY mt.lastUpdated DESC")
    List<MarketTrend> findRecentlyUpdated(@Param("since") LocalDateTime since);
    
    /**
     * Find market trends with high confidence scores
     * @param minConfidence The minimum confidence score
     * @return List of high-confidence market trends
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.confidenceScore >= :minConfidence ORDER BY mt.confidenceScore DESC")
    List<MarketTrend> findByConfidenceScoreAbove(@Param("minConfidence") Double minConfidence);
    
    /**
     * Find skills with increasing salary trends
     * @return List of skills with increasing salaries
     */
    @Query("SELECT mt FROM MarketTrend mt WHERE mt.salaryTrend = 'INCREASING' ORDER BY mt.demandScore DESC")
    List<MarketTrend> findSkillsWithIncreasingSalaries();
}
