/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Client, Label, FunnelStage } from '../types';
import { formatPhoneNumber, formatDate, getDaysWithoutContact } from '../utils';
import { 
  Search, 
  Filter, 
  Trash2, 
  ChevronRight, 
  Phone, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  CheckCircle,
  Tag,
  ArrowUpDown
} from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  labels: Label[];
  onOpenClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onAddClient: () => void;
  theme: 'light' | 'dark';
}

type SortField = 'name' | 'createdAt' | 'lastContact' | 'stage';
type SortOrder = 'asc' | 'desc';

export default function ClientList({ 
  clients, 
  labels, 
  onOpenClient, 
  onDeleteClient, 
  onAddClient,
  theme 
}: ClientListProps) {
  
  // State variables for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Handle fast search and filter logic
  const filteredAndSortedClients = useMemo(() => {
    return clients
      .filter(c => {
        // 1. Search term (Name, Phone, or specific Labels matching name)
        const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = c.phone.includes(searchTerm);
        
        // Find if search matches any labels this client has
        const clientLabels = c.labels.map(id => labels.find(l => l.id === id)?.name.toLowerCase() || '');
        const labelSearchMatch = clientLabels.some(lName => lName.includes(searchTerm.toLowerCase()));

        const matchesSearch = nameMatch || phoneMatch || labelSearchMatch;

        // 2. Stage filter
        const matchesStage = selectedStage === 'all' || c.funnelStage === selectedStage;

        // 3. Label filter
        const matchesLabel = selectedLabelId === 'all' || c.labels.includes(selectedLabelId);

        return matchesSearch && matchesStage && matchesLabel;
      })
      .sort((a, b) => {
        // 4. Sort logic
        let compareValue = 0;
        
        if (sortField === 'name') {
          compareValue = a.name.localeCompare(b.name);
        } else if (sortField === 'createdAt') {
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortField === 'lastContact') {
          const aTime = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
          const bTime = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
          compareValue = aTime - bTime;
        } else if (sortField === 'stage') {
          compareValue = a.funnelStage.localeCompare(b.funnelStage);
        }

        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
  }, [clients, labels, searchTerm, selectedStage, selectedLabelId, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to desc for date/stage, asc for text if wanted, but keep it simple
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('all');
    setSelectedLabelId('all');
  };

  // Styles
  const cardBgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const tableBorderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-100';

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header bar */}
      <div className={`p-4 rounded-xl border ${cardBgClass} space-y-4`}>
        {/* Search Input and Add button */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text"
              placeholder="Pesquisar por nome, telefone ou etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full text-xs p-2.5 pl-10 rounded-lg border outline-hidden transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
              }`}
            />
          </div>

          <button 
            onClick={onAddClient}
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Cliente
          </button>
        </div>

        {/* Filter dropdowns and clear action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Stage filter */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black uppercase text-slate-400`}>Funil:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className={`text-[11px] font-semibold p-1.5 rounded-md border outline-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">Todas as etapas</option>
                {Object.values(FunnelStage).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Label filter */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black uppercase text-slate-400`}>Etiqueta:</span>
              <select
                value={selectedLabelId}
                onChange={(e) => setSelectedLabelId(e.target.value)}
                className={`text-[11px] font-semibold p-1.5 rounded-md border outline-hidden ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="all">Todas as etiquetas</option>
                {labels.map(lbl => (
                  <option key={lbl.id} value={lbl.id}>{lbl.name}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedStage !== 'all' || selectedLabelId !== 'all') && (
            <button 
              onClick={clearFilters}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Sorting bar (desktop layout table, mobile card-based sorting triggers) */}
      <div className={`p-4 rounded-xl border ${cardBgClass} overflow-hidden`}>
        {/* Desktop Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${tableBorderClass}`}>
                <th 
                  onClick={() => toggleSort('name')}
                  className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} cursor-pointer hover:text-sky-500 select-none`}
                >
                  <div className="flex items-center gap-1">
                    Nome / Telefone
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('stage')}
                  className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} cursor-pointer hover:text-sky-500 select-none`}
                >
                  <div className="flex items-center gap-1">
                    Etapa do Funil
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass}`}>Etiquetas</th>
                <th 
                  onClick={() => toggleSort('lastContact')}
                  className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} cursor-pointer hover:text-sky-500 select-none`}
                >
                  <div className="flex items-center gap-1">
                    Último Contato
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('createdAt')}
                  className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} cursor-pointer hover:text-sky-500 select-none`}
                >
                  <div className="flex items-center gap-1">
                    Data de Cadastro
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} text-center w-24`}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredAndSortedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center text-xs ${textMutedClass}`}>
                    Nenhum cliente corresponde aos critérios de pesquisa.
                  </td>
                </tr>
              ) : (
                filteredAndSortedClients.map(client => {
                  const daysWithoutContact = getDaysWithoutContact(client);
                  
                  return (
                    <tr 
                      key={client.id} 
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 cursor-pointer transition-colors group"
                      onClick={() => onOpenClient(client)}
                    >
                      {/* Name */}
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${headingClass} group-hover:text-sky-500 transition-colors`}>{client.name}</span>
                          <span className={`text-[10px] font-mono font-semibold ${textMutedClass}`}>{formatPhoneNumber(client.phone)}</span>
                        </div>
                      </td>

                      {/* Funnel Stage */}
                      <td className="py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          client.funnelStage === FunnelStage.VENDA_FECHADA 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : client.funnelStage === FunnelStage.PERDIDO 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                              : 'bg-sky-500/10 border-sky-500/20 text-sky-500'
                        }`}>
                          {client.funnelStage}
                        </span>
                      </td>

                      {/* Labels tags list */}
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {client.labels && client.labels.length > 0 ? (
                            client.labels.slice(0, 3).map(id => {
                              const lbl = labels.find(l => l.id === id);
                              if (!lbl) return null;
                              return (
                                <span 
                                  key={lbl.id}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: lbl.color }}
                                >
                                  {lbl.name}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem etiquetas</span>
                          )}
                          {client.labels && client.labels.length > 3 && (
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 ${textMutedClass}`}>
                              +{client.labels.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Contact */}
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className={`text-xs font-semibold ${headingClass}`}>
                            {daysWithoutContact === 0 ? 'Hoje' : `${daysWithoutContact} ${daysWithoutContact === 1 ? 'dia' : 'dias'} atrás`}
                          </span>
                          <span className={`text-[10px] ${textMutedClass}`}>
                            Contatos: {client.contactCount || 0}
                          </span>
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 text-xs text-slate-500">
                        {formatDate(client.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              if (confirm(`Remover cliente ${client.name}? Todos os registros serão deletados.`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Remover Cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className={`w-4 h-4 ${textMutedClass}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Grid */}
        <div className="md:hidden space-y-3">
          {filteredAndSortedClients.length === 0 ? (
            <p className={`py-12 text-center text-xs ${textMutedClass}`}>
              Nenhum cliente corresponde aos critérios de pesquisa.
            </p>
          ) : (
            filteredAndSortedClients.map(client => {
              const days = getDaysWithoutContact(client);
              const hasOverdue = client.nextReturn && new Date(client.nextReturn) < new Date();
              
              return (
                <div 
                  key={client.id}
                  onClick={() => onOpenClient(client)}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                  } relative overflow-hidden`}
                >
                  {/* Left priority line */}
                  {hasOverdue && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-xs font-bold ${headingClass}`}>{client.name}</h4>
                      <p className={`text-[10px] font-mono font-semibold mt-0.5 ${textMutedClass}`}>{formatPhoneNumber(client.phone)}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-sky-500/10 text-sky-500 rounded-full shrink-0">
                      {client.funnelStage}
                    </span>
                  </div>

                  {/* Labels tags layout */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {client.labels && client.labels.map(id => {
                      const lbl = labels.find(l => l.id === id);
                      if (!lbl) return null;
                      return (
                        <span 
                          key={lbl.id}
                          className="text-[8px] font-black px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: lbl.color }}
                        >
                          {lbl.name}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Sem contato: <strong>{days} {days === 1 ? 'dia' : 'dias'}</strong></span>
                    <span>Lançado em {formatDate(client.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
