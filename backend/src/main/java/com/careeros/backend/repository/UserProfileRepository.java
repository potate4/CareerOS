package com.careeros.backend.repository;

import com.careeros.backend.model.UserProfile;
import com.careeros.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    
    Optional<UserProfile> findByUser(User user);
    
    Optional<UserProfile> findByUserId(Long userId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.user.id = :userId")
    Optional<UserProfile> findByUserIdWithQuery(@Param("userId") Long userId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.isPublic = true")
    List<UserProfile> findAllPublicProfiles();
    
    @Query("SELECT up FROM UserProfile up WHERE up.industry = :industry AND up.isPublic = true")
    List<UserProfile> findPublicProfilesByIndustry(@Param("industry") String industry);
    
    @Query("SELECT up FROM UserProfile up WHERE " +
           "(:industry IS NULL OR up.industry = :industry) AND " +
           "(:location IS NULL OR up.location = :location) AND " +
           "(:minExperience IS NULL OR up.yearsOfExperience >= :minExperience) AND " +
           "(:maxExperience IS NULL OR up.yearsOfExperience <= :maxExperience) AND " +
           "up.isPublic = true")
    List<UserProfile> findProfilesByFilters(
        @Param("industry") String industry,
        @Param("location") String location,
        @Param("minExperience") Integer minExperience,
        @Param("maxExperience") Integer maxExperience
    );
    
    boolean existsByUser(User user);
    
    boolean existsByUserId(Long userId);
} 