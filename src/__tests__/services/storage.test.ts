import { storageService } from '@/services/storage';
import type { User, Ambition } from '@/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User management', () => {
    const mockUser: User = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    it('should save user to localStorage', () => {
      storageService.saveUser(mockUser);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'okarina_user',
        JSON.stringify(mockUser)
      );
    });

    it('should get user from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      const result = storageService.getUser();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('okarina_user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.getUser();
      
      expect(result).toBeNull();
    });

    it('should remove user from localStorage', () => {
      storageService.removeUser();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('okarina_user');
    });
  });

  describe('Ambitions management', () => {
    const mockAmbition: Ambition = {
      id: 'test-ambition',
      userId: 'test-user',
      title: 'Test Ambition',
      description: 'Test Description',
      year: 2024,
      category: 'revenue' as any,
      priority: 'high' as any,
      status: 'active' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should save ambitions to localStorage', () => {
      const ambitions = [mockAmbition];
      storageService.saveAmbitions(ambitions);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_ambitions',
        JSON.stringify(ambitions)
      );
    });

    it('should get ambitions from localStorage', () => {
      const ambitions = [mockAmbition];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(ambitions));
      
      const result = storageService.getAmbitions();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('oskar_ambitions');
      expect(result).toEqual(ambitions);
    });

    it('should return empty array when no ambitions exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = storageService.getAmbitions();
      
      expect(result).toEqual([]);
    });

    it('should add new ambition', () => {
      const existingAmbitions = [mockAmbition];
      const newAmbition = { ...mockAmbition, id: 'new-ambition' };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAmbitions));
      
      storageService.addAmbition(newAmbition);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_ambitions',
        JSON.stringify([...existingAmbitions, newAmbition])
      );
    });

    it('should update existing ambition', () => {
      const existingAmbitions = [mockAmbition];
      const updates = { title: 'Updated Title' };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAmbitions));
      
      storageService.updateAmbition(mockAmbition.id, updates);
      
      const expectedAmbitions = [
        { ...mockAmbition, ...updates, updatedAt: expect.any(Date) }
      ];
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_ambitions',
        JSON.stringify(expectedAmbitions)
      );
    });

    it('should delete ambition', () => {
      const existingAmbitions = [mockAmbition, { ...mockAmbition, id: 'other-ambition' }];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingAmbitions));
      
      storageService.deleteAmbition(mockAmbition.id);
      
      const expectedAmbitions = [{ ...mockAmbition, id: 'other-ambition' }];
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_ambitions',
        JSON.stringify(expectedAmbitions)
      );
    });
  });

  describe('Data export/import', () => {
    it('should export all data as JSON', () => {
      const mockUser: User = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      localStorageMock.getItem.mockImplementation((key) => {
        switch (key) {
          case 'oskar_user':
            return JSON.stringify(mockUser);
          case 'oskar_ambitions':
            return JSON.stringify([]);
          case 'oskar_key_results':
            return JSON.stringify([]);
          case 'oskar_okrs':
            return JSON.stringify([]);
          case 'oskar_actions':
            return JSON.stringify([]);
          case 'oskar_tasks':
            return JSON.stringify([]);
          case 'oskar_progress':
            return JSON.stringify([]);
          default:
            return null;
        }
      });

      const result = storageService.exportData();
      const parsedResult = JSON.parse(result);

      expect(parsedResult).toHaveProperty('user', mockUser);
      expect(parsedResult).toHaveProperty('ambitions', []);
      expect(parsedResult).toHaveProperty('keyResults', []);
      expect(parsedResult).toHaveProperty('okrs', []);
      expect(parsedResult).toHaveProperty('actions', []);
      expect(parsedResult).toHaveProperty('tasks', []);
      expect(parsedResult).toHaveProperty('progress', []);
      expect(parsedResult).toHaveProperty('exportedAt');
    });

    it('should import data from JSON', () => {
      const mockData = {
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        ambitions: [],
        keyResults: [],
        okrs: [],
        actions: [],
        tasks: [],
        progress: [],
        exportedAt: new Date().toISOString(),
      };

      storageService.importData(JSON.stringify(mockData));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_user',
        JSON.stringify(mockData.user)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_ambitions',
        JSON.stringify(mockData.ambitions)
      );
    });

    it('should handle invalid JSON during import', () => {
      expect(() => {
        storageService.importData('invalid json');
      }).toThrow('Format de données invalide');
    });
  });

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        storageService.saveUser({
          id: 'test',
          name: 'Test',
          email: 'test@example.com',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      }).toThrow('Impossible de sauvegarder les données');
    });

    it('should return null for corrupted data', () => {
      localStorageMock.getItem.mockReturnValue('corrupted json');
      
      const result = storageService.getUser();
      
      expect(result).toBeNull();
    });
  });

  describe('Backup functionality', () => {
    it('should create backup when saving data', () => {
      const mockUser: User = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      storageService.saveUser(mockUser);

      // Verify that backup was created (setItem called twice: once for user, once for backup)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'oskar_backup',
        expect.any(String)
      );
    });

    it('should restore from backup', () => {
      const mockBackupData = {
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        ambitions: [],
        keyResults: [],
        okrs: [],
        actions: [],
        tasks: [],
        progress: [],
        exportedAt: new Date().toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBackupData));

      const result = storageService.restoreFromBackup();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('oskar_backup');
    });

    it('should return false when no backup exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = storageService.restoreFromBackup();

      expect(result).toBe(false);
    });
  });
});
