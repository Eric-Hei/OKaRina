import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import { useInvitationByToken, useUpdateInvitationStatus } from '@/hooks/useInvitations';
import { useAddTeamMember } from '@/hooks/useTeamMembers';
import { InvitationStatus, TeamRole } from '@/types';
import { CheckCircle, XCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvitationPage() {
  const router = useRouter();
  const { token } = router.query;
  const { user } = useAppStore();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<'accepted' | 'declined' | null>(null);

  // Hooks
  const { data: invitation, isLoading, error } = useInvitationByToken(token as string);
  const updateStatus = useUpdateInvitationStatus();
  const addMember = useAddTeamMember();

  // Vérifier si l'invitation est expirée
  const isExpired = invitation && new Date(invitation.expiresAt) < new Date();
  const isPending = invitation?.status === InvitationStatus.PENDING;

  const handleAccept = async () => {
    if (!invitation || !user) return;

    setProcessing(true);
    try {
      // 1. Ajouter l'utilisateur comme membre de l'équipe
      await addMember.mutateAsync({
        teamId: invitation.teamId,
        userId: user.id,
        role: invitation.role,
      });

      // 2. Mettre à jour le statut de l'invitation
      await updateStatus.mutateAsync({
        id: invitation.id,
        status: InvitationStatus.ACCEPTED,
      });

      setResult('accepted');
      
      // Rediriger vers la page des équipes après 2 secondes
      setTimeout(() => {
        router.push('/teams');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      alert('Erreur lors de l\'acceptation de l\'invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    if (!window.confirm('Êtes-vous sûr de vouloir refuser cette invitation ?')) return;

    setProcessing(true);
    try {
      await updateStatus.mutateAsync({
        id: invitation.id,
        status: InvitationStatus.DECLINED,
      });

      setResult('declined');

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors du refus de l\'invitation:', error);
      alert('Erreur lors du refus de l\'invitation');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return 'Propriétaire';
      case TeamRole.ADMIN:
        return 'Administrateur';
      case TeamRole.MEMBER:
        return 'Membre';
      case TeamRole.VIEWER:
        return 'Observateur';
    }
  };

  const getRoleDescription = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return 'Contrôle total de l\'équipe';
      case TeamRole.ADMIN:
        return 'Peut gérer l\'équipe et inviter des membres';
      case TeamRole.MEMBER:
        return 'Peut créer et modifier les objectifs';
      case TeamRole.VIEWER:
        return 'Peut consulter les objectifs de l\'équipe';
    }
  };

  // Rediriger vers login si pas connecté
  useEffect(() => {
    if (!user && !isLoading) {
      router.push(`/auth/login?redirect=/invitations/${token}`);
    }
  }, [user, isLoading, router, token]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Chargement de l'invitation...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !invitation) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation introuvable</h2>
                <p className="text-gray-500 mb-6">
                  Cette invitation n'existe pas ou a été supprimée.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Retour au tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isExpired) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation expirée</h2>
                <p className="text-gray-500 mb-6">
                  Cette invitation a expiré le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}.
                  <br />
                  Veuillez contacter l'administrateur de l'équipe pour recevoir une nouvelle invitation.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Retour au tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isPending) {
    const statusIcon = invitation.status === InvitationStatus.ACCEPTED 
      ? <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      : <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />;
    
    const statusText = invitation.status === InvitationStatus.ACCEPTED
      ? 'Invitation déjà acceptée'
      : 'Invitation refusée';

    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                {statusIcon}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusText}</h2>
                <p className="text-gray-500 mb-6">
                  Vous avez déjà répondu à cette invitation.
                </p>
                <Button onClick={() => router.push(invitation.status === InvitationStatus.ACCEPTED ? '/teams' : '/dashboard')}>
                  {invitation.status === InvitationStatus.ACCEPTED ? 'Voir mes équipes' : 'Retour au tableau de bord'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (result === 'accepted') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation acceptée !</h2>
                  <p className="text-gray-500 mb-6">
                    Vous êtes maintenant membre de l'équipe.
                    <br />
                    Redirection vers vos équipes...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (result === 'declined') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation refusée</h2>
                  <p className="text-gray-500 mb-6">
                    Vous avez refusé cette invitation.
                    <br />
                    Redirection vers le tableau de bord...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Invitation à rejoindre une équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    Vous avez été invité(e) à rejoindre une équipe en tant que :
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {getRoleLabel(invitation.role)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {getRoleDescription(invitation.role)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email invité :</span>
                    <span className="font-medium text-gray-900">{invitation.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expire le :</span>
                    <span className="font-medium text-gray-900">
                      {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleAccept}
                    disabled={processing}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter l'invitation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    disabled={processing}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}

