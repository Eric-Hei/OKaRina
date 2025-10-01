import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AISuggestion {
  title: string;
  description: string;
  details?: string;
}

interface AISuggestionsPanelProps {
  suggestions: string[];
  className?: string;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ 
  suggestions, 
  className = '' 
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Parser les suggestions pour extraire titre et description
  const parsedSuggestions: AISuggestion[] = suggestions.map((suggestion) => {
    // Enlever le préfixe 🤖 si présent
    const cleanSuggestion = suggestion.replace(/^🤖\s*/, '');
    
    // Format attendu : "Titre : Description"
    const match = cleanSuggestion.match(/^(.+?)\s*:\s*(.+)$/);
    
    if (match) {
      return {
        title: match[1].trim(),
        description: match[2].trim(),
      };
    }
    
    // Si pas de format structuré, utiliser la suggestion complète comme description
    return {
      title: `Conseil ${suggestions.indexOf(suggestion) + 1}`,
      description: cleanSuggestion,
    };
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-900 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          Conseils de l'IA Coach
          <span className="ml-2 text-xs font-normal text-blue-600">
            ({parsedSuggestions.length} conseil{parsedSuggestions.length > 1 ? 's' : ''})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {parsedSuggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-blue-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* En-tête du conseil (toujours visible) */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start flex-1 mr-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mt-0.5">
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                      {suggestion.title}
                    </h4>
                    {/* Aperçu de la description (tronquée) */}
                    {expandedIndex !== index && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {suggestion.description.substring(0, 100)}
                        {suggestion.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Contenu détaillé (dépliable) */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-blue-100 bg-blue-50/50">
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                      {suggestion.details && (
                        <div className="mt-3 pl-6">
                          <p className="text-xs text-gray-600 italic">
                            {suggestion.details}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISuggestionsPanel;

