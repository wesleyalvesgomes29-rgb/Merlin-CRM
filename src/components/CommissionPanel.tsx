/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sale, Client } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Plus, 
  Percent, 
  Coins, 
  User, 
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

interface CommissionPanelProps {
  sales: Sale[];
  clients: Client[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onDeleteSale: (saleId: string) => void;
  theme: 'light' | 'dark';
}

export default function CommissionPanel({ 
  sales, 
  clients, 
  onAddSale, 
  onDeleteSale, 
  theme 
}: CommissionPanelProps) {
  
  // State for adding new sale
  const [showForm, setShowForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [manualClientName, setManualClientName] = useState('');
  const [commissionVal, setCommissionVal] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const stats = useMemo(() => {
    const today = new Date();
    const curMonth = today.getMonth();
    const curYear = today.getFullYear();

    // 1. Commission of current Month
    const monthSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === curMonth && d.getFullYear() === curYear;
    });
    const commissionMonth = monthSales.reduce((sum, s) => sum + s.commission, 0);

    // 2. Commission of current Year
    const yearSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === curYear;
    });
    const commissionYear = yearSales.reduce((sum, s) => sum + s.commission, 0);

    // 3. Number of Sales (Total inside the year or total historical - let's do total historical)
    const numSales = sales.length;

    // 4. Ticket Médio (Average commission per sale)
    const ticketMedio = numSales > 0 ? sales.reduce((sum, s) => sum + s.commission, 0) / numSales : 0;

    return {
      commissionMonth,
      commissionYear,
      numSales,
      ticketMedio
    };
  }, [sales]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commissionVal || (selectedClientId === 'manual' && !manualClientName) || (!selectedClientId && !manualClientName)) {
      alert('Por favor preencha todos os campos.');
      return;
    }

    let clientName = '';
    if (selectedClientId && selectedClientId !== 'manual') {
      const c = clients.find(cl => cl.id === selectedClientId);
      clientName = c ? c.name : '';
    } else {
      clientName = manualClientName;
    }

    onAddSale({
      clientId: selectedClientId || 'manual',
      clientName,
      commission: parseFloat(commissionVal),
      date: saleDate
    });

    // Reset Form
    setSelectedClientId('');
    setManualClientName('');
    setCommissionVal('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
  };

  // Styles
  const cardBgClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMutedClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const headingClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const tableBorderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-100';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${headingClass}`}>Controle de Comissões</h2>
          <p className={`text-xs ${textMutedClass}`}>Acompanhe suas vendas, comissões recebidas e ticket médio.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {showForm ? 'Fechar Formulário' : 'Lançar Venda'}
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Grid de Estatísticas de Comissões */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Comissão do Mês */}
        <div className={`p-4 rounded-xl border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMutedClass}`}>Comissão do Mês</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-extrabold text-emerald-500">{formatCurrency(stats.commissionMonth)}</span>
          </div>
        </div>

        {/* Comissão do Ano */}
        <div className={`p-4 rounded-xl border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMutedClass}`}>Comissão do Ano</span>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-extrabold text-green-600">{formatCurrency(stats.commissionYear)}</span>
          </div>
        </div>

        {/* Número de Vendas */}
        <div className={`p-4 rounded-xl border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMutedClass}`}>Total de Vendas</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2.5">
            <span className={`text-xl font-extrabold ${headingClass}`}>{stats.numSales}</span>
          </div>
        </div>

        {/* Ticket Médio de Comissão */}
        <div className={`p-4 rounded-xl border ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMutedClass}`}>Ticket Médio</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-extrabold text-indigo-500">{formatCurrency(stats.ticketMedio)}</span>
          </div>
        </div>
      </div>

      {/* Form to Add New Sale */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`p-4 rounded-xl border ${cardBgClass} space-y-4 max-w-lg animate-fade-in`}>
          <h3 className={`text-sm font-bold ${headingClass}`}>Registrar Nova Venda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Client Select */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-semibold ${headingClass}`}>Vendido para:</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className={`text-xs p-2 rounded-lg border outline-hidden transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-100' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
                required
              >
                <option value="">Selecione o Cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="manual">Outro (Inserir manualmente...)</option>
              </select>
            </div>

            {/* Manual Client Name Input if 'manual' is selected */}
            {(selectedClientId === 'manual' || !selectedClientId) && (
              <div className="flex flex-col gap-1">
                <label className={`text-xs font-semibold ${headingClass}`}>Nome do Cliente:</label>
                <input
                  type="text"
                  placeholder="Nome completo do comprador"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  className={`text-xs p-2 rounded-lg border outline-hidden transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
                  }`}
                  required
                />
              </div>
            )}

            {/* Commission Value */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-semibold ${headingClass}`}>Valor da Comissão (R$):</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 12500"
                value={commissionVal}
                onChange={(e) => setCommissionVal(e.target.value)}
                className={`text-xs p-2 rounded-lg border outline-hidden transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
                }`}
                required
              />
            </div>

            {/* Sale Date */}
            <div className="flex flex-col gap-1">
              <label className={`text-xs font-semibold ${headingClass}`}>Data da Venda:</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className={`text-xs p-2 rounded-lg border outline-hidden transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-sky-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              Lançar Comissão
            </button>
          </div>
        </form>
      )}

      {/* Histórico de Vendas */}
      <div className={`p-4 rounded-xl border ${cardBgClass} overflow-hidden`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold ${headingClass}`}>Histórico de Lançamentos</h3>
          <span className={`text-xs ${textMutedClass}`}>Total de {sales.length} vendas registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${tableBorderClass}`}>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass}`}>Cliente</th>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass}`}>Data da Venda</th>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} text-right`}>Comissão</th>
                <th className={`pb-3 text-[10px] font-black uppercase tracking-wider ${textMutedClass} text-center w-16`}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`py-8 text-center text-xs ${textMutedClass}`}>
                    Nenhuma venda registrada ainda. Clique em "Lançar Venda" para começar.
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className={`py-3.5 text-xs font-semibold ${headingClass} flex items-center gap-2`}>
                      <div className="p-1.5 bg-green-500/10 text-green-500 rounded-lg">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      {sale.clientName}
                    </td>
                    <td className={`py-3.5 text-xs ${textMutedClass}`}>
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-3.5 text-xs font-bold text-green-600 dark:text-green-500 text-right">
                      {formatCurrency(sale.commission)}
                    </td>
                    <td className="py-3.5 text-xs text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o lançamento de venda para ${sale.clientName}?`)) {
                            onDeleteSale(sale.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Deletar Lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
