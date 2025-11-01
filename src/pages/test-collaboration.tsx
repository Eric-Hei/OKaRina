import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  TeamsService,
  TeamMembersService,
  InvitationsService,
  SharedObjectivesService,
  CommentsService,
  NotificationsService,
} from '@/services/db';
import { TeamRole, InvitationStatus, NotificationType } from '@/types';

export default function TestCollaboration() {
  const { user } = useAppStore();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);

  const handleTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName);
    setResult('⏳ Chargement...');
    try {
      const res = await testFn();
      setResult(`✅ ${testName} réussi:\n${JSON.stringify(res, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ ${testName} échoué:\n${error?.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Collaboration Services</h1>
          <p className="text-red-600">❌ Vous devez être connecté pour tester les services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Collaboration Services</h1>
        <p className="text-gray-600 mb-6">
          Utilisateur: <strong>{user.email}</strong> (ID: {user.id})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Teams */}
          <button
            onClick={() =>
              handleTest('Créer une équipe', async () => {
                return await TeamsService.create({
                  name: 'Équipe Test',
                  description: 'Une équipe de test créée depuis la page de test',
                });
              })
            }
            disabled={loading !== null}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Créer une équipe' ? '⏳' : '👥'} Créer une équipe
          </button>

          <button
            onClick={() =>
              handleTest('Lister mes équipes', async () => {
                return await TeamsService.getByOwnerId(user.id);
              })
            }
            disabled={loading !== null}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Lister mes équipes' ? '⏳' : '📋'} Lister mes équipes
          </button>

          {/* Team Members */}
          <button
            onClick={() =>
              handleTest('Ajouter un membre', async () => {
                const teams = await TeamsService.getByOwnerId(user.id);
                if (teams.length === 0) throw new Error('Aucune équipe trouvée. Créez d\'abord une équipe.');
                return await TeamMembersService.add({
                  teamId: teams[0].id,
                  userId: user.id,
                  role: TeamRole.OWNER,
                });
              })
            }
            disabled={loading !== null}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Ajouter un membre' ? '⏳' : '➕'} Ajouter un membre
          </button>

          <button
            onClick={() =>
              handleTest('Lister les membres', async () => {
                const teams = await TeamsService.getByOwnerId(user.id);
                if (teams.length === 0) throw new Error('Aucune équipe trouvée.');
                return await TeamMembersService.getByTeamId(teams[0].id);
              })
            }
            disabled={loading !== null}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Lister les membres' ? '⏳' : '📋'} Lister les membres
          </button>

          {/* Invitations */}
          <button
            onClick={() =>
              handleTest('Créer une invitation', async () => {
                const teams = await TeamsService.getByOwnerId(user.id);
                if (teams.length === 0) throw new Error('Aucune équipe trouvée.');
                return await InvitationsService.create({
                  teamId: teams[0].id,
                  email: 'test@example.com',
                  role: TeamRole.MEMBER,
                  invitedBy: user.id,
                  token: crypto.randomUUID(),
                  status: InvitationStatus.PENDING,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                });
              })
            }
            disabled={loading !== null}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Créer une invitation' ? '⏳' : '✉️'} Créer une invitation
          </button>

          <button
            onClick={() =>
              handleTest('Lister les invitations', async () => {
                const teams = await TeamsService.getByOwnerId(user.id);
                if (teams.length === 0) throw new Error('Aucune équipe trouvée.');
                return await InvitationsService.getByTeamId(teams[0].id);
              })
            }
            disabled={loading !== null}
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Lister les invitations' ? '⏳' : '📋'} Lister les invitations
          </button>

          {/* Comments */}
          <button
            onClick={() =>
              handleTest('Créer un commentaire', async () => {
                return await CommentsService.create(
                  {
                    objectiveId: crypto.randomUUID(),
                    objectiveType: 'ambition',
                    content: 'Ceci est un commentaire de test',
                    mentions: [],
                  },
                  user.id
                );
              })
            }
            disabled={loading !== null}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Créer un commentaire' ? '⏳' : '💬'} Créer un commentaire
          </button>

          <button
            onClick={() =>
              handleTest('Lister mes commentaires', async () => {
                return await CommentsService.getByUserId(user.id);
              })
            }
            disabled={loading !== null}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Lister mes commentaires' ? '⏳' : '📋'} Lister mes commentaires
          </button>

          {/* Notifications */}
          <button
            onClick={() =>
              handleTest('Créer une notification', async () => {
                return await NotificationsService.create({
                  userId: user.id,
                  type: NotificationType.TEAM_INVITATION,
                  title: 'Nouvelle invitation',
                  message: 'Vous avez été invité à rejoindre une équipe',
                  isRead: false,
                });
              })
            }
            disabled={loading !== null}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Créer une notification' ? '⏳' : '🔔'} Créer une notification
          </button>

          <button
            onClick={() =>
              handleTest('Lister mes notifications', async () => {
                return await NotificationsService.getByUserId(user.id);
              })
            }
            disabled={loading !== null}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Lister mes notifications' ? '⏳' : '📋'} Lister mes notifications
          </button>

          <button
            onClick={() =>
              handleTest('Compter notifications non lues', async () => {
                const count = await NotificationsService.getUnreadCount(user.id);
                return { unreadCount: count };
              })
            }
            disabled={loading !== null}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading === 'Compter notifications non lues' ? '⏳' : '🔢'} Compter non lues
          </button>
        </div>

        {/* Résultat */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Résultat</h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
            {result || 'Cliquez sur un bouton pour tester un service...'}
          </pre>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            💡 <strong>Astuce:</strong> Ouvrez la console du navigateur (F12) et l'onglet Network pour voir les
            requêtes Supabase en temps réel.
          </p>
        </div>
      </div>
    </div>
  );
}

