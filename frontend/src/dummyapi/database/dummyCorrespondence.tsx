export interface InwardRow {
    id: string;
    projectId: string; // Added foreign key to project
    srNo: number;
    incomingLetterNo: string;
    letterDate: string;
    njsInwardNo: string;
    receiptDate: string;
    from: string;
    subject: string;
    attachmentDetails: string;
    actionTaken: string;
    storagePath: string;
    remarks: string;
    repliedDate: string;
}

export interface OutwardRow {
    id: string;
    projectId: string; // Added foreign key to project
    srNo: number;
    letterNo: string;
    letterDate: string;
    to: string;
    subject: string;
    attachmentDetails: string;
    actionTaken: string;
    storagePath: string;
    remarks: string;
    acknowledgement: string;
}

export const dummyInwardRows: InwardRow[] = [];
export const dummyOutwardRows: OutwardRow[] = [];
