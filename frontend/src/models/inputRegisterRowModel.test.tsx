import { describe, it, expect } from 'vitest';
import { InputRegisterRow } from './inputRegisterRowModel';

describe('InputRegisterRow Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Design Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'John Doe',
        checkedDate: '2024-01-02',
        custodian: 'Jane Smith',
        storagePath: '/documents/project001',
        remarks: 'All files received in good condition'
      };

      expect(inputRegister.id).toBe('1');
      expect(inputRegister.projectId).toBe('P001');
      expect(inputRegister.dataReceived).toBe('Design Documents');
      expect(inputRegister.noOfFiles).toBe(5);
    });
  });

  describe('File Information', () => {
    it('should handle different file formats', () => {
      const formats = ['PDF', 'DWG', 'XLSX', 'DOCX', 'ZIP'];

      formats.forEach(format => {
        const inputRegister: InputRegisterRow = {
          id: '1',
          projectId: 'P001',
          dataReceived: 'Documents',
          receiptDate: '2024-01-01',
          receivedFrom: 'Client',
          filesFormat: format,
          noOfFiles: 1,
          fitForPurpose: true,
          check: true,
          checkedBy: 'User',
          checkedDate: '2024-01-02',
          custodian: 'Custodian',
          storagePath: '/path',
          remarks: 'OK'
        };

        expect(inputRegister.filesFormat).toBe(format);
      });
    });

    it('should handle different file counts', () => {
      const fileCounts = [1, 5, 10, 50, 100];

      fileCounts.forEach(count => {
        const inputRegister: InputRegisterRow = {
          id: '1',
          projectId: 'P001',
          dataReceived: 'Documents',
          receiptDate: '2024-01-01',
          receivedFrom: 'Client',
          filesFormat: 'PDF',
          noOfFiles: count,
          fitForPurpose: true,
          check: true,
          checkedBy: 'User',
          checkedDate: '2024-01-02',
          custodian: 'Custodian',
          storagePath: '/path',
          remarks: 'OK'
        };

        expect(inputRegister.noOfFiles).toBe(count);
      });
    });
  });

  describe('Quality Checks', () => {
    it('should track fit for purpose status', () => {
      const fitForPurpose: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'Fit for purpose'
      };

      const notFitForPurpose: InputRegisterRow = {
        id: '2',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: false,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'Not fit for purpose'
      };

      expect(fitForPurpose.fitForPurpose).toBe(true);
      expect(notFitForPurpose.fitForPurpose).toBe(false);
    });

    it('should track check status', () => {
      const checked: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'John Doe',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'Checked'
      };

      const unchecked: InputRegisterRow = {
        id: '2',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: false,
        checkedBy: '',
        checkedDate: '',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'Pending check'
      };

      expect(checked.check).toBe(true);
      expect(unchecked.check).toBe(false);
    });
  });

  describe('Date Tracking', () => {
    it('should track receipt and check dates', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-05',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'OK'
      };

      expect(inputRegister.receiptDate).toBe('2024-01-01');
      expect(inputRegister.checkedDate).toBe('2024-01-05');
    });
  });

  describe('Storage Information', () => {
    it('should store file paths', () => {
      const paths = [
        '/documents/project001',
        'C:\\Projects\\P001\\Documents',
        '\\\\server\\share\\project001',
        'https://storage.example.com/project001'
      ];

      paths.forEach(path => {
        const inputRegister: InputRegisterRow = {
          id: '1',
          projectId: 'P001',
          dataReceived: 'Documents',
          receiptDate: '2024-01-01',
          receivedFrom: 'Client',
          filesFormat: 'PDF',
          noOfFiles: 5,
          fitForPurpose: true,
          check: true,
          checkedBy: 'User',
          checkedDate: '2024-01-02',
          custodian: 'Custodian',
          storagePath: path,
          remarks: 'OK'
        };

        expect(inputRegister.storagePath).toBe(path);
      });
    });

    it('should track custodian information', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Jane Smith',
        storagePath: '/path',
        remarks: 'OK'
      };

      expect(inputRegister.custodian).toBe('Jane Smith');
    });
  });

  describe('Remarks', () => {
    it('should store detailed remarks', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'All files received in good condition. Some files require conversion to latest format.'
      };

      expect(inputRegister.remarks).toContain('good condition');
      expect(inputRegister.remarks).toContain('conversion');
    });

    it('should handle empty remarks', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: ''
      };

      expect(inputRegister.remarks).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero files', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'No data received',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'N/A',
        noOfFiles: 0,
        fitForPurpose: false,
        check: false,
        checkedBy: '',
        checkedDate: '',
        custodian: 'Custodian',
        storagePath: '',
        remarks: 'No files received'
      };

      expect(inputRegister.noOfFiles).toBe(0);
    });

    it('should handle special characters in data received', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Design Documents & Specifications (Rev. 2.0)',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 5,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'OK'
      };

      expect(inputRegister.dataReceived).toContain('&');
      expect(inputRegister.dataReceived).toContain('(');
    });

    it('should handle very large file counts', () => {
      const inputRegister: InputRegisterRow = {
        id: '1',
        projectId: 'P001',
        dataReceived: 'Documents',
        receiptDate: '2024-01-01',
        receivedFrom: 'Client',
        filesFormat: 'PDF',
        noOfFiles: 9999,
        fitForPurpose: true,
        check: true,
        checkedBy: 'User',
        checkedDate: '2024-01-02',
        custodian: 'Custodian',
        storagePath: '/path',
        remarks: 'Large batch'
      };

      expect(inputRegister.noOfFiles).toBe(9999);
    });
  });
});
