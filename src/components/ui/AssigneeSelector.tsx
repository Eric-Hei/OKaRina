import React, { useState, useMemo } from 'react';
import { Search, User, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ExternalContactQuickAdd } from '@/components/ui/ExternalContactQuickAdd';
import { useExternalContacts } from '@/hooks/useExternalContacts';
import { useAppStore } from '@/store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { ActionAssigneeFormData } from '@/types';

interface AssigneeSelectorProps {
    value: ActionAssigneeFormData[];
    onChange: (assignees: ActionAssigneeFormData[]) => void;
    className?: string;
}

type TabType = 'internal' | 'external';

interface CompanyMember {
    userId: string;
    userName: string | null;
    userEmail: string;
}

export const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
    value,
    onChange,
    className = '',
}) => {
    const { user } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('internal');
    const [searchQuery, setSearchQuery] = useState('');

    // Récupérer tous les membres de la company via profiles
    const { data: companyMembers = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['companyMembers', user?.company],
        queryFn: async () => {
            if (!user?.company) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email')
                .eq('company', user.company);

            if (error) throw error;

            return (data || []).map((profile: any) => ({
                userId: profile.id,
                userName: profile.name,
                userEmail: profile.email,
            })) as CompanyMember[];
        },
        enabled: !!user?.company,
    });

    const { data: externalContacts = [], isLoading: loadingContacts } = useExternalContacts(user?.company);

    const filteredTeamMembers = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        return companyMembers.filter(member =>
            member.userName?.toLowerCase().includes(query) ||
            member.userEmail?.toLowerCase().includes(query)
        );
    }, [companyMembers, searchQuery]);

    const filteredExternalContacts = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        return externalContacts.filter(contact =>
            contact.firstName.toLowerCase().includes(query) ||
            contact.lastName.toLowerCase().includes(query) ||
            contact.email.toLowerCase().includes(query)
        );
    }, [externalContacts, searchQuery]);

    const isUserSelected = (userId: string) => {
        return value.some(a => a.type === 'internal' && a.userId === userId);
    };

    const isContactSelected = (contactId: string) => {
        return value.some(a => a.type === 'external' && a.externalContactId === contactId);
    };

    const toggleUser = (userId: string) => {
        if (isUserSelected(userId)) {
            onChange(value.filter(a => !(a.type === 'internal' && a.userId === userId)));
        } else {
            onChange([...value, { type: 'internal', userId }]);
            setSearchQuery(''); // Réinitialiser la recherche après sélection
        }
    };

    const toggleContact = (contactId: string) => {
        if (isContactSelected(contactId)) {
            onChange(value.filter(a => !(a.type === 'external' && a.externalContactId === contactId)));
        } else {
            onChange([...value, { type: 'external', externalContactId: contactId }]);
            setSearchQuery(''); // Réinitialiser la recherche après sélection
        }
    };

    const handleContactCreated = (contactId: string) => {
        onChange([...value, { type: 'external', externalContactId: contactId }]);
        setSearchQuery('');
    };

    // Récupérer les infos des assignés sélectionnés
    const selectedMembers = value
        .filter(a => a.type === 'internal')
        .map(a => companyMembers.find(m => m.userId === a.userId))
        .filter(Boolean) as CompanyMember[];

    const selectedContacts = value
        .filter(a => a.type === 'external')
        .map(a => externalContacts.find(c => c.id === a.externalContactId))
        .filter((contact): contact is NonNullable<typeof contact> => contact !== undefined);

    return (
        <div className={`border border-gray-200 rounded-lg ${className}`}>
            <div className="flex border-b border-gray-200">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('internal');
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'internal'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Équipe</span>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTab('external');
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'external'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Externes</span>
                    </div>
                </button>
            </div>

            <div className="p-3 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder={activeTab === 'internal' ? 'Rechercher un membre...' : 'Rechercher un contact...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Sélections actuelles */}
            {(selectedMembers.length > 0 || selectedContacts.length > 0) && (
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="text-xs font-medium text-gray-500 mb-2">Sélectionnés :</div>
                    <div className="flex flex-wrap gap-2">
                        {selectedMembers.map((member) => (
                            <div
                                key={member.userId}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                            >
                                <span>{member.userName || member.userEmail}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleUser(member.userId);
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {selectedContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                            >
                                <span>{contact.firstName} {contact.lastName}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleContact(contact.id);
                                    }}
                                    className="hover:bg-green-200 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-h-64 overflow-y-auto">
                {activeTab === 'internal' && (
                    <div className="p-2">
                        {loadingMembers ? (
                            <div className="text-center py-4 text-sm text-gray-500">Chargement...</div>
                        ) : searchQuery && filteredTeamMembers.length === 0 ? (
                            <div className="text-center py-4 text-sm text-gray-500">Aucun membre trouvé</div>
                        ) : !searchQuery ? (
                            <div className="text-center py-8 text-sm text-gray-400">
                                Tapez pour rechercher un membre...
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredTeamMembers.map((member) => {
                                    const isSelected = isUserSelected(member.userId);
                                    return (
                                        <button
                                            key={member.userId}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleUser(member.userId);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${isSelected
                                                    ? 'bg-blue-50 border border-blue-200'
                                                    : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {member.userName || 'Sans nom'}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {member.userEmail}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="text-blue-600 text-xs">✓</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'external' && (
                    <div className="p-2">
                        {loadingContacts ? (
                            <div className="text-center py-4 text-sm text-gray-500">Chargement...</div>
                        ) : (
                            <div className="space-y-2">
                                {searchQuery && filteredExternalContacts.length > 0 && (
                                    <div className="space-y-1">
                                        {filteredExternalContacts.map((contact) => {
                                            const isSelected = isContactSelected(contact.id);
                                            return (
                                                <button
                                                    key={contact.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleContact(contact.id);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${isSelected
                                                            ? 'bg-green-50 border border-green-200'
                                                            : 'hover:bg-gray-50 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {contact.firstName} {contact.lastName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {contact.email}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="text-green-600 text-xs">✓</div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {user?.id && user?.company && (
                                    <ExternalContactQuickAdd
                                        companyId={user.company}
                                        userId={user.id}
                                        onContactCreated={handleContactCreated}
                                    />
                                )}

                                {!searchQuery && (
                                    <div className="text-center py-8 text-sm text-gray-400">
                                        Tapez pour rechercher un contact...
                                    </div>
                                )}

                                {searchQuery && filteredExternalContacts.length === 0 && (
                                    <div className="text-center py-4 text-sm text-gray-500">
                                        Aucun contact trouvé
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {value.length > 0 && (
                <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-600">
                        {value.length} personne{value.length > 1 ? 's' : ''} sélectionnée{value.length > 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};
