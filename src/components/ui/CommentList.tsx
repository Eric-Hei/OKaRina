import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { useEntityComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import type { Comment } from '@/types';
import { Loader2, Trash2 } from 'lucide-react';

interface CommentListProps {
  entityId: string;
  entityType: Comment['objectiveType'];
}

export const CommentList: React.FC<CommentListProps> = ({ entityId, entityType }) => {
  const { user } = useAppStore();
  const [text, setText] = useState('');

  // Hooks React Query
  const { data: comments = [], isLoading } = useEntityComments(entityId, entityType);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleAdd = async () => {
    if (!text.trim() || !user) return;

    try {
      const mentions = Array.from(text.matchAll(/@([A-Za-z0-9._-]+)/g)).map(m => m[1]);

      await createComment.mutateAsync({
        comment: {
          objectiveId: entityId,
          objectiveType: entityType,
          content: text.trim(),
          mentions,
        },
        userId: user.id,
      });

      setText('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      await deleteComment.mutateAsync(commentId);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  return (
    <div className="mt-2">
      <Card>
        <CardContent className="space-y-3 p-3">
          {/* Form */}
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Ajouter un commentaire... (@mention)"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={createComment.isPending}
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!text.trim() || createComment.isPending}
              isLoading={createComment.isPending}
            >
              Envoyer
            </Button>
          </div>

          {/* Liste */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Chargement...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-2">Aucun commentaire</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="text-sm bg-gray-50 border rounded-md p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900 truncate pr-2">{c.userId}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('fr-FR')}</div>
                      {user?.id === c.userId && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap mt-1">{c.content}</div>
                  {c.mentions && c.mentions.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {c.mentions.map(m => (
                        <Badge key={m} variant="secondary" size="sm">@{m}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

