import React, { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateExternalContact } from '@/hooks/useExternalContacts';
import type { ExternalContactFormData } from '@/types';

interface ExternalContactQuickAddProps {
    companyId: string;
    userId: string;
    onContactCreated?: (contactId: string) => void;
    onCancel?: () => void;
}

/**
 * Composant pour ajouter rapidement un contact externe (inline)
 */
export const ExternalContactQuickAdd: React.FC<ExternalContactQuickAddProps> = ({
    companyId,
    userId,
    onContactCreated,
    onCancel,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<ExternalContactFormData>({
        firstName: '',
        lastName: '',
        email: '',
    });

    const createContactMutation = useCreateExternalContact();

    const handleAdd = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            return;
        }

        try {
            const newContact = await createContactMutation.mutateAsync({
                contact: formData,
                companyId,
                userId,
            });

            // Réinitialiser le formulaire
            setFormData({ firstName: '', lastName: '', email: '' });
            setIsAdding(false);

            // Notifier le parent
            if (onContactCreated) {
                onContactCreated(newContact.id);
            }
        } catch (error) {
            console.error('Erreur création contact:', error);
            // L'erreur sera affichée via la mutation
        }
    };

    const handleCancel = () => {
        setFormData({ firstName: '', lastName: '', email: '' });
        setIsAdding(false);
        if (onCancel) {
            onCancel();
        }
    };

    if (!isAdding) {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsAdding(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors w-full"
            >
                <Plus className="w-4 h-4" />
                <span>Ajouter un nouveau contact</span>
            </button>
        );
    }

    return (
        <div className="p-3 bg-gray-50 rounded-md space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <Input
                    type="text"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                />
                <Input
                    type="text"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                />
            </div>
            <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                    }
                }}
            />

            {createContactMutation.isError && (
                <p className="text-sm text-red-600">
                    {createContactMutation.error instanceof Error
                        ? createContactMutation.error.message
                        : 'Erreur lors de la création'}
                </p>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd();
                    }}
                    disabled={createContactMutation.isPending}
                    leftIcon={<Check className="w-4 h-4" />}
                >
                    {createContactMutation.isPending ? 'Création...' : 'Ajouter'}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancel();
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                >
                    Annuler
                </Button>
            </div>
        </div>
    );
};
