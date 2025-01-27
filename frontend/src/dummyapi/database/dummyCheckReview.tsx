import { CheckReviewRow } from "../../models";
export const dummyCheckReviews: CheckReviewRow[] = [
    {
        projectId: "1",
        activityNo: "CR001",
        activityName: "Hydraulic Design Review",
        objective: "Verify hydraulic calculations and pipe network design",
        references: "CPHEEO Manual, IS 3114:1994",
        fileName: "hydraulic_design_review.pdf",
        qualityIssues: "Head loss calculations need revision",
        completion: "95%",
        checkedBy: "Er. Mehta",
        approvedBy: "Dr. Sharma",
        actionTaken: "Hydraulic calculations revised and updated"
    },
    {
        projectId: "1",
        activityNo: "CR002",
        activityName: "Treatment Process Design Review",
        objective: "Validate treatment process design parameters",
        references: "CPHEEO Manual, IS 7535:1986",
        fileName: "process_design_review.pdf",
        qualityIssues: "BOD removal efficiency parameters to be adjusted",
        completion: "100%",
        checkedBy: "Dr. Kumar",
        approvedBy: "Dr. Sharma",
        actionTaken: "Process parameters optimized as per CPHEEO guidelines"
    }
];
