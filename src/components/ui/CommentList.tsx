import React, { useEffect, useMemo, useState } from 'react';
// import { storageService } from '@/services/storage'; // TODO: Migrer vers Supabase
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { Comment } from '@/types';
import { generateId } from '@/utils';

// Stub temporaire pour éviter les erreurs de build
const storageService = {
  getCommentsFor: (_entityId: string, _entityType: Comment['objectiveType']) => [] as Comment[],
  addComment: (_comment: Comment) => {},
  deleteComment: (_id: string) => {},
};

interface CommentListProps {
  entityId: string;
  entityType: Comment['objectiveType'];
}

export const CommentList: React.FC<CommentListProps> = ({ entityId, entityType }) => {
  const { user } = useAppStore();
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    setItems(storageService.getCommentsFor(entityId, entityType));
  }, [entityId, entityType]);

  const handleAdd = () => {
    if (!text.trim() || !user) return;
    const mentions = Array.from(text.matchAll(/@([A-Za-z0-9._-]+)/g)).map(m => m[1]);
    const newComment: Comment = {
      id: generateId(),
      objectiveId: entityId,
      objectiveType: entityType,
      userId: user.id,
      content: text.trim(),
      mentions,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Comment;
    storageService.addComment(newComment);
    setText('');
    setItems(storageService.getCommentsFor(entityId, entityType));
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
              placeholder="Ajouter un commentaire... (@mention)"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <Button size="sm" onClick={handleAdd}>Envoyer</Button>
          </div>
          {/* Liste */}
          <div className="space-y-2">
            {items.length === 0 && (
              <div className="text-xs text-gray-500">Aucun commentaire</div>
            )}
            {items.map(c => (
              <div key={c.id} className="text-sm bg-gray-50 border rounded-md p-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900 truncate pr-2">{c.userId}</div>
                  <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString('fr-FR')}</div>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

