import { InputRegisterRow } from "../../models";

export const dummyInputRegister: InputRegisterRow[] = [
    {
        id: 1,
        projectId: 1,
        dataReceived: "Topographical Survey and Soil Investigation Report",
        receiptDate: "2024-01-05",
        receivedFrom: "Geo Technical Consultants",
        filesFormat: "PDF, DWG, XLS",
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: "Er. Verma",
        checkedDate: "2024-01-06",
        custodian: "Chief Design Engineer",
        storagePath: "/documents/input/2024/001",
        remarks: "Complete soil profile and contour mapping received"
    },
    {
        id: 2,
        projectId: 1,
        dataReceived: "Existing Sewerage Network Details and Water Quality Analysis Reports",
        receiptDate: "2024-01-12",
        receivedFrom: "Municipal Corporation",
        filesFormat: "PDF, DWG, XLS",
        noOfFiles: 8,
        fitForPurpose: true,
        check: true,
        checkedBy: "Dr. Reddy",
        checkedDate: "2024-01-13",
        custodian: "Process Design Head",
        storagePath: "/documents/input/2024/002",
        remarks: "Includes last 5 years' water quality data and network drawings"
    }
];
