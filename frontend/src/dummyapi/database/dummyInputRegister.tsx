export interface InputRegisterRow {
  id: number;
  projectId: number; // Added projectId as foreign key
  dataReceived: string;
  receiptDate: string;
  receivedFrom: string;
  filesFormat: string;
  noOfFiles: number;
  fitForPurpose: boolean;
  check: boolean;
  checkedBy: string;
  checkedDate: string;
  custodian: string;
  storagePath: string;
  remarks: string;
}

export const dummyInputRegister: InputRegisterRow[] = [];
