import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CompanyProfile, Ambition, KeyResult } from '@/types';

// Service Gemini AI pour des conseils intelligents
export class GeminiService {
  private static instance: GeminiService;
  private genAI?: GoogleGenerativeAI;
  private model?: any;

  private constructor() {
    // Ne pas initialiser Gemini côté serveur (pendant le build statique)
    if (typeof window === 'undefined') {
      console.log('⚠️ Gemini non initialisé côté serveur (build statique)');
      return;
    }

    // Récupération sécurisée de la clé API depuis les variables d'environnement
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('⚠️ Clé API Gemini non configurée. Utilisation du mode simulation.');
      console.warn('💡 Pour activer l\'IA, ajoutez NEXT_PUBLIC_GEMINI_API_KEY dans votre fichier .env.local');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Utiliser Gemini 2.0 Flash (le plus récent et rapide)
      // Autres options: 'gemini-2.0-flash-exp', 'gemini-exp-1206'
      const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      console.log(`✅ Gemini AI initialisé avec succès (modèle: ${modelName})`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de Gemini:', error);
      console.warn('⚠️ Utilisation du mode simulation.');
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  // Vérifier si l'API est disponible
  public isAvailable(): boolean {
    return !!this.model;
  }

  // Générer des conseils pour une ambition
  public async generateAmbitionAdvice(
    ambition: Partial<Ambition>,
    companyProfile?: CompanyProfile
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('L\'API Gemini n\'est pas configurée. Veuillez ajouter votre clé API dans le fichier .env.local');
    }

    try {
      const prompt = this.buildAmbitionPrompt(ambition, companyProfile);
      console.log('🤖 Appel à Gemini AI pour validation de l\'ambition...');
      console.log('📝 Prompt envoyé à Gemini:', prompt);
      console.log('🏢 Profil entreprise:', companyProfile);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Réponse Gemini reçue:', text);

      // Parser la réponse pour extraire les conseils
      return this.parseAdviceResponse(text);
    } catch (error: any) {
      console.error('❌ Erreur Gemini API:', error?.message || error);

      // Message d'erreur clair selon le type d'erreur
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        throw new Error('Le modèle Gemini AI n\'est pas disponible. Veuillez vérifier votre configuration API.');
      } else if (error?.message?.includes('API key')) {
        throw new Error('Clé API Gemini invalide. Veuillez vérifier votre configuration.');
      } else {
        throw new Error(`Erreur lors de l'appel à l'API Gemini : ${error?.message || 'Erreur inconnue'}`);
      }
    }
  }

  // Générer des conseils pour un résultat clé
  public async generateKeyResultAdvice(
    keyResult: Partial<KeyResult>,
    companyProfile?: CompanyProfile
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('L\'API Gemini n\'est pas configurée. Veuillez ajouter votre clé API dans le fichier .env.local');
    }

    try {
      const prompt = this.buildKeyResultPrompt(keyResult, companyProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAdviceResponse(text);
    } catch (error: any) {
      console.error('❌ Erreur Gemini API:', error?.message || error);

      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        throw new Error('Le modèle Gemini AI n\'est pas disponible. Veuillez vérifier votre configuration API.');
      } else if (error?.message?.includes('API key')) {
        throw new Error('Clé API Gemini invalide. Veuillez vérifier votre configuration.');
      } else {
        throw new Error(`Erreur lors de l'appel à l'API Gemini : ${error?.message || 'Erreur inconnue'}`);
      }
    }
  }

  // Générer des questions contextuelles sur l'entreprise
  public async generateCompanyQuestions(
    existingProfile?: Partial<CompanyProfile>
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      throw new Error('L\'API Gemini n\'est pas configurée. Veuillez ajouter votre clé API dans le fichier .env.local');
    }

    try {
      const prompt = this.buildCompanyQuestionsPrompt(existingProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseQuestionsResponse(text);
    } catch (error: any) {
      console.error('❌ Erreur Gemini API:', error?.message || error);

      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        throw new Error('Le modèle Gemini AI n\'est pas disponible. Veuillez vérifier votre configuration API.');
      } else if (error?.message?.includes('API key')) {
        throw new Error('Clé API Gemini invalide. Veuillez vérifier votre configuration.');
      } else {
        throw new Error(`Erreur lors de l'appel à l'API Gemini : ${error?.message || 'Erreur inconnue'}`);
      }
    }
  }

  // Générer une rétrospective trimestrielle (résumé IA)
  public async generateQuarterRetrospective(input: {
    quarterName: string;
    year: number;
    keyResults: Array<Partial<KeyResult>>;
    actionsDone: number;
    actionsTotal: number;
    companyProfile?: CompanyProfile;
  }): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("L'API Gemini n'est pas configurée. Veuillez ajouter votre clé API dans le fichier .env.local");
    }
    const prompt = this.buildQuarterRetrospectivePrompt(input);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text?.trim() || 'Rétrospective indisponible.';
  }

  private buildQuarterRetrospectivePrompt(input: {
    quarterName: string;
    year: number;
    keyResults: Array<Partial<KeyResult>>;
    actionsDone: number;
    actionsTotal: number;
    companyProfile?: CompanyProfile;
  }): string {
    const { quarterName, year, keyResults, actionsDone, actionsTotal, companyProfile } = input;
    const krLines = (keyResults || []).slice(0, 8).map((kr, i) => `- KR${i+1}: ${kr.title || 'Sans titre'} | Cible: ${kr.target ?? '-'} ${kr.unit ?? ''} | Actuel: ${kr.current ?? '-'} | Échéance: ${kr.deadline ? new Date(kr.deadline).toLocaleDateString() : '-'}`);
    const execRate = actionsTotal > 0 ? Math.round((actionsDone / actionsTotal) * 100) : 0;

    let prompt = `En tant que coach OKR senior, rédige une rétrospective concise et actionnable du trimestre ${quarterName} ${year}.

Contexte:
- Taux d'exécution des actions: ${execRate}% (${actionsDone}/${actionsTotal})
- Résultats clés suivis:
${krLines.join('\n')}
`;
    if (companyProfile) {
      prompt += `\nProfil entreprise (optionnel): ${companyProfile.industry || ''}, taille ${companyProfile.size || ''}, stade ${companyProfile.stage || ''}`;
    }

    prompt += `

FORMAT DE RÉPONSE:
1) Résumé exécutif (3-4 phrases max)
2) Réussites majeures (3 puces)
3) Blocages/risques (3 puces)
4) Priorités du prochain trimestre (3-5 puces, SMART et concrètes)

Style: clair, concret, sans jargon, en français. Pas d'introduction ni de conclusion hors sections.`;

    return prompt;
  }

  // Construire le prompt pour les ambitions
  private buildAmbitionPrompt(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): string {
    let prompt = `En tant qu'expert en stratégie d'entreprise et coach en OKR, analysez cette ambition et donnez EXACTEMENT 5 conseils concrets pour l'améliorer.

Ambition : "${ambition.title || 'Non définie'}"
Description : "${ambition.description || 'Non définie'}"
Catégorie : ${ambition.category || 'Non définie'}`;

    if (companyProfile) {
      prompt += `

Contexte entreprise :
- Nom : ${companyProfile.name}
- Secteur : ${companyProfile.industry}
- Taille : ${companyProfile.size}
- Stade : ${companyProfile.stage}
- Défis principaux : ${companyProfile.mainChallenges?.join(', ') || 'Non définis'}
- Marché cible : ${companyProfile.targetMarket || 'Non défini'}`;
    }

    prompt += `

FORMAT DE RÉPONSE OBLIGATOIRE :
Répondez UNIQUEMENT avec une liste numérotée de 5 conseils, sans introduction ni conclusion.
Chaque conseil doit suivre ce format exact :

1. **[Titre du conseil]** : [Action concrète en 1-2 phrases maximum]
2. **[Titre du conseil]** : [Action concrète en 1-2 phrases maximum]
...

Concentrez-vous sur :
- La clarté et la mesurabilité de l'ambition
- L'alignement avec le contexte business
- La faisabilité et les risques
- Les métriques de succès
- Les étapes clés pour l'atteindre

NE PAS inclure d'analyse préliminaire, de justification détaillée ou de conclusion. UNIQUEMENT les 5 conseils au format demandé.`;

    return prompt;
  }

  // Construire le prompt pour les résultats clés
  private buildKeyResultPrompt(keyResult: Partial<KeyResult>, companyProfile?: CompanyProfile): string {
    let prompt = `En tant qu'expert en OKR, analysez ce résultat clé selon les critères SMART et donnez 3-5 conseils d'amélioration :

Résultat clé : "${keyResult.title || 'Non défini'}"
Description : "${keyResult.description || 'Non définie'}"
Valeur cible : ${keyResult.target || 'Non définie'}
Unité : ${keyResult.unit || 'Non définie'}
Échéance : ${keyResult.deadline ? new Date(keyResult.deadline).toLocaleDateString() : 'Non définie'}`;

    if (companyProfile) {
      prompt += `

Contexte entreprise :
- Secteur : ${companyProfile.industry}
- Taille : ${companyProfile.size}
- Stade : ${companyProfile.stage}`;
    }

    prompt += `

Évaluez selon les critères SMART et donnez des conseils pour :
1. Spécificité (Specific)
2. Mesurabilité (Measurable) 
3. Atteignabilité (Achievable)
4. Pertinence (Relevant)
5. Temporalité (Time-bound)

Répondez sous forme de liste numérotée avec des conseils concrets.`;

    return prompt;
  }

  // Construire le prompt pour les questions sur l'entreprise
  private buildCompanyQuestionsPrompt(existingProfile?: Partial<CompanyProfile>): string {
    let prompt = `En tant qu'expert en stratégie d'entreprise, générez 5 questions pertinentes pour mieux comprendre le contexte business d'un entrepreneur.`;

    if (existingProfile) {
      prompt += `

Informations déjà connues :
- Nom : ${existingProfile.name || 'Non défini'}
- Secteur : ${existingProfile.industry || 'Non défini'}
- Taille : ${existingProfile.size || 'Non définie'}
- Stade : ${existingProfile.stage || 'Non défini'}
- Défis : ${existingProfile.mainChallenges?.join(', ') || 'Non définis'}

Générez des questions complémentaires qui ne répètent pas ces informations.`;
    }

    prompt += `

Les questions doivent être :
1. Ouvertes et engageantes
2. Orientées business et stratégie
3. Utiles pour personnaliser les conseils OKR
4. Adaptées au contexte entrepreneurial français
5. Formulées de manière professionnelle mais accessible

Répondez uniquement avec une liste numérotée de 5 questions, sans introduction ni conclusion.`;

    return prompt;
  }

  // Parser la réponse pour extraire les conseils
  private parseAdviceResponse(text: string): string[] {
    const advice: string[] = [];

    // Diviser le texte en lignes et chercher les conseils numérotés
    const lines = text.split('\n');
    let currentAdvice = '';
    let currentTitle = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Détecter le début d'un nouveau conseil : "1. **Titre** : Description"
      const adviceMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*:\s*(.*)$/);

      if (adviceMatch) {
        // Sauvegarder le conseil précédent s'il existe
        if (currentTitle && currentAdvice) {
          advice.push(`${currentTitle} : ${currentAdvice}`);
        }

        // Commencer un nouveau conseil
        currentTitle = adviceMatch[2].trim();
        currentAdvice = adviceMatch[3].trim();
      } else if (currentTitle && line && !line.match(/^\d+\./)) {
        // Continuer le conseil actuel (ligne de suite)
        currentAdvice += ' ' + line;
      }
    }

    // Ajouter le dernier conseil
    if (currentTitle && currentAdvice) {
      // Nettoyer et limiter la longueur
      let cleanAdvice = currentAdvice
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanAdvice.length > 250) {
        cleanAdvice = cleanAdvice.substring(0, 250) + '...';
      }

      advice.push(`${currentTitle} : ${cleanAdvice}`);
    }

    // Si aucun conseil structuré n'est trouvé, chercher les lignes numérotées simples
    if (advice.length === 0) {
      for (const line of lines) {
        if (/^\d+\./.test(line.trim())) {
          const cleaned = line.trim()
            .replace(/^\d+\.\s*/, '')
            .replace(/\*\*/g, '');

          // Limiter la longueur
          if (cleaned.length > 250) {
            advice.push(cleaned.substring(0, 250) + '...');
          } else {
            advice.push(cleaned);
          }
        }
      }
    }

    return advice.length > 0 ? advice : [text.trim()];
  }

  // Parser la réponse pour extraire les questions
  private parseQuestionsResponse(text: string): string[] {
    const lines = text.split('\n').filter(line => line.trim());
    const questions: string[] = [];
    
    for (const line of lines) {
      if (/^\d+\./.test(line.trim()) || line.includes('?')) {
        questions.push(line.trim().replace(/^\d+\.\s*/, ''));
      }
    }
    
    return questions.length > 0 ? questions : [text.trim()];
  }

  // Note: Les méthodes fallback ont été supprimées
  // L'application affiche maintenant des messages d'erreur clairs si l'API n'est pas disponible
}

// Instance singleton
export const geminiService = GeminiService.getInstance();
