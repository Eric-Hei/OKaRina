import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CompanyProfile, Ambition, KeyResult, OKR, Action } from '@/types';

// Service Gemini AI pour des conseils intelligents
export class GeminiService {
  private static instance: GeminiService;
  private genAI?: GoogleGenerativeAI;
  private model?: any;

  private constructor() {
    // Récupération sécurisée de la clé API depuis les variables d'environnement
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Clé API Gemini non trouvée dans les variables d\'environnement. Utilisation du mode simulation.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
      return this.getFallbackAmbitionAdvice(ambition, companyProfile);
    }

    try {
      const prompt = this.buildAmbitionPrompt(ambition, companyProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parser la réponse pour extraire les conseils
      return this.parseAdviceResponse(text);
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return this.getFallbackAmbitionAdvice(ambition, companyProfile);
    }
  }

  // Générer des conseils pour un résultat clé
  public async generateKeyResultAdvice(
    keyResult: Partial<KeyResult>,
    companyProfile?: CompanyProfile
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      return this.getFallbackKeyResultAdvice(keyResult);
    }

    try {
      const prompt = this.buildKeyResultPrompt(keyResult, companyProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAdviceResponse(text);
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return this.getFallbackKeyResultAdvice(keyResult);
    }
  }

  // Générer des questions contextuelles sur l'entreprise
  public async generateCompanyQuestions(
    existingProfile?: Partial<CompanyProfile>
  ): Promise<string[]> {
    if (!this.isAvailable()) {
      return this.getFallbackCompanyQuestions(existingProfile);
    }

    try {
      const prompt = this.buildCompanyQuestionsPrompt(existingProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseQuestionsResponse(text);
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return this.getFallbackCompanyQuestions(existingProfile);
    }
  }

  // Construire le prompt pour les ambitions
  private buildAmbitionPrompt(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): string {
    let prompt = `En tant qu'expert en stratégie d'entreprise et coach en OKR, analysez cette ambition et donnez 3-5 conseils concrets pour l'améliorer :

Ambition : "${ambition.title || 'Non définie'}"
Description : "${ambition.description || 'Non définie'}"
Catégorie : ${ambition.category || 'Non définie'}`;

    if (companyProfile) {
      prompt += `

CONTEXTE ENTREPRISE (IMPORTANT - Tenez compte de ces informations pour personnaliser vos conseils) :
- Nom de l'entreprise : ${companyProfile.name}
- Secteur d'activité : ${companyProfile.industry}
- Taille de l'entreprise : ${companyProfile.size}
- Stade de développement : ${companyProfile.stage}
- Modèle économique : ${companyProfile.businessModel || 'Non défini'}
- Position sur le marché : ${companyProfile.marketPosition || 'Non définie'}
- Marché cible : ${companyProfile.targetMarket || 'Non défini'}
- Objectifs actuels : ${companyProfile.currentGoals?.join(', ') || 'Non définis'}
- Défis principaux : ${companyProfile.mainChallenges?.join(', ') || 'Non définis'}`;
    }

    prompt += `

Donnez vos conseils sous forme de liste numérotée, en étant spécifique et actionnable.
${companyProfile ? 'IMPORTANT : Adaptez vos conseils au contexte spécifique de cette entreprise (secteur, taille, stade, défis).' : ''}
Concentrez-vous sur :
1. La clarté et la mesurabilité de l'ambition
2. L'alignement avec le contexte business et les objectifs de l'entreprise
3. La faisabilité compte tenu du stade et de la taille de l'entreprise
4. Les métriques de succès adaptées au secteur
5. Les étapes clés pour l'atteindre en tenant compte des défis identifiés`;

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

CONTEXTE ENTREPRISE (Adaptez vos conseils à ce contexte) :
- Nom : ${companyProfile.name}
- Secteur d'activité : ${companyProfile.industry}
- Taille : ${companyProfile.size}
- Stade de développement : ${companyProfile.stage}
- Modèle économique : ${companyProfile.businessModel || 'Non défini'}
- Marché cible : ${companyProfile.targetMarket || 'Non défini'}
- Défis principaux : ${companyProfile.mainChallenges?.join(', ') || 'Non définis'}`;
    }

    prompt += `

Évaluez selon les critères SMART et donnez des conseils pour :
1. Spécificité (Specific) - Le résultat est-il clair et précis ?
2. Mesurabilité (Measurable) - Peut-on facilement mesurer la progression ?
3. Atteignabilité (Achievable) - Est-ce réaliste compte tenu du contexte de l'entreprise ?
4. Pertinence (Relevant) - Est-ce aligné avec les objectifs et défis de l'entreprise ?
5. Temporalité (Time-bound) - L'échéance est-elle appropriée ?

${companyProfile ? 'IMPORTANT : Tenez compte du secteur, de la taille et des défis de l\'entreprise dans vos recommandations.' : ''}
Répondez sous forme de liste numérotée avec des conseils concrets et actionnables.`;

    return prompt;
  }

  // Construire le prompt pour les questions sur l'entreprise
  private buildCompanyQuestionsPrompt(existingProfile?: Partial<CompanyProfile>): string {
    let prompt = `En tant qu'expert en stratégie d'entreprise, générez 5 questions pertinentes pour mieux comprendre le contexte business d'un entrepreneur.`;

    if (existingProfile) {
      prompt += `

Informations déjà connues sur l'entreprise :
- Nom : ${existingProfile.name || 'Non défini'}
- Secteur d'activité : ${existingProfile.industry || 'Non défini'}
- Taille : ${existingProfile.size || 'Non définie'}
- Stade de développement : ${existingProfile.stage || 'Non défini'}
- Modèle économique : ${existingProfile.businessModel || 'Non défini'}
- Position sur le marché : ${existingProfile.marketPosition || 'Non définie'}
- Marché cible : ${existingProfile.targetMarket || 'Non défini'}
- Objectifs actuels : ${existingProfile.currentGoals?.join(', ') || 'Non définis'}
- Défis principaux : ${existingProfile.mainChallenges?.join(', ') || 'Non définis'}

Générez des questions complémentaires qui approfondissent ces informations ou explorent des aspects non encore couverts.`;
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
    const lines = text.split('\n').filter(line => line.trim());
    const advice: string[] = [];
    
    for (const line of lines) {
      // Chercher les lignes qui commencent par un numéro ou un tiret
      if (/^\d+\./.test(line.trim()) || /^[-•]/.test(line.trim())) {
        advice.push(line.trim().replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, ''));
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

  // Conseils de fallback pour les ambitions
  private getFallbackAmbitionAdvice(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): string[] {
    const advice = [
      "Assurez-vous que votre ambition est spécifique et mesurable",
      "Définissez une échéance claire pour votre ambition",
      "Identifiez les ressources nécessaires pour l'atteindre"
    ];

    if (companyProfile?.stage === 'early_stage') {
      advice.push("En phase de démarrage, concentrez-vous sur la validation du marché");
    }

    return advice;
  }

  // Conseils de fallback pour les résultats clés
  private getFallbackKeyResultAdvice(keyResult: Partial<KeyResult>): string[] {
    return [
      "Vérifiez que votre résultat clé respecte les critères SMART",
      "Assurez-vous que la métrique est facilement mesurable",
      "Définissez des jalons intermédiaires pour suivre les progrès"
    ];
  }

  // Questions de fallback pour l'entreprise
  private getFallbackCompanyQuestions(existingProfile?: Partial<CompanyProfile>): string[] {
    if (!existingProfile) {
      return [
        "Dans quel secteur d'activité évoluez-vous ?",
        "Quelle est la taille actuelle de votre équipe ?",
        "Quels sont vos principaux défis business actuels ?",
        "Quel est votre marché cible principal ?",
        "Comment générez-vous vos revenus actuellement ?"
      ];
    }

    return [
      "Quels sont vos objectifs de croissance pour les 12 prochains mois ?",
      "Quels obstacles rencontrez-vous le plus fréquemment ?",
      "Comment mesurez-vous actuellement votre succès ?",
      "Quelles sont vos priorités stratégiques cette année ?",
      "Quels investissements prévoyez-vous dans les prochains trimestres ?"
    ];
  }
}

// Instance singleton
export const geminiService = GeminiService.getInstance();
