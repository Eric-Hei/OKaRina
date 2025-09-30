import { geminiService } from '@/services/gemini';
import type { Ambition, KeyResult, CompanyProfile } from '@/types';
import { AmbitionCategory, CompanySize, CompanyStage } from '@/types';

describe('GeminiService', () => {
  // Test de disponibilité de l'API
  describe('API Availability', () => {
    it('should check if Gemini API is available', () => {
      const isAvailable = geminiService.isAvailable();
      
      // Si la clé API est configurée, le service devrait être disponible
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        expect(isAvailable).toBe(true);
      } else {
        expect(isAvailable).toBe(false);
      }
    });

    it('should have a valid API key format if configured', () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (apiKey) {
        // Les clés API Gemini commencent généralement par "AIza"
        expect(apiKey).toMatch(/^AIza/);
        expect(apiKey.length).toBeGreaterThan(30);
      }
    });
  });

  // Test de génération de conseils pour les ambitions
  describe('generateAmbitionAdvice', () => {
    const testAmbition: Partial<Ambition> = {
      title: 'Doubler le chiffre d\'affaires',
      description: 'Passer de 500K€ à 1M€ de CA annuel',
      category: AmbitionCategory.GROWTH,
    };

    const testCompanyProfile: CompanyProfile = {
      name: 'Test Company',
      sector: 'Technology',
      size: CompanySize.SMALL,
      stage: CompanyStage.GROWTH,
      mainGoals: ['Croissance', 'Innovation'],
      challenges: ['Recrutement', 'Financement'],
      market: 'B2B SaaS',
    };

    it('should generate advice for an ambition', async () => {
      const advice = await geminiService.generateAmbitionAdvice(testAmbition, testCompanyProfile);
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThan(0);
      
      // Chaque conseil devrait être une chaîne non vide
      advice.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    }, 30000); // Timeout de 30 secondes pour l'appel API

    it('should return fallback advice when API is not available', async () => {
      // Créer une instance temporaire sans clé API
      const originalEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const advice = await geminiService.generateAmbitionAdvice(testAmbition);
      
      // Restaurer la clé API
      if (originalEnv) {
        process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalEnv;
      }
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThan(0);
    });

    it('should handle ambition without company profile', async () => {
      const advice = await geminiService.generateAmbitionAdvice(testAmbition);
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThan(0);
    }, 30000);
  });

  // Test de génération de conseils pour les résultats clés
  describe('generateKeyResultAdvice', () => {
    const testKeyResult: Partial<KeyResult> = {
      title: 'Acquérir 100 nouveaux clients',
      description: 'Atteindre 100 nouveaux clients B2B d\'ici la fin du trimestre',
      targetValue: 100,
      currentValue: 25,
      unit: 'clients',
    };

    const testCompanyProfile: CompanyProfile = {
      name: 'Test Company',
      sector: 'Technology',
      size: CompanySize.SMALL,
      stage: CompanyStage.GROWTH,
      mainGoals: ['Croissance', 'Innovation'],
      challenges: ['Recrutement', 'Financement'],
      market: 'B2B SaaS',
    };

    it('should generate advice for a key result', async () => {
      const advice = await geminiService.generateKeyResultAdvice(testKeyResult, testCompanyProfile);
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThan(0);
      
      advice.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    }, 30000);

    it('should return fallback advice for key result when API is not available', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const advice = await geminiService.generateKeyResultAdvice(testKeyResult);
      
      if (originalEnv) {
        process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalEnv;
      }
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThan(0);
    });
  });

  // Test de génération de questions sur l'entreprise
  describe('generateCompanyQuestions', () => {
    const testProfile: Partial<CompanyProfile> = {
      name: 'Test Company',
      sector: 'Technology',
      size: CompanySize.SMALL,
    };

    it('should generate company questions', async () => {
      const questions = await geminiService.generateCompanyQuestions(testProfile);
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      
      questions.forEach(question => {
        expect(typeof question).toBe('string');
        expect(question.length).toBeGreaterThan(0);
        // Les questions devraient se terminer par un point d'interrogation
        expect(question).toMatch(/\?$/);
      });
    }, 30000);

    it('should return fallback questions when API is not available', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const questions = await geminiService.generateCompanyQuestions(testProfile);
      
      if (originalEnv) {
        process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalEnv;
      }
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should generate questions without existing profile', async () => {
      const questions = await geminiService.generateCompanyQuestions();
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    }, 30000);
  });

  // Test de gestion des erreurs
  describe('Error Handling', () => {
    it('should handle invalid API responses gracefully', async () => {
      const invalidAmbition: Partial<Ambition> = {
        title: '',
        description: '',
      };
      
      const advice = await geminiService.generateAmbitionAdvice(invalidAmbition);
      
      // Même avec des données invalides, le service devrait retourner des conseils (fallback)
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
    }, 30000);
  });

  // Test d'intégration réel avec l'API (optionnel, à exécuter manuellement)
  describe('Real API Integration (manual test)', () => {
    // Ce test est marqué comme skip par défaut pour ne pas consommer de quota API
    // Pour l'exécuter, changez it.skip en it
    it.skip('should successfully call Gemini API with real request', async () => {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.warn('⚠️  Clé API Gemini non configurée - test ignoré');
        return;
      }

      const testAmbition: Partial<Ambition> = {
        title: 'Lancer un nouveau produit innovant',
        description: 'Développer et lancer un produit SaaS innovant dans les 6 prochains mois',
        category: AmbitionCategory.INNOVATION,
      };

      const testProfile: CompanyProfile = {
        name: 'Startup Tech',
        sector: 'Software',
        size: CompanySize.SMALL,
        stage: CompanyStage.STARTUP,
        mainGoals: ['Innovation', 'Croissance rapide'],
        challenges: ['Financement', 'Recrutement'],
        market: 'B2B SaaS',
      };

      console.log('🚀 Test de l\'API Gemini en cours...');
      
      const advice = await geminiService.generateAmbitionAdvice(testAmbition, testProfile);
      
      console.log('✅ Réponse de l\'API Gemini reçue:');
      console.log(advice);
      
      expect(advice).toBeDefined();
      expect(Array.isArray(advice)).toBe(true);
      expect(advice.length).toBeGreaterThanOrEqual(3);
      expect(advice.length).toBeLessThanOrEqual(5);
      
      // Vérifier que les conseils sont pertinents et non vides
      advice.forEach((item, index) => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(10);
        console.log(`  ${index + 1}. ${item}`);
      });
    }, 60000); // Timeout de 60 secondes pour ce test
  });
});

