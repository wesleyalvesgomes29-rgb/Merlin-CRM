/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Label, FunnelStage, Sale } from './types';

// Default labels as requested
export const INITIAL_LABELS: Label[] = [
  { id: 'lead_novo', name: 'Lead Novo', color: '#10b981', textColor: '#ffffff' }, // emerald-500
  { id: '1st_contato', name: 'Primeiro Contato', color: '#06b6d4', textColor: '#ffffff' }, // cyan-500
  { id: 'sem_resposta', name: 'Sem Resposta', color: '#6b7280', textColor: '#ffffff' }, // gray-500
  { id: 'retornar_hoje', name: 'Retornar Hoje', color: '#0ea5e9', textColor: '#ffffff' }, // sky-500
  { id: 'retornar_amanha', name: 'Retornar Amanhã', color: '#6366f1', textColor: '#ffffff' }, // indigo-500
  { id: 'interessado', name: 'Interessado', color: '#8b5cf6', textColor: '#ffffff' }, // violet-500
  { id: 'muito_interessado', name: 'Muito Interessado', color: '#a855f7', textColor: '#ffffff' }, // purple-500
  { id: 'agendado', name: 'Agendado', color: '#d946ef', textColor: '#ffffff' }, // fuchsia-500
  { id: 'visitou', name: 'Visitou', color: '#ec4899', textColor: '#ffffff' }, // pink-500
  { id: 'proposta', name: 'Proposta', color: '#f43f5e', textColor: '#ffffff' }, // rose-500
  { id: 'documentacao', name: 'Documentação', color: '#f97316', textColor: '#ffffff' }, // orange-500
  { id: 'cliente_frio', name: 'Cliente Frio', color: '#64748b', textColor: '#ffffff' }, // slate-500
  { id: 'retrabalho', name: 'Retrabalho', color: '#f59e0b', textColor: '#ffffff' }, // amber-500
  { id: 'venda_fechada', name: 'Venda Fechada', color: '#16a34a', textColor: '#ffffff' }, // green-600
  { id: 'perdido', name: 'Perdido', color: '#ef4444', textColor: '#ffffff' }, // red-500
  { id: 'descarte', name: 'Descarte', color: '#71717a', textColor: '#ffffff' } // zinc-500
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  // Reset time part to count actual calendar days
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysWithoutContact(client: Client): number {
  const lastContact = client.lastContactDate || client.createdAt;
  const today = new Date();
  const contactDate = new Date(lastContact);
  contactDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (contactDate > today) return 0;
  
  const diffTime = today.getTime() - contactDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysStuck(client: Client): number {
  const stuckDate = client.stuckSince || client.createdAt;
  const today = new Date();
  const dateObj = new Date(stuckDate);
  dateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (dateObj > today) return 0;
  
  const diffTime = today.getTime() - dateObj.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(client: Client): boolean {
  if (!client.nextReturn) return false;
  // If the stage is final (Venda Fechada, Perdido), it shouldn't show as overdue
  if (client.funnelStage === FunnelStage.VENDA_FECHADA || client.funnelStage === FunnelStage.PERDIDO) {
    return false;
  }
  const nextReturn = new Date(client.nextReturn);
  const now = new Date();
  return nextReturn < now;
}

export function isScheduledForToday(client: Client): boolean {
  if (!client.nextReturn) return false;
  if (client.funnelStage === FunnelStage.VENDA_FECHADA || client.funnelStage === FunnelStage.PERDIDO) {
    return false;
  }
  const nextReturn = new Date(client.nextReturn);
  const today = new Date();
  return nextReturn.toLocaleDateString('pt-BR') === today.toLocaleDateString('pt-BR');
}

export function isNewLead(client: Client): boolean {
  return client.funnelStage === FunnelStage.LEAD_NOVO;
}

// Generate Brazilian Mock Data
export function getMockClients(): Client[] {
  const baseTime = new Date();
  
  const subDays = (d: number) => {
    const date = new Date(baseTime);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  };

  const addDaysHours = (d: number, h: number) => {
    const date = new Date(baseTime);
    date.setDate(date.getDate() + d);
    date.setHours(date.getHours() + h);
    return date.toISOString();
  };

  return [
    {
      id: 'c1',
      name: 'Carlos Eduardo Santos',
      phone: '11988776655',
      createdAt: subDays(10),
      notes: 'Procura apartamento de 2 dormitórios na Zona Sul. Tem interesse no condomínio Jardim das Flores.',
      labels: ['lead_novo', 'retornar_hoje'],
      nextReturn: addDaysHours(0, 2), // Today in 2 hours
      funnelStage: FunnelStage.LEAD_NOVO,
      contactCount: 1,
      lastContactDate: subDays(1),
      stuckSince: subDays(10),
      history: [
        { id: 'h1_1', date: subDays(10), type: 'creation', description: 'Cliente cadastrado no sistema.' },
        { id: 'h1_2', date: subDays(1), type: 'contact', description: 'Enviado mensagem de apresentação pelo WhatsApp.' }
      ]
    },
    {
      id: 'c2',
      name: 'Mariana Oliveira Vaz',
      phone: '21977665544',
      createdAt: subDays(20),
      notes: 'Deseja comprar casa em condomínio fechado na Barra. Orçamento até R$ 1.5M. Já visitou o imóvel da rua das Acácias.',
      labels: ['visitou', 'muito_interessado'],
      nextReturn: addDaysHours(1, 0), // Tomorrow
      funnelStage: FunnelStage.VISITOU,
      contactCount: 4,
      lastContactDate: subDays(2),
      stuckSince: subDays(5),
      history: [
        { id: 'h2_1', date: subDays(20), type: 'creation', description: 'Cliente cadastrada no sistema.' },
        { id: 'h2_2', date: subDays(15), type: 'status', description: 'Alterado para Em Atendimento.' },
        { id: 'h2_3', date: subDays(10), type: 'status', description: 'Agendou visita.' },
        { id: 'h2_4', date: subDays(5), type: 'status', description: 'Visitou a casa do condomínio das Acácias. Adorou a piscina.' }
      ]
    },
    {
      id: 'c3',
      name: 'Renato Mendes Alencar',
      phone: '19966554433',
      createdAt: subDays(30),
      notes: 'Interesse em cobertura duplex. Sumiu depois do envio da proposta.',
      labels: ['proposta', 'cliente_frio', 'retrabalho'],
      nextReturn: null, // No return scheduled -> alert trigger!
      funnelStage: FunnelStage.PROPOSTA,
      contactCount: 6,
      lastContactDate: subDays(16), // > 7 days -> suggest rework! & > 15 days stuck -> urgent!
      stuckSince: subDays(16),
      history: [
        { id: 'h3_1', date: subDays(30), type: 'creation', description: 'Cadastrado no sistema.' },
        { id: 'h3_2', date: subDays(25), type: 'status', description: 'Apresentação de propostas de financiamento.' },
        { id: 'h3_3', date: subDays(16), type: 'contact', description: 'Enviado proposta formal por e-mail. Sem retorno desde então.' }
      ]
    },
    {
      id: 'c4',
      name: 'Ana Paula Rocha',
      phone: '31955443322',
      createdAt: subDays(8),
      notes: 'Procura sala comercial para consultório odontológico. Agendado para hoje de manhã, mas não pôde ir.',
      labels: ['agendado', 'sem_resposta'],
      nextReturn: subDays(0.1), // Overdue! (Today in the past or yesterday)
      funnelStage: FunnelStage.AGENDADO,
      contactCount: 2,
      lastContactDate: subDays(3),
      stuckSince: subDays(4),
      history: [
        { id: 'h4_1', date: subDays(8), type: 'creation', description: 'Cadastrada no sistema.' },
        { id: 'h4_2', date: subDays(4), type: 'status', description: 'Agendado visita para hoje de manhã.' }
      ]
    },
    {
      id: 'c5',
      name: 'Roberto de Almeida',
      phone: '11944332211',
      createdAt: subDays(45),
      notes: 'Investidor. Comprou apartamento de 1 dormitório na planta para locação.',
      labels: ['venda_fechada'],
      nextReturn: null,
      funnelStage: FunnelStage.VENDA_FECHADA,
      contactCount: 12,
      lastContactDate: subDays(5),
      stuckSince: subDays(5),
      history: [
        { id: 'h5_1', date: subDays(45), type: 'creation', description: 'Cadastrado.' },
        { id: 'h5_2', date: subDays(5), type: 'status', description: 'Contrato assinado e venda concretizada!' }
      ]
    },
    {
      id: 'c6',
      name: 'Juliana Castro Neto',
      phone: '21933221100',
      createdAt: subDays(3),
      notes: 'Lead vindo do Instagram querendo saber preço do condomínio Vista Alegre. Não atende o telefone.',
      labels: ['lead_novo', 'sem_resposta'],
      nextReturn: addDaysHours(0, -3), // Overdue by a few hours
      funnelStage: FunnelStage.LEAD_NOVO,
      contactCount: 2,
      lastContactDate: subDays(2),
      stuckSince: subDays(3),
      history: [
        { id: 'h6_1', date: subDays(3), type: 'creation', description: 'Lead captado.' },
        { id: 'h6_2', date: subDays(2), type: 'contact', description: 'Ligação não atendida.' }
      ]
    }
  ];
}

export function getMockSales(): Sale[] {
  const today = new Date();
  const subDays = (d: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: 's1',
      clientId: 'c5',
      clientName: 'Roberto de Almeida',
      commission: 15400,
      date: subDays(5) // inside current month
    },
    {
      id: 's2',
      clientId: 'c_old_1',
      clientName: 'Fernanda Lima Sobral',
      commission: 24500,
      date: subDays(40) // outside current month, but within the year
    },
    {
      id: 's3',
      clientId: 'c_old_2',
      clientName: 'Maurício K. Dias',
      commission: 18000,
      date: subDays(120) // within the year
    }
  ];
}
