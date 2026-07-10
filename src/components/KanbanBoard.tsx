/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, FunnelStage } from '../types';
import { getDaysWithoutContact, formatPhoneNumber } from '../utils';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  ChevronsUpDown,
  Move
} from 'lucide-react';

interface KanbanBoardProps {
  clients: Client[];
  onUpdateClientStage: (clientId: string, newStage: FunnelStage) => void;
  onOpenClient: (client: Client) => void;
  onAddClientToStage?: (stage: FunnelStage) => void;
  theme: 'light' | 'dark';
}

export default function KanbanBoard({ 
  clients, 
  onUpdateClientStage, 
  onOpenClient, 
  onAddClientToStage,
  theme 
}: KanbanBoardProps) {
  const columns = Object.values(FunnelStage);
  
  // Track dragging state
  const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
  
  // Track mobile moving state
  const [movingClientId, setMovingClientId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedClientId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedClientId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: FunnelStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedClientId;
    if (id) {
      onUpdateClientStage(id, targetStage);
    }
    setDraggedClientId(null);
  };

  const handleMoveClick = (clientId: string) => {
    if (movingClientId === clientId) {
      setMovingClientId(null);
    } else {
      setMovingClientId(clientId);
    }
  };

  const handleMobileMoveSelect = (clientId: string, stage: FunnelStage) => {
    onUpdateClientStage(clientId, stage);
    setMovingClientId(null);
  };

  // Styles based on theme
  const columnBgClass = theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/70 border-slate-200';
  const cardBgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300';
  const textMutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Description header */}
      <div>
        <h2 className={`text-xl font-black ${headingClass}`}>Funil de Vendas</h2>
        <p className={`text-xs ${textMutedClass}`}>Arraste os cards para atualizar as etapas de atendimento ou use os botões rápidos de movimentação no celular.</p>
      </div>

      {/* Horizontal scrolling Kanban canvas */}
      <div className="flex-1 overflow-x-auto pb-4 -mx-4 px-4 flex gap-4 items-stretch min-h-[calc(100vh-250px)]">
        {columns.map(stage => {
          const stageClients = clients.filter(c => c.funnelStage === stage);
          
          return (
            <div 
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-72 shrink-0 flex flex-col rounded-xl border ${columnBgClass} p-3 transition-colors`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${headingClass} tracking-wide`}>{stage}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {stageClients.length}
                  </span>
                </div>
                {onAddClientToStage && (
                  <button 
                    onClick={() => onAddClientToStage(stage)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title={`Adicionar cliente em ${stage}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column Body - Client Cards */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[calc(100vh-320px)] pr-1">
                {stageClients.length === 0 ? (
                  <div className={`py-8 text-center text-xs border border-dashed rounded-lg ${
                    theme === 'dark' ? 'border-slate-800/80 text-slate-600' : 'border-slate-200 text-slate-400'
                  }`}>
                    Nenhum cliente
                  </div>
                ) : (
                  stageClients.map(client => {
                    const days = getDaysWithoutContact(client);
                    const isUrgent = days >= 15;
                    const isRework = days >= 7 && days < 15;
                    const hasOverdue = client.nextReturn && new Date(client.nextReturn) < new Date();
                    
                    return (
                      <div 
                        key={client.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${cardBgClass} relative group overflow-hidden shadow-xs`}
                      >
                        {/* Status bar overlays */}
                        {hasOverdue && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                        )}
                        {!hasOverdue && isUrgent && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                        )}
                        {!hasOverdue && !isUrgent && isRework && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                        )}

                        <div className="flex flex-col gap-1.5">
                          {/* Name and Quick action */}
                          <div className="flex items-start justify-between gap-1">
                            <h4 
                              onClick={() => onOpenClient(client)}
                              className={`text-xs font-bold ${headingClass} hover:text-sky-500 cursor-pointer transition-colors line-clamp-1 flex-1`}
                            >
                              {client.name}
                            </h4>
                            
                            {/* Mobile move button */}
                            <button 
                              onClick={() => handleMoveClick(client.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
                              title="Mover para outra coluna"
                            >
                              <Move className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Phone */}
                          <span className={`text-[10px] font-mono ${textMutedClass}`}>
                            {formatPhoneNumber(client.phone)}
                          </span>

                          {/* Last interaction preview */}
                          {client.notes && (
                            <p className={`text-[11px] ${textMutedClass} line-clamp-2 italic border-l border-slate-200 dark:border-slate-800 pl-1.5`}>
                              {client.notes}
                            </p>
                          )}

                          {/* Flags and reminders */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {client.nextReturn && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                hasOverdue 
                                  ? 'bg-red-500/10 text-red-500 dark:text-red-400' 
                                  : 'bg-sky-500/10 text-sky-500 dark:text-sky-400'
                              }`}>
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(client.nextReturn).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            
                            {isUrgent && (
                              <span className="text-[9px] font-extrabold tracking-wider bg-rose-500/10 text-rose-500 px-1 py-0.5 rounded uppercase">
                                Urgente
                              </span>
                            )}

                            {isRework && (
                              <span className="text-[9px] font-extrabold tracking-wider bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded uppercase">
                                Retrabalho
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Mobile stage selector dropdown menu */}
                        {movingClientId === client.id && (
                          <div className="absolute inset-0 bg-slate-950/95 z-20 p-2 flex flex-col justify-between overflow-y-auto rounded-lg">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Mover para:</span>
                              <button 
                                onClick={() => setMovingClientId(null)}
                                className="text-[10px] font-semibold text-rose-400 px-1 hover:text-rose-300"
                              >
                                Fechar
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-1 overflow-y-auto max-h-[140px] pr-1">
                              {columns.map(st => (
                                <button 
                                  key={st}
                                  onClick={() => handleMobileMoveSelect(client.id, st)}
                                  className={`text-[9px] font-medium py-1 px-1.5 text-left rounded truncate ${
                                    client.funnelStage === st 
                                      ? 'bg-sky-500 text-white' 
                                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
