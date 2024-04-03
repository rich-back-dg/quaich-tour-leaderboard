import { csvToJson } from "@/lib/csvToJson";
import '@testing-library/jest-dom'

describe('csvToJson function', () => {
    test('should convert valid CSV data to JSON', () => {
      const csvData = `Name, Age, City\nJohn, 30, New York\nAlice, 25, Los Angeles\n`;
      const expectedJson = [
        { Name: 'John', Age: '30', City: 'New York' },
        { Name: 'Alice', Age: '25', City: 'Los Angeles' }
      ];
      expect(csvToJson(csvData)).toEqual(expectedJson);
    });
  
    test('should handle empty rows', () => {
      const csvData = `Name, Age, City\nJohn, 30, New York\n\nAlice, 25, Los Angeles\n`;
      const expectedJson = [
        { Name: 'John', Age: '30', City: 'New York' },
        { Name: 'Alice', Age: '25', City: 'Los Angeles' }
      ];
      expect(csvToJson(csvData)).toEqual(expectedJson);
    });
  
    test('should handle empty fields', () => {
      const csvData = `Name, Age, City\nJohn, 30,\nAlice, , Los Angeles\n`;
      const expectedJson = [
        { Name: 'John', Age: '30', City: '' },
        { Name: 'Alice', Age: '', City: 'Los Angeles' }
      ];
      expect(csvToJson(csvData)).toEqual(expectedJson);
    });

  
  });