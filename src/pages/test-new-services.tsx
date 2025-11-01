import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useCreateTeam, useUserTeams } from '@/hooks/useTeams';
import { useCreateInvitation, useTeamInvitations } from '@/hooks/useInvitations';
import { useCreateUserNotification, useUserNotifications, useUnreadNotificationsCount } from '@/hooks/useUserNotifications';
import { useCreateSharedObjective, useSharedWithUser } from '@/hooks/useSharedObjectives';
import { useCreateQuarterlyObjective, useQuarterlyObjectives } from '@/hooks/useQuarterlyObjectives';
import { TeamRole, InvitationStatus, NotificationType, SharePermission, Quarter, Status } from '@/types';

export default function TestNewServicesPage() {
  const { user } = useAppStore();
  // Utiliser des IDs fixes pour éviter les erreurs d'hydratation
  const [testTeamId, setTestTeamId] = useState('00000000-0000-0000-0000-000000000001');
  const [testObjectiveId, setTestObjectiveId] = useState('00000000-0000-0000-0000-000000000002');
  const [results, setResults] = useState<string[]>([]);

  // Hooks pour les équipes
  const createTeam = useCreateTeam();
  const { data: userTeams } = useUserTeams(user?.id);

  // Hooks pour les invitations
  const createInvitation = useCreateInvitation();
  const { data: teamInvitations } = useTeamInvitations(testTeamId);

  // Hooks pour les notifications
  const createNotification = useCreateUserNotification();
  const { data: userNotifications } = useUserNotifications(user?.id);
  const { data: unreadCount } = useUnreadNotificationsCount(user?.id);

  // Hooks pour les objectifs trimestriels
  const createQuarterlyObjective = useCreateQuarterlyObjective();
  const { data: userObjectives } = useQuarterlyObjectives(user?.id);

  // Hooks pour les partages
  const createShare = useCreateSharedObjective();
  const { data: sharedWithMe } = useSharedWithUser(user?.id);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const testTeams = async () => {
    if (!user) {
      addResult('❌ Erreur: Utilisateur non connecté');
      return null;
    }

    try {
      addResult('🔄 Test de création d\'équipe...');

      const team = await createTeam.mutateAsync({
        name: `Équipe Test ${Date.now()}`,
        description: 'Équipe créée pour tester les invitations',
        ownerId: user.id,
      });

      addResult(`✅ Équipe créée: ${team.id}`);
      addResult(`   Nom: ${team.name}`);
      addResult(`   Owner: ${team.ownerId}`);
      addResult(`   💡 Tu peux maintenant utiliser cet ID pour tester les invitations !`);

      // Mettre à jour l'ID de l'équipe de test
      setTestTeamId(team.id);

      return team.id;
    } catch (error) {
      addResult(`❌ Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      return null;
    }
  };

  const testInvitations = async (teamIdOverride?: string) => {
    if (!user) {
      addResult('❌ Erreur: Utilisateur non connecté');
      return;
    }

    const teamIdToUse = teamIdOverride || testTeamId;

    // Vérifier si on a une vraie équipe
    if (teamIdToUse === '00000000-0000-0000-0000-000000000001') {
      addResult('⚠️ SKIP: Les invitations nécessitent une équipe existante');
      addResult('   👉 Clique d\'abord sur "Créer une Équipe" !');
      return;
    }

    try {
      addResult('🔄 Test des invitations...');

      // Générer un email unique pour éviter les doublons
      const uniqueEmail = `test-${Date.now()}@example.com`;

      const invitation = await createInvitation.mutateAsync({
        teamId: teamIdToUse,
        email: uniqueEmail,
        role: TeamRole.MEMBER,
        invitedBy: user.id,
        token: crypto.randomUUID(),
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      addResult(`✅ Invitation créée: ${invitation.id}`);
      addResult(`   Email: ${invitation.email}`);
      addResult(`   Rôle: ${invitation.role}`);
      addResult(`   Statut: ${invitation.status}`);
    } catch (error) {
      addResult(`❌ Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  };

  const testNotifications = async () => {
    if (!user) {
      addResult('❌ Erreur: Utilisateur non connecté');
      return;
    }

    try {
      addResult('🔄 Test des notifications...');

      const notification = await createNotification.mutateAsync({
        userId: user.id,
        type: NotificationType.TEAM_INVITATION,
        title: 'Test de notification',
        message: 'Ceci est un test de notification',
        isRead: false,
      });

      addResult(`✅ Notification créée: ${notification.id}`);
      addResult(`   Titre: ${notification.title}`);
      addResult(`   Type: ${notification.type}`);
      addResult(`   Lue: ${notification.isRead ? 'Oui' : 'Non'}`);
    } catch (error) {
      addResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const testQuarterlyObjectives = async () => {
    if (!user) {
      addResult('❌ Erreur: Utilisateur non connecté');
      return null;
    }

    try {
      addResult('🔄 Test de création d\'objectif trimestriel...');

      const objective = await createQuarterlyObjective.mutateAsync({
        objective: {
          title: `Objectif Test ${Date.now()}`,
          description: 'Objectif créé pour tester les partages',
          quarter: Quarter.Q1,
          year: 2025,
          status: Status.ACTIVE,
        },
        userId: user.id,
      });

      addResult(`✅ Objectif trimestriel créé: ${objective.id}`);
      addResult(`   Titre: ${objective.title}`);
      addResult(`   Trimestre: ${objective.quarter} ${objective.year}`);
      addResult(`   💡 Tu peux maintenant utiliser cet ID pour tester les partages !`);

      // Mettre à jour l'ID de l'objectif de test
      setTestObjectiveId(objective.id);

      return objective.id;
    } catch (error) {
      addResult(`❌ Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      return null;
    }
  };

  const testSharedObjectives = async (objectiveIdOverride?: string) => {
    if (!user) {
      addResult('❌ Erreur: Utilisateur non connecté');
      return;
    }

    const objectiveIdToUse = objectiveIdOverride || testObjectiveId;

    // Vérifier si on a un vrai objectif
    if (objectiveIdToUse === '00000000-0000-0000-0000-000000000002') {
      addResult('⚠️ SKIP: Les partages nécessitent un objectif trimestriel existant');
      addResult('   👉 Clique d\'abord sur "Créer un Objectif" !');
      return;
    }

    try {
      addResult('🔄 Test des partages d\'objectifs...');

      const share = await createShare.mutateAsync({
        objectiveId: objectiveIdToUse,
        objectiveType: 'quarterly_objective',
        sharedWithUserId: user.id,
        sharedByUserId: user.id,
        permission: SharePermission.VIEW,
      });

      addResult(`✅ Partage créé: ${share.id}`);
      addResult(`   Objectif: ${share.objectiveId}`);
      addResult(`   Permission: ${share.permission}`);
      addResult(`   Partagé avec: ${share.sharedWithUserId}`);
    } catch (error) {
      addResult(`❌ Erreur: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  };

  const testAll = async () => {
    setResults([]);
    addResult('🚀 Début des tests...');

    // Créer une équipe et récupérer son ID
    const newTeamId = await testTeams();

    // Tester les invitations avec l'ID de l'équipe créée
    if (newTeamId) {
      await testInvitations(newTeamId);
    } else {
      await testInvitations();
    }

    await testNotifications();

    // Créer un objectif et récupérer son ID
    const newObjectiveId = await testQuarterlyObjectives();

    // Tester les partages avec l'ID de l'objectif créé
    if (newObjectiveId) {
      await testSharedObjectives(newObjectiveId);
    } else {
      await testSharedObjectives();
    }

    addResult('✅ Tous les tests terminés !');
  };

  return (
    <Layout title="Test des Nouveaux Services" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test des Services: Invitations, Notifications, Partages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => testTeams()} disabled={!user} variant="primary">
                  1️⃣ Créer une Équipe
                </Button>
                <Button onClick={() => testInvitations()} disabled={!user}>
                  2️⃣ Tester Invitations
                </Button>
                <Button onClick={() => testNotifications()} disabled={!user}>
                  3️⃣ Tester Notifications
                </Button>
                <Button onClick={() => testQuarterlyObjectives()} disabled={!user} variant="primary">
                  4️⃣ Créer un Objectif
                </Button>
                <Button onClick={() => testSharedObjectives()} disabled={!user}>
                  5️⃣ Tester Partages
                </Button>
                <Button onClick={() => testAll()} disabled={!user} variant="secondary">
                  🚀 Tout Tester
                </Button>
              </div>

              {!user && (
                <p className="text-red-600">⚠️ Vous devez être connecté pour tester les services</p>
              )}

              {user && testTeamId === '00000000-0000-0000-0000-000000000001' && (
                <p className="text-orange-600">💡 Commence par créer une équipe pour tester les invitations !</p>
              )}

              {user && testObjectiveId === '00000000-0000-0000-0000-000000000002' && (
                <p className="text-orange-600">💡 Crée un objectif trimestriel pour tester les partages !</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Mes équipes:</strong> {userTeams?.length || 0}</p>
                <p><strong>Invitations de l'équipe:</strong> {teamInvitations?.length || 0}</p>
                <p><strong>Notifications:</strong> {userNotifications?.length || 0}</p>
                <p><strong>Notifications non lues:</strong> {unreadCount || 0}</p>
                <p><strong>Mes objectifs trimestriels:</strong> {userObjectives?.length || 0}</p>
                <p><strong>Objectifs partagés avec moi:</strong> {sharedWithMe?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Utilisateur:</strong> {user?.email || 'Non connecté'}</p>
                <p><strong>ID Équipe Test:</strong> {testTeamId.substring(0, 8)}...</p>
                <p><strong>ID Objectif Test:</strong> {testObjectiveId.substring(0, 8)}...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500">Aucun test exécuté. Cliquez sur un bouton pour commencer.</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Données Récupérées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Mes Équipes ({userTeams?.length || 0})</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(userTeams, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Invitations de l'équipe ({teamInvitations?.length || 0})</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(teamInvitations, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mes Notifications ({userNotifications?.length || 0})</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(userNotifications, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Mes Objectifs Trimestriels ({userObjectives?.length || 0})</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(userObjectives, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Objectifs Partagés avec Moi ({sharedWithMe?.length || 0})</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40">
                  {JSON.stringify(sharedWithMe, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

