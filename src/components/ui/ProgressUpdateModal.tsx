import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Save, Calendar } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import type { QuarterlyKeyResult } from '@/types';
import { formatDate } from '@/utils';

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyResult: QuarterlyKeyResult;
  onUpdate: (newCurrent: number, note?: string) => void;
  isLoading?: boolean;
}

export const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  isOpen,
  onClose,
  keyResult,
  onUpdate,
  isLoading = false,
}) => {
  const [newCurrent, setNewCurrent] = useState<number>(keyResult.current);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setNewCurrent(keyResult.current);
      setNote('');
      setError('');
    }
  }, [isOpen, keyResult.current]);

  const currentProgress = keyResult.target > 0 
    ? Math.min((keyResult.current / keyResult.target) * 100, 100) 
    : 0;
  
  const newProgress = keyResult.target > 0 
    ? Math.min((newCurrent / keyResult.target) * 100, 100) 
    : 0;

  const progressDiff = newProgress - currentProgress;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newCurrent < 0) {
      setError('La valeur ne peut pas être négative');
      return;
    }

    onUpdate(newCurrent, note.trim() || undefined);
  };

  const handleQuickAdd = (amount: number) => {
    const newValue = Math.max(0, newCurrent + amount);
    setNewCurrent(newValue);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Mettre à jour la progression</span>
                </CardTitle>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900">{keyResult.title}</p>
                <p className="text-xs text-gray-500 mt-1">{keyResult.description}</p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Progression actuelle */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression actuelle</span>
                    <Badge variant="secondary" size="sm">
                      {currentProgress.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(currentProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{keyResult.current} {keyResult.unit}</span>
                    <span>{keyResult.target} {keyResult.unit}</span>
                  </div>
                </div>

                {/* Nouvelle valeur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouvelle valeur *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={newCurrent}
                      onChange={(e) => setNewCurrent(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                      autoFocus
                    />
                    <span className="text-sm text-gray-600 min-w-fit">{keyResult.unit}</span>
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}

                  {/* Boutons d'ajout rapide */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 w-full">Ajout rapide :</span>
                    {[1, 5, 10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(amount)}
                        disabled={isLoading}
                      >
                        +{amount}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewCurrent(keyResult.target)}
                      disabled={isLoading}
                    >
                      = Cible
                    </Button>
                  </div>
                </div>

                {/* Nouvelle progression */}
                {newCurrent !== keyResult.current && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">Nouvelle progression</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={progressDiff > 0 ? 'success' : progressDiff < 0 ? 'warning' : 'secondary'} 
                          size="sm"
                        >
                          {progressDiff > 0 ? '+' : ''}{progressDiff.toFixed(1)}%
                        </Badge>
                        <Badge variant="info" size="sm">
                          {newProgress.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(newProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-700">
                      <span>{newCurrent} {keyResult.unit}</span>
                      <span>{keyResult.target} {keyResult.unit}</span>
                    </div>
                  </div>
                )}

                {/* Note optionnelle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (optionnel)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ex: Nouvelle campagne lancée, 15 leads générés cette semaine..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Mise à jour du {formatDate(new Date())}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || newCurrent === keyResult.current}
                    isLoading={isLoading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Enregistrer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

