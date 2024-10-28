// uploadPlayers.test.js

import { playerChecker } from "@/lib/utils";

describe('playerChecker', () => {
  let existingPlayers: { pdga_num: string; first_name: string; last_name: string; has_no_pdga_num: boolean; id: number; }[];
  let jsonData;
  let updatePlayers: any[];
  let newPlayers: any[];

  beforeEach(() => {
    // Reset the arrays before each test
    updatePlayers = [];
    newPlayers = [];
  });

  test('should skip existing player by PDGA number', () => {
    existingPlayers = [
      { pdga_num: '123', first_name: 'John', last_name: 'Doe', has_no_pdga_num: false, id: 1 }
    ];
    jsonData = [
      { PDGANum: '123', FirstName: 'John', LastName: 'Doe' }
    ];

    playerChecker(jsonData, existingPlayers, updatePlayers, newPlayers);

    expect(updatePlayers).toHaveLength(0);
    expect(newPlayers).toHaveLength(0); // Player should not be added
  });

  test('should update existing player with new PDGA number', () => {
    existingPlayers = [
      { pdga_num: '', first_name: 'Jane', last_name: 'Doe', has_no_pdga_num: true, id: 2 }
    ];
    jsonData = [
      { PDGANum: '456', FirstName: 'Jane', LastName: 'Doe' }
    ];

    playerChecker(jsonData, existingPlayers, updatePlayers, newPlayers);

    expect(updatePlayers).toHaveLength(1);
    expect(updatePlayers[0]).toEqual({ id: 2, pdga_num: '456', has_no_pdga_num: false });
    expect(newPlayers).toHaveLength(0);
  });

  test('should add new player if no matches found', () => {
    existingPlayers = [];
    jsonData = [
      { PDGANum: '789', FirstName: 'New', LastName: 'Player' }
    ];

    playerChecker(jsonData, existingPlayers, updatePlayers, newPlayers);

    expect(updatePlayers).toHaveLength(0);
    expect(newPlayers).toHaveLength(1);
    expect(newPlayers[0]).toEqual({ PDGANum: '789', FirstName: 'New', LastName: 'Player' });
  });
});
