/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, FunnelStage, Label, HistoryEntry } from '../types';
import { 
  formatDateTime, 
  formatPhoneNumber, 
  getDaysWithoutContact, 
  getDaysStuck 
} from '../utils';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Tags, 
  FileText,
  Activity,
  History,
  AlertCircle,
  Edit2
} from 'lucide-react';

interface ClientModalProps {
  client: Client;
  labels: Label[];
  onClose: () => void;
  onUpdateClient: (updatedClient: Client) => void;
  onCreateCustomLabel: (newLabel: Omit<Label, 'id'>) => Label;
  theme: 'light' | 'dark';
}

export default function ClientModal({ 
  client, 
  labels, 
  onClose, 
  onUpdateClient, 
  onCreateCustomLabel,
  theme 
}: ClientModalProps) {
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editPhone, setEditPhone] = useState(client.phone);
  const [editMainNotes, setEditMainNotes] = useState(client.notes);

  // Interaction logger states
  const [newNote, setNewNote] = useState('');
  const [nextReturnVal, setNextReturnVal] = useState(client.nextReturn || '');

  // Custom label states
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6'); // default blue

  // Computations
  const daysWithoutContact = getDaysWithoutContact(client);
  const daysStuck = getDaysStuck(client);

  const hasNoReturnAlert = !client.nextReturn;
  const isReworkAlert = daysWithoutContact > 7 && client.funnelStage !== FunnelStage.VENDA_FECHADA && client.funnelStage !== FunnelStage.PERDIDO;
  const isUrgentAlert = daysStuck > 15 && client.funnelStage !== FunnelStage.VENDA_FECHADA && client.funnelStage !== FunnelStage.PERDIDO;

  // Handles updating basic client information
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Client = {
      ...client,
      name: editName,
      phone: editPhone,
      notes: editMainNotes,
      history: [
        ...client.history,
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'note',
          description: 'Informações de contato e observações principais atualizadas.'
        }
      ]
    };
    onUpdateClient(updated);
    setIsEditing(false);
  };

  // Log a new conversation note and automatically increment the contact counter
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timestamp = new Date().toISOString();
    const updatedHistory: HistoryEntry[] = [
      ...client.history,
      {
        id: `h_${Date.now()}`,
        date: timestamp,
        type: 'contact',
        description: `Conversa/Retrabalho Registrado: "${newNote}"`
      }
    ];

    const updated: Client = {
      ...client,
      contactCount: (client.contactCount || 0) + 1,
      lastContactDate: timestamp,
      history: updatedHistory
    };

    onUpdateClient(updated);
    setNewNote('');
  };

  // Schedule the next return
  const handleSaveReturnDate = () => {
    const timestamp = new Date().toISOString();
    const formattedDate = nextReturnVal ? new Date(nextReturnVal).toLocaleString('pt-BR') : 'Nenhuma';
    
    const updatedHistory: HistoryEntry[] = [
      ...client.history,
      {
        id: `h_${Date.now()}`,
        date: timestamp,
        type: 'return',
        description: `Agendamento de retorno alterado para: ${formattedDate}`
      }
    ];

    const updated: Client = {
      ...client,
      nextReturn: nextReturnVal || null,
      history: updatedHistory
    };

    onUpdateClient(updated);
    alert('Próximo retorno agendado com sucesso!');
  };

  // Change funnel stage and log on the timeline
  const handleChangeStage = (stage: FunnelStage) => {
    if (stage === client.funnelStage) return;

    const timestamp = new Date().toISOString();
    const updatedHistory: HistoryEntry[] = [
      ...client.history,
      {
        id: `h_${Date.now()}`,
        date: timestamp,
        type: 'status',
        description: `Etapa do funil alterada de "${client.funnelStage}" para "${stage}".`
      }
    ];

    const updated: Client = {
      ...client,
      funnelStage: stage,
      stuckSince: timestamp,
      history: updatedHistory
    };

    onUpdateClient(updated);
  };

  // Toggle labels
  const handleToggleLabel = (labelId: string) => {
    const isChecked = client.labels.includes(labelId);
    let newLabels: string[];
    
    if (isChecked) {
      newLabels = client.labels.filter(id => id !== labelId);
    } else {
      newLabels = [...client.labels, labelId];
    }

    const labelName = labels.find(l => l.id === labelId)?.name || '';
    const actionDesc = isChecked ? `Etiqueta "${labelName}" removida.` : `Etiqueta "${labelName}" adicionada.`;

    const updated: Client = {
      ...client,
      labels: newLabels,
      history: [
        ...client.history,
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'label',
          description: actionDesc
        }
      ]
    };

    onUpdateClient(updated);
  };

  // Create a custom WhatsApp label
  const handleCreateLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const newLabel = onCreateCustomLabel({
      name: newLabelName,
      color: newLabelColor,
      textColor: '#ffffff'
    });

    // Automatically tag the client with this brand new label
    const updated: Client = {
      ...client,
      labels: [...client.labels, newLabel.id],
      history: [
        ...client.history,
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'label',
          description: `Criada e adicionada nova etiqueta personalizada: "${newLabelName}"`
        }
      ]
    };

    onUpdateClient(updated);
    setNewLabelName('');
    setShowNewLabelForm(false);
  };

  // Handlers for calling
  const triggerCall = () => {
    window.location.href = `tel:${client.phone}`;
  };

  const triggerWhatsApp = () => {
    const cleaned = client.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${client.name}, tudo bem? Sou o seu corretor e gostaria de dar continuidade ao nosso contato.`);
    window.open(`https://wa.me/55${cleaned}?text=${message}`, '_blank');
  };

  // Styles based on theme
  const cardBgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const timelineBorderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-100';

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl border ${cardBgClass} flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in`}>
        
        {/* Header bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">PÁGINA DO CLIENTE</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 ${textMutedClass}`}>
              Cadastrado em {formatDateTime(client.createdAt)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1 & 2: Main Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Client Identity & Quick Actions */}
            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className={`text-2xl font-black ${headingClass} tracking-tight`}>{client.name}</h2>
                    <p className={`text-sm font-semibold text-sky-500 font-mono mt-0.5`}>{formatPhoneNumber(client.phone)}</p>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sky-500 rounded-lg text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
                
                {/* Main Obs text */}
                <div className={`p-4 rounded-xl border border-dashed ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Observações Principais
                  </h4>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed whitespace-pre-line`}>
                    {client.notes || 'Nenhuma observação registrada.'}
                  </p>
                </div>

                {/* Call & WhatsApp Quick Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={triggerCall}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4" /> Ligar por Telefone
                  </button>
                  <button 
                    onClick={triggerWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" /> Abrir WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              // EDIT FORM MODE
              <form onSubmit={handleSaveInfo} className={`p-4 rounded-xl border ${cardBgClass} space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className={`text-sm font-black ${headingClass}`}>Editar Dados Principais</h3>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-400"
                  >
                    Cancelar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-black uppercase text-slate-500`}>Nome completo:</label>
                    <input 
                      type="text"
                      className={`text-xs p-2 rounded-lg border outline-hidden ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-black uppercase text-slate-500`}>Telefone com DDD:</label>
                    <input 
                      type="text"
                      className={`text-xs p-2 rounded-lg border outline-hidden ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-black uppercase text-slate-500`}>Observações / Perfil de busca:</label>
                  <textarea 
                    rows={4}
                    className={`text-xs p-2 rounded-lg border outline-hidden ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                    value={editMainNotes}
                    onChange={(e) => setEditMainNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="submit"
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}

            {/* 2. Conversa / Registrar Retrabalho (Interaction logs) */}
            <div className={`p-4 rounded-xl border ${cardBgClass} space-y-3`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-black ${headingClass}`}>Registrar Conversa / Retrabalho</h3>
              </div>
              
              <form onSubmit={handleAddNote} className="space-y-2">
                <input 
                  type="text"
                  placeholder="Escreva um resumo rápido da última conversa (ex: Enviou proposta do condomínio..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg border outline-hidden transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                  required
                />
                
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${textMutedClass}`}>
                    Contato realizado: <strong>{client.contactCount || 0}</strong> {client.contactCount === 1 ? 'vez' : 'vezes'}.
                  </span>
                  
                  <button 
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar e Somar Contato
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Linha do Tempo de Alterações */}
            <div className="space-y-3">
              <h3 className={`text-sm font-black ${headingClass} flex items-center gap-1.5`}>
                <History className="w-4 h-4 text-slate-400" /> Histórico de Alterações e Contatos
              </h3>

              <div className={`p-4 rounded-xl border ${cardBgClass} max-h-60 overflow-y-auto space-y-4`}>
                {client.history && client.history.length > 0 ? (
                  <div className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 space-y-4">
                    {client.history.slice().reverse().map(entry => (
                      <div key={entry.id} className="relative group">
                        {/* Bullet point indicator */}
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-sky-500 transition-colors" />
                        
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(entry.date)}</span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {entry.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs py-4 text-center ${textMutedClass}`}>Nenhuma alteração registrada.</p>
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 3: Right Sidebar panel (Funnel stage, Alerts, Tags, Schedule Return) */}
          <div className="space-y-6">
            
            {/* 1. Funnel Stage Change Column */}
            <div className={`p-4 rounded-xl border ${cardBgClass} space-y-3`}>
              <h3 className={`text-xs font-black uppercase tracking-wider text-slate-400`}>Status do Funil</h3>
              
              <div className="space-y-1.5">
                {Object.values(FunnelStage).map(st => {
                  const isActive = client.funnelStage === st;
                  return (
                    <button 
                      key={st}
                      type="button"
                      onClick={() => handleChangeStage(st)}
                      className={`w-full text-left text-xs font-semibold py-1.5 px-3 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? 'bg-sky-500 border-sky-600 text-white font-bold' 
                          : theme === 'dark'
                            ? 'border-slate-800 text-slate-300 hover:bg-slate-800/60'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{st}</span>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Intelligent alerts Diagnostic Box */}
            {(hasNoReturnAlert || isReworkAlert || isUrgentAlert) && (
              <div className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-amber-950/15 border-amber-900/40 text-amber-200' : 'bg-amber-50/50 border-amber-200 text-amber-900'
              } space-y-3`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Inteligência Merlin
                </h3>
                
                <div className="space-y-2.5 text-xs">
                  {/* Alert no return scheduled */}
                  {hasNoReturnAlert && (
                    <div className="flex gap-2">
                      <span className="text-amber-500 shrink-0">⚠️</span>
                      <p><strong>Sem retorno agendado:</strong> Defina uma data de atendimento abaixo para o Merlin te lembrar.</p>
                    </div>
                  )}

                  {/* Alert suggest rework */}
                  {isReworkAlert && (
                    <div className="flex gap-2">
                      <span className="text-amber-500 shrink-0">🔄</span>
                      <p><strong>Sugerir Retrabalho:</strong> Cliente sem contato há <strong>{daysWithoutContact} dias</strong>. Mande uma mensagem agora.</p>
                    </div>
                  )}

                  {/* Alert urgent stuck */}
                  {isUrgentAlert && (
                    <div className="flex gap-2">
                      <span className="text-rose-500 shrink-0">🚨</span>
                      <p className="text-rose-900 dark:text-rose-300"><strong>Urgente Parado:</strong> Parado na etapa <em>{client.funnelStage}</em> há <strong>{daysStuck} dias</strong>. Tente mudar de estratégia.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Schedule next return */}
            <div className={`p-4 rounded-xl border ${cardBgClass} space-y-3`}>
              <h3 className={`text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5`}>
                <Calendar className="w-3.5 h-3.5" /> Agendar Próximo Retorno
              </h3>

              <div className="space-y-2">
                <input 
                  type="datetime-local"
                  value={nextReturnVal}
                  onChange={(e) => setNextReturnVal(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border outline-hidden ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button 
                  type="button"
                  onClick={handleSaveReturnDate}
                  className="w-full text-center py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Salvar Data de Retorno
                </button>
              </div>
            </div>

            {/* 4. Sistema de etiquetas (colored badges WhatsApp-like) */}
            <div className={`p-4 rounded-xl border ${cardBgClass} space-y-3`}>
              <h3 className={`text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5`}>
                <Tags className="w-3.5 h-3.5" /> Etiquetas do Cliente
              </h3>

              {/* Tag Selection grid */}
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {labels.map(lbl => {
                  const isChecked = client.labels.includes(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => handleToggleLabel(lbl.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-full border transition-all flex items-center gap-1"
                      style={{
                        backgroundColor: isChecked ? lbl.color : 'transparent',
                        borderColor: isChecked ? lbl.color : theme === 'dark' ? '#334155' : '#e2e8f0',
                        color: isChecked ? '#ffffff' : theme === 'dark' ? '#94a3b8' : '#475569'
                      }}
                    >
                      {lbl.name}
                      {isChecked && <span className="text-[8px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Button to show custom tag form */}
              {!showNewLabelForm ? (
                <button 
                  onClick={() => setShowNewLabelForm(true)}
                  className="text-[10px] font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1 mt-2 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Criar etiqueta personalizada
                </button>
              ) : (
                <form onSubmit={handleCreateLabel} className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="text"
                      placeholder="Nome da etiqueta"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className={`text-[10px] p-1.5 rounded-md border outline-hidden ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-semibold text-slate-400">Cor:</span>
                      <input 
                        type="color"
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-slate-300 shrink-0"
                      />
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setShowNewLabelForm(false)}
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-500 px-1.5 py-1"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="text-[9px] font-bold bg-sky-500 text-white rounded px-2 py-1"
                      >
                        Criar
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
