package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BreakdownMilestoneRequest {
    @NotBlank
    private String goal;
    @NotBlank
    private String milestoneTitle;
    @NotNull
    private Integer milestoneYear;
    @NotNull
    private Integer timelineYears;

    public BreakdownMilestoneRequest() {}

    public BreakdownMilestoneRequest(String goal, String milestoneTitle, Integer milestoneYear, Integer timelineYears) {
        this.goal = goal;
        this.milestoneTitle = milestoneTitle;
        this.milestoneYear = milestoneYear;
        this.timelineYears = timelineYears;
    }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public String getMilestoneTitle() { return milestoneTitle; }
    public void setMilestoneTitle(String milestoneTitle) { this.milestoneTitle = milestoneTitle; }
    public Integer getMilestoneYear() { return milestoneYear; }
    public void setMilestoneYear(Integer milestoneYear) { this.milestoneYear = milestoneYear; }
    public Integer getTimelineYears() { return timelineYears; }
    public void setTimelineYears(Integer timelineYears) { this.timelineYears = timelineYears; }
} 