import React, { useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { ActionStatus, Priority, type Action } from '@/types';
import { formatRelativeDate } from '@/utils';
import { AlarmClock, CheckCircle2, Flame } from 'lucide-react';
import { showNudge, scheduleNudge } from '@/services/nudges';
import { addDays, isAfter } from 'date-fns';

function priorityWeight(p: Priority): number {
  return p === Priority.CRITICAL ? 4 : p === Priority.HIGH ? 3 : p === Priority.MEDIUM ? 2 : 1;
}

export default function FocusPage() {
  const { actions, updateAction } = useAppStore();
  const [scheduledId, setScheduledId] = useState<number | null>(null);

  const candidates = useMemo(() => {
    const list = (actions || []).filter(a => a.status !== ActionStatus.DONE);
    const scored = list.map(a => {
      const p = priorityWeight(a.priority);
      const deadlineScore = a.deadline ? (isAfter(new Date(), new Date(a.deadline)) ? 2 : 1) : 0;
      const score = p * 2 + deadlineScore; // simple
      return { a, score };
    });
    return scored.sort((x, y) => y.score - x.score).slice(0, 3).map(s => s.a);
  }, [actions]);

  const commitAction = (a: Action) => {
    updateAction(a.id, { status: ActionStatus.IN_PROGRESS, updatedAt: new Date(), labels: [...a.labels, 'focus'] });
    showNudge({ title: 'Focus activé', body: `Engagé sur: ${a.title}`, tag: 'focus-start' });
    // petit rappel dans 45 min
    const id = scheduleNudge(45 * 60 * 1000, { title: 'Toujours focus ?', body: `Où en es-tu: ${a.title} ?`, tag: 'focus-reminder' });
    if (id) setScheduledId(id);
  };

  const completeAction = (a: Action) => {
    updateAction(a.id, { status: ActionStatus.DONE, updatedAt: new Date(), completedAt: new Date(), labels: a.labels.filter(l => l !== 'focus') });
    showNudge({ title: 'Bravo 🎉', body: `Action terminée: ${a.title}`, tag: 'focus-done' });
  };

  const postponeToTomorrow = (a: Action) => {
    const newDeadline = a.deadline ? addDays(new Date(a.deadline), 1) : addDays(new Date(), 1);
    updateAction(a.id, { deadline: newDeadline, updatedAt: new Date(), labels: a.labels.filter(l => l !== 'focus') });
  };

  return (
    <Layout title="Focus du jour" requireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-6">
            <AlarmClock className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Focus du jour</h1>
          </div>

          {candidates.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-gray-600">Aucune action prioritaire trouvée. Passez par la gestion pour en créer ou ajuster les priorités.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {candidates.map((a) => (
                <Card key={a.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" size="sm">{a.priority}</Badge>
                        {a.deadline && (
                          <span className="text-sm text-gray-500">échéance {formatRelativeDate(a.deadline)}</span>
                        )}
                      </div>
                      <Flame className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => commitAction(a)} leftIcon={<Flame className="h-4 w-4" />}>Je m'engage</Button>
                      <Button variant="ghost" onClick={() => completeAction(a)} leftIcon={<CheckCircle2 className="h-4 w-4" />}>Terminer</Button>
                      <Button variant="outline" onClick={() => postponeToTomorrow(a)}>Demain</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

