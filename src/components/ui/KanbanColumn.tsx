import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  headerColor: string;
  count: number;
  children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  headerColor,
  count,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* En-tête de colonne */}
      <div className={`${color} border-2 rounded-t-lg p-4 ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${headerColor}`}>
            {title}
          </h3>
          <span className={`text-sm font-medium ${headerColor} bg-white bg-opacity-50 px-2 py-1 rounded-full`}>
            {count}
          </span>
        </div>
      </div>

      {/* Zone de drop */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 ${color} border-l-2 border-r-2 border-b-2 rounded-b-lg p-4 
          min-h-[400px] overflow-y-auto
          ${isOver ? 'ring-2 ring-blue-400 bg-opacity-75' : ''}
          transition-all duration-200
        `}
      >
        {children}
      </div>
    </motion.div>
  );
};
