import { InwardRow, OutwardRow } from "../../models";
export const dummyInwardRows: InwardRow[] = [
    {
        id: "IN001",
        projectId: "1",
        srNo: 1,
        incomingLetterNo: "PHED/2024/001",
        letterDate: "2024-01-10",
        njsInwardNo: "NJS/IN/2024/001",
        receiptDate: "2024-01-11",
        from: "Public Health Engineering Department",
        subject: "Revised Population Projections for STP Design",
        attachmentDetails: "Population_Projection_2045.pdf",
        actionTaken: "Forwarded to Design Team for STP Capacity Review",
        storagePath: "/documents/inward/2024/001",
        remarks: "Urgent review required for capacity enhancement",
        repliedDate: "2024-01-15"
    },
    {
        id: "IN002",
        projectId: "1",
        srNo: 2,
        incomingLetterNo: "PHED/2024/002",
        letterDate: "2024-01-20",
        njsInwardNo: "NJS/IN/2024/002",
        receiptDate: "2024-01-21",
        from: "Public Health Engineering Department",
        subject: "Water Quality Parameters Update",
        attachmentDetails: "WaterQuality_Standards_2024.pdf",
        actionTaken: "Reviewed by Process Design Team",
        storagePath: "/documents/inward/2024/002",
        remarks: "New parameters as per latest CPCB guidelines",
        repliedDate: "2024-01-23"
    }
];

export const dummyOutwardRows: OutwardRow[] = [
    {
        id: "OUT001",
        projectId: "1",
        srNo: 1,
        letterNo: "NJS/OUT/2024/001",
        letterDate: "2024-01-16",
        to: "Public Health Engineering Department",
        subject: "STP Capacity Enhancement Proposal",
        attachmentDetails: "STP_Capacity_Enhancement_Proposal.pdf",
        actionTaken: "Sent via registered post",
        storagePath: "/documents/outward/2024/001",
        remarks: "Includes revised hydraulic calculations",
        acknowledgement: "Received on 2024-01-17"
    },
    {
        id: "OUT002",
        projectId: "1",
        srNo: 2,
        letterNo: "NJS/OUT/2024/002",
        letterDate: "2024-01-24",
        to: "Public Health Engineering Department",
        subject: "Advanced Oxidation Process Integration Plan",
        attachmentDetails: "AOP_Integration_Plan.pdf",
        actionTaken: "Sent via email and hard copy",
        storagePath: "/documents/outward/2024/002",
        remarks: "Awaiting technical approval",
        acknowledgement: "Received on 2024-01-24"
    }
];
