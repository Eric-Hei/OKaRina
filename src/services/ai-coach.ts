import { AI_MESSAGES } from '@/constants';
import { geminiService } from './gemini';
import type {
  Ambition,
  KeyResult,
  OKR,
  Action,
  Task,
  AIValidation,
  SmartAnalysis,
  CompanyProfile,
  User,
} from '@/types';
import { ValidationCategory, AmbitionCategory, CompanySize, CompanyStage } from '@/types';

// Service IA Coach - Simulation d'intelligence artificielle
export class AICoachService {
  private static instance: AICoachService;

  private constructor() {}

  public static getInstance(): AICoachService {
    if (!AICoachService.instance) {
      AICoachService.instance = new AICoachService();
    }
    return AICoachService.instance;
  }

  // Validation des ambitions avec contexte entreprise et IA Gemini
  public async validateAmbitionAsync(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): Promise<AIValidation> {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    // Validations de base
    if (!ambition.title || ambition.title.length < 10) {
      suggestions.push("Le titre de l'ambition devrait être plus descriptif (minimum 10 caractères)");
      confidence -= 20;
    }

    if (!ambition.description || ambition.description.length < 20) {
      suggestions.push("Ajoutez une description plus détaillée de votre ambition");
      confidence -= 15;
    }

    if (ambition.title && ambition.title.length > 100) {
      warnings.push("Le titre est peut-être trop long. Essayez d'être plus concis.");
      confidence -= 10;
    }

    // Analyse du contenu
    const title = ambition.title?.toLowerCase() || '';

    if (!this.containsActionVerb(title)) {
      suggestions.push("Utilisez un verbe d'action pour rendre votre ambition plus dynamique");
      confidence -= 15;
    }

    if (!this.containsQuantifiableElement(title)) {
      suggestions.push("Essayez d'inclure un élément quantifiable dans votre ambition");
      confidence -= 10;
    }

    // Suggestions IA avec Gemini
    try {
      const aiSuggestions = await geminiService.generateAmbitionAdvice(ambition, companyProfile);
      suggestions.push(...aiSuggestions.map(s => `🤖 ${s}`));
      confidence += 10; // Bonus pour les conseils IA
    } catch (error) {
      console.warn('Erreur lors de la génération des conseils IA:', error);
      // Fallback vers les suggestions contextuelles
      if (companyProfile) {
        const contextualSuggestions = this.getContextualSuggestions(ambition, companyProfile);
        suggestions.push(...contextualSuggestions);
      } else {
        suggestions.push("💡 Complétez votre profil d'entreprise pour des conseils personnalisés");
      }
    }

    const isValid = confidence >= 70;

    return {
      isValid,
      confidence: Math.min(confidence, 100),
      suggestions,
      warnings,
      category: ValidationCategory.AMBITION,
      validatedAt: new Date(),
    };
  }

  // Version synchrone pour la compatibilité avec le store existant
  public validateAmbition(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): AIValidation {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    // Validations de base
    if (!ambition.title || ambition.title.length < 10) {
      suggestions.push("Le titre de l'ambition devrait être plus descriptif (minimum 10 caractères)");
      confidence -= 20;
    }

    if (!ambition.description || ambition.description.length < 20) {
      suggestions.push("Ajoutez une description plus détaillée de votre ambition");
      confidence -= 15;
    }

    if (ambition.title && ambition.title.length > 100) {
      warnings.push("Le titre est peut-être trop long. Essayez d'être plus concis.");
      confidence -= 10;
    }

    // Analyse du contenu
    const title = ambition.title?.toLowerCase() || '';

    if (!this.containsActionVerb(title)) {
      suggestions.push("Utilisez un verbe d'action pour rendre votre ambition plus dynamique");
      confidence -= 15;
    }

    if (!this.containsQuantifiableElement(title)) {
      suggestions.push("Essayez d'inclure un élément quantifiable dans votre ambition");
      confidence -= 10;
    }

    // Suggestions contextuelles basées sur l'entreprise
    if (companyProfile) {
      const contextualSuggestions = this.getContextualSuggestions(ambition, companyProfile);
      suggestions.push(...contextualSuggestions);
    } else {
      suggestions.push("💡 Complétez votre profil d'entreprise pour des conseils personnalisés");
    }

    const isValid = confidence >= 70;

    return {
      isValid,
      confidence,
      suggestions,
      warnings,
      category: ValidationCategory.AMBITION,
      validatedAt: new Date(),
    };
  }

  // Validation des résultats clés avec analyse SMART et IA
  public async validateKeyResultAsync(keyResult: Partial<KeyResult>, companyProfile?: CompanyProfile): Promise<AIValidation & { smartAnalysis: SmartAnalysis }> {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    // Analyse SMART
    const smartAnalysis = this.analyzeSmartCriteria(keyResult);

    if (!smartAnalysis.specific) {
      suggestions.push("Soyez plus spécifique sur ce que vous voulez accomplir");
      confidence -= 20;
    }

    if (!smartAnalysis.measurable) {
      suggestions.push("Ajoutez des métriques précises pour mesurer le succès");
      confidence -= 25;
    }

    if (!smartAnalysis.timeBound) {
      suggestions.push("Définissez une date limite claire");
      confidence -= 20;
    }

    if (!smartAnalysis.achievable) {
      warnings.push("Cet objectif semble très ambitieux. Assurez-vous qu'il soit atteignable");
      confidence -= 15;
    }

    if (!smartAnalysis.relevant) {
      suggestions.push("Vérifiez que ce résultat clé est bien aligné avec votre ambition");
      confidence -= 10;
    }

    // Suggestions IA avec Gemini
    try {
      const aiSuggestions = await geminiService.generateKeyResultAdvice(keyResult, companyProfile);
      suggestions.push(...aiSuggestions.map(s => `🤖 ${s}`));
      confidence += 5; // Petit bonus pour les conseils IA
    } catch (error) {
      console.warn('Erreur lors de la génération des conseils IA pour le résultat clé:', error);
    }

    const isValid = confidence >= 70 && smartAnalysis.score >= 60;

    return {
      isValid,
      confidence: Math.min(confidence, 100),
      suggestions,
      warnings,
      category: ValidationCategory.KEY_RESULT,
      validatedAt: new Date(),
      smartAnalysis,
    };
  }

  // Version synchrone pour la compatibilité avec le store existant
  public validateKeyResult(keyResult: Partial<KeyResult>): AIValidation & { smartAnalysis: SmartAnalysis } {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    // Analyse SMART
    const smartAnalysis = this.analyzeSmartCriteria(keyResult);

    if (!smartAnalysis.specific) {
      suggestions.push("Soyez plus spécifique sur ce que vous voulez accomplir");
      confidence -= 20;
    }

    if (!smartAnalysis.measurable) {
      suggestions.push("Ajoutez des métriques précises pour mesurer le succès");
      confidence -= 25;
    }

    if (!smartAnalysis.timeBound) {
      suggestions.push("Définissez une date limite claire");
      confidence -= 20;
    }

    if (!smartAnalysis.achievable) {
      warnings.push("Cet objectif semble très ambitieux. Assurez-vous qu'il soit atteignable");
      confidence -= 15;
    }

    if (!smartAnalysis.relevant) {
      suggestions.push("Vérifiez que ce résultat clé est bien aligné avec votre ambition");
      confidence -= 10;
    }

    const isValid = confidence >= 70 && smartAnalysis.score >= 60;

    return {
      isValid,
      confidence,
      suggestions,
      warnings,
      category: ValidationCategory.KEY_RESULT,
      validatedAt: new Date(),
      smartAnalysis,
    };
  }

  // Validation des OKRs
  public validateOKR(okr: Partial<OKR>): AIValidation {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    if (!okr.objective || okr.objective.length < 15) {
      suggestions.push("L'objectif devrait être plus détaillé et inspirant");
      confidence -= 20;
    }

    if (!okr.keyResults || okr.keyResults.length === 0) {
      suggestions.push("Ajoutez au moins un résultat clé mesurable");
      confidence -= 30;
    }

    if (okr.keyResults && okr.keyResults.length > 5) {
      warnings.push("Limitez-vous à 3-5 résultats clés pour rester focus");
      confidence -= 15;
    }

    // Vérification de la cohérence des poids
    if (okr.keyResults) {
      const totalWeight = okr.keyResults.reduce((sum, kr) => sum + kr.weight, 0);
      if (Math.abs(totalWeight - 100) > 5) {
        suggestions.push("La somme des poids des résultats clés devrait être proche de 100%");
        confidence -= 10;
      }
    }

    const isValid = confidence >= 70;

    return {
      isValid,
      confidence,
      suggestions,
      warnings,
      category: ValidationCategory.OBJECTIVE,
      validatedAt: new Date(),
    };
  }

  // Validation des actions
  public validateAction(action: Partial<Action>): AIValidation {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    if (!action.title || action.title.length < 5) {
      suggestions.push("Le titre de l'action devrait être plus descriptif");
      confidence -= 20;
    }

    if (!action.deadline) {
      suggestions.push("Définissez une date limite pour cette action");
      confidence -= 25;
    }

    if (action.deadline && new Date(action.deadline) < new Date()) {
      warnings.push("La date limite est dans le passé");
      confidence -= 30;
    }

    if (!action.description || action.description.length < 10) {
      suggestions.push("Ajoutez une description plus détaillée de l'action");
      confidence -= 15;
    }

    const isValid = confidence >= 70;

    return {
      isValid,
      confidence,
      suggestions,
      warnings,
      category: ValidationCategory.ACTION,
      validatedAt: new Date(),
    };
  }

  // Analyse SMART des résultats clés
  private analyzeSmartCriteria(keyResult: Partial<KeyResult>): SmartAnalysis {
    let score = 0;
    const recommendations: string[] = [];

    // Specific
    const specific = !!(keyResult.title && keyResult.title.length >= 10 && keyResult.description);
    if (specific) score += 20;
    else recommendations.push("Soyez plus spécifique dans la description");

    // Measurable
    const measurable = !!(keyResult.targetValue && keyResult.unit);
    if (measurable) score += 20;
    else recommendations.push("Ajoutez une valeur cible et une unité de mesure");

    // Achievable
    const achievable = keyResult.targetValue ? keyResult.targetValue > 0 && keyResult.targetValue < 1000000 : false;
    if (achievable) score += 20;
    else recommendations.push("Vérifiez que l'objectif est réaliste et atteignable");

    // Relevant
    const relevant = !!(keyResult.title && keyResult.description);
    if (relevant) score += 20;
    else recommendations.push("Assurez-vous que ce résultat clé est pertinent");

    // Time-bound
    const timeBound = !!(keyResult.deadline && new Date(keyResult.deadline) > new Date());
    if (timeBound) score += 20;
    else recommendations.push("Définissez une échéance claire dans le futur");

    return {
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      score,
      recommendations,
    };
  }

  // Génération de suggestions personnalisées
  public generateSuggestions(category: AmbitionCategory, context: string): string[] {
    const suggestions: string[] = [];

    switch (category) {
      case AmbitionCategory.REVENUE:
        suggestions.push(
          "Considérez diversifier vos sources de revenus",
          "Analysez votre pricing pour optimiser la rentabilité",
          "Identifiez vos clients les plus profitables"
        );
        break;
      
      case AmbitionCategory.GROWTH:
        suggestions.push(
          "Définissez vos métriques de croissance clés",
          "Analysez votre marché cible et la concurrence",
          "Planifiez votre stratégie d'acquisition client"
        );
        break;
      
      case AmbitionCategory.PRODUCT:
        suggestions.push(
          "Recueillez les feedbacks utilisateurs régulièrement",
          "Priorisez les fonctionnalités selon la valeur business",
          "Testez vos hypothèses avec des MVP"
        );
        break;
      
      case AmbitionCategory.TEAM:
        suggestions.push(
          "Définissez clairement les rôles et responsabilités",
          "Investissez dans la formation et le développement",
          "Créez une culture d'entreprise forte"
        );
        break;
      
      default:
        suggestions.push(
          "Décomposez votre ambition en étapes concrètes",
          "Identifiez les ressources nécessaires",
          "Planifiez des points de contrôle réguliers"
        );
    }

    return suggestions;
  }

  // Messages d'encouragement basés sur les progrès
  public getProgressMessage(progressPercentage: number): string {
    if (progressPercentage >= 90) {
      return AI_MESSAGES.PROGRESS_ENCOURAGEMENT[0];
    } else if (progressPercentage >= 70) {
      return AI_MESSAGES.PROGRESS_ENCOURAGEMENT[1];
    } else if (progressPercentage >= 50) {
      return AI_MESSAGES.PROGRESS_ENCOURAGEMENT[2];
    } else if (progressPercentage >= 30) {
      return AI_MESSAGES.PROGRESS_CONCERN[0];
    } else {
      return AI_MESSAGES.PROGRESS_CONCERN[1];
    }
  }

  // Détection de verbes d'action
  private containsActionVerb(text: string): boolean {
    const actionVerbs = [
      'augmenter', 'développer', 'créer', 'lancer', 'améliorer', 'optimiser',
      'atteindre', 'réaliser', 'construire', 'établir', 'générer', 'produire',
      'doubler', 'tripler', 'réduire', 'minimiser', 'maximiser', 'conquérir'
    ];
    
    return actionVerbs.some(verb => text.includes(verb));
  }

  // Détection d'éléments quantifiables
  private containsQuantifiableElement(text: string): boolean {
    const quantifiablePatterns = [
      /\d+/,  // Nombres
      /%/,    // Pourcentages
      /€|dollar|\$/,  // Monnaies
      /million|millier|k€|k\$/,  // Ordres de grandeur
    ];
    
    return quantifiablePatterns.some(pattern => pattern.test(text));
  }

  // Analyse de sentiment (simulation)
  public analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['excellent', 'parfait', 'génial', 'super', 'formidable', 'réussir', 'succès'];
    const negativeWords = ['difficile', 'problème', 'échec', 'impossible', 'dur', 'compliqué'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Génération de questions contextuelles sur la société avec IA
  public async generateCompanyQuestions(user: User): Promise<string[]> {
    try {
      const aiQuestions = await geminiService.generateCompanyQuestions(user.companyProfile);
      return aiQuestions;
    } catch (error) {
      console.warn('Erreur lors de la génération des questions IA:', error);
      // Fallback vers les questions statiques
      return this.getFallbackCompanyQuestions(user);
    }
  }

  // Questions de fallback si l'IA n'est pas disponible
  private getFallbackCompanyQuestions(user: User): string[] {
    const questions: string[] = [];

    if (!user.companyProfile) {
      return [
        "Pouvez-vous me parler de votre entreprise ? Dans quel secteur évoluez-vous ?",
        "Quelle est la taille de votre équipe actuellement ?",
        "À quel stade de développement se trouve votre entreprise ?",
        "Quels sont vos principaux défis business actuels ?",
        "Quel est votre marché cible principal ?"
      ];
    }

    const profile = user.companyProfile;

    // Questions contextuelles basées sur le profil existant
    if (profile.stage === CompanyStage.EARLY_STAGE) {
      questions.push("En tant qu'entreprise en phase de démarrage, quels sont vos objectifs de croissance prioritaires ?");
    }

    if (profile.size === CompanySize.STARTUP) {
      questions.push("Comment envisagez-vous de faire évoluer votre équipe cette année ?");
    }

    if (profile.mainChallenges.length === 0) {
      questions.push("Quels sont les principaux obstacles que vous rencontrez actuellement ?");
    }

    return questions.length > 0 ? questions : [
      "Quels sont vos objectifs de croissance pour les 12 prochains mois ?",
      "Quels obstacles rencontrez-vous le plus fréquemment ?",
      "Comment mesurez-vous actuellement votre succès ?"
    ];
  }

  // Suggestions personnalisées basées sur le profil de l'entreprise
  public getContextualSuggestions(ambition: Partial<Ambition>, companyProfile?: CompanyProfile): string[] {
    const suggestions: string[] = [];

    if (!companyProfile) {
      suggestions.push("💡 Complétez votre profil d'entreprise pour des conseils plus personnalisés");
      return suggestions;
    }

    // Suggestions basées sur la taille de l'entreprise
    if (companyProfile.size === CompanySize.STARTUP && ambition.category === AmbitionCategory.REVENUE) {
      suggestions.push("🚀 Pour une startup, concentrez-vous sur la validation du marché avant l'optimisation des revenus");
    }

    if (companyProfile.size === CompanySize.MEDIUM && ambition.category === AmbitionCategory.TEAM) {
      suggestions.push("👥 À votre taille, pensez à structurer vos processus RH et de management");
    }

    // Suggestions basées sur le secteur
    if (companyProfile.industry.toLowerCase().includes('tech') && ambition.category === AmbitionCategory.PRODUCT) {
      suggestions.push("💻 Dans le secteur tech, intégrez des métriques d'adoption utilisateur dans vos objectifs produit");
    }

    // Suggestions basées sur les défis
    if (companyProfile.mainChallenges.includes('acquisition client') && ambition.category === AmbitionCategory.MARKET) {
      suggestions.push("🎯 Vu vos défis d'acquisition, définissez des objectifs précis sur vos canaux de conversion");
    }

    return suggestions;
  }

  // Validation d'un profil d'entreprise
  public validateCompanyProfile(profile: Partial<CompanyProfile>): AIValidation {
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    if (!profile.name || profile.name.length < 2) {
      suggestions.push("Précisez le nom de votre entreprise");
      confidence -= 20;
    }

    if (!profile.industry || profile.industry.length < 3) {
      suggestions.push("Décrivez votre secteur d'activité");
      confidence -= 25;
    }

    if (!profile.targetMarket || profile.targetMarket.length < 10) {
      suggestions.push("Définissez plus précisément votre marché cible");
      confidence -= 20;
    }

    if (!profile.mainChallenges || profile.mainChallenges.length === 0) {
      suggestions.push("Identifiez vos principaux défis business pour des conseils plus pertinents");
      confidence -= 15;
    }

    if (profile.mainChallenges && profile.mainChallenges.length > 5) {
      warnings.push("Limitez-vous à 3-5 défis principaux pour rester focus");
      confidence -= 10;
    }

    const isValid = confidence >= 70;

    return {
      isValid,
      confidence,
      suggestions,
      warnings,
      category: ValidationCategory.AMBITION, // Réutilisation de la catégorie existante
      validatedAt: new Date(),
    };
  }
}

// Instance singleton
export const aiCoachService = AICoachService.getInstance();
