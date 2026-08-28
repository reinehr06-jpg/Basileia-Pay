import { SecurityUser, SecuritySession, SecurityIpRule, SecurityActivityEvent, SecurityPolicy } from '@/types/security';

export const MOCK_SECURITY_USERS: SecurityUser[] = [
  {
    id: "user_01",
    name: "Carlos Oliveira",
    email: "carlos@basileia.com",
    avatar: "CO",
    role: "Owner",
    status: "active",
    twoFactorEnabled: true,
    lastAccessAt: "2026-05-19T14:20:00Z",
    createdAt: "2025-01-10T08:00:00Z"
  },
  {
    id: "user_02",
    name: "Gabriel Silva",
    email: "admin@basileia.com",
    avatar: "GS",
    role: "Admin",
    status: "active",
    twoFactorEnabled: true,
    lastAccessAt: "2026-05-19T14:18:00Z",
    createdAt: "2025-01-15T09:12:00Z"
  },
  {
    id: "user_03",
    name: "Mariana Costa",
    email: "mariana.financeiro@basileia.com",
    avatar: "MC",
    role: "Financeiro",
    status: "active",
    twoFactorEnabled: true,
    lastAccessAt: "2026-05-19T11:45:00Z",
    createdAt: "2025-03-22T10:00:00Z"
  },
  {
    id: "user_04",
    name: "João Souza",
    email: "joao.dev@basileia.com",
    avatar: "JS",
    role: "Desenvolvedor",
    status: "active",
    twoFactorEnabled: false, // Visual alert candidate
    lastAccessAt: "2026-05-19T13:10:00Z",
    createdAt: "2025-04-18T14:30:00Z"
  },
  {
    id: "user_05",
    name: "Lucas Pereira",
    email: "lucas.suporte@basileia.com",
    avatar: "LP",
    role: "Suporte",
    status: "active",
    twoFactorEnabled: true,
    lastAccessAt: "2026-05-19T09:00:00Z",
    createdAt: "2025-05-02T11:20:00Z"
  },
  {
    id: "user_06",
    name: "Ana Martins",
    email: "ana.auditor@basileia.com",
    avatar: "AM",
    role: "Auditor",
    status: "active",
    twoFactorEnabled: true,
    lastAccessAt: "2026-05-18T17:30:00Z",
    createdAt: "2025-05-10T16:00:00Z"
  },
  {
    id: "user_07",
    name: "Rodrigo Lacerda",
    email: "rodrigo.externo@empresa.com",
    avatar: "RL",
    role: "Desenvolvedor",
    status: "invited",
    twoFactorEnabled: false,
    createdAt: "2026-05-18T10:00:00Z"
  },
  {
    id: "user_08",
    name: "Beatriz Santos",
    email: "beatriz.antiga@basileia.com",
    avatar: "BS",
    role: "Suporte",
    status: "suspended",
    twoFactorEnabled: true,
    lastAccessAt: "2026-04-30T18:00:00Z",
    createdAt: "2025-02-15T08:00:00Z"
  }
];

export const MOCK_SECURITY_SESSIONS: SecuritySession[] = [
  {
    id: "sess_01",
    userId: "user_01",
    userName: "Carlos Oliveira",
    role: "Owner",
    device: "macOS / Chrome 124",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ip: "186.204.12.98",
    location: "São Paulo, BR",
    startedAt: "2026-05-19T10:00:00Z",
    lastActivityAt: "2026-05-19T14:20:00Z",
    status: "active"
  },
  {
    id: "sess_02",
    userId: "user_02",
    userName: "Gabriel Silva",
    role: "Admin",
    device: "Windows 11 / Firefox 125",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    ip: "177.34.89.21",
    location: "Rio de Janeiro, BR",
    startedAt: "2026-05-19T09:15:00Z",
    lastActivityAt: "2026-05-19T14:18:00Z",
    status: "active"
  },
  {
    id: "sess_03",
    userId: "user_04",
    userName: "João Souza",
    role: "Desenvolvedor",
    device: "Linux / Chrome Dev 126",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    ip: "200.18.92.104",
    location: "Belo Horizonte, BR",
    startedAt: "2026-05-19T13:00:00Z",
    lastActivityAt: "2026-05-19T13:10:00Z",
    status: "active"
  },
  {
    id: "sess_04",
    userId: "user_03",
    userName: "Mariana Costa",
    role: "Financeiro",
    device: "iOS 17 / Safari Mobile",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
    ip: "187.54.120.33",
    location: "Porto Alegre, BR",
    startedAt: "2026-05-19T11:30:00Z",
    lastActivityAt: "2026-05-19T11:45:00Z",
    status: "active"
  },
  {
    id: "sess_05",
    userId: "user_02",
    userName: "Gabriel Silva",
    role: "Admin",
    device: "Linux / Chromium Headless (Suspicious)",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ip: "45.138.89.200",
    location: "Moscou, RU", // Moscow session, high risk candidate
    startedAt: "2026-05-19T14:02:00Z",
    lastActivityAt: "2026-05-19T14:05:00Z",
    status: "active",
    suspicious: true
  }
];

export const MOCK_SECURITY_IP_RULES: SecurityIpRule[] = [
  {
    id: "rule_01",
    cidr: "186.204.12.98/32",
    description: "IP Fixo - Carlos Oliveira (Matriz)",
    environment: "both",
    createdBy: "Carlos Oliveira",
    createdAt: "2026-01-10T12:00:00Z"
  },
  {
    id: "rule_02",
    cidr: "177.34.89.0/24",
    description: "Escritório Rio de Janeiro - Rede Interna",
    environment: "production",
    createdBy: "Gabriel Silva",
    createdAt: "2026-02-15T09:00:00Z"
  },
  {
    id: "rule_03",
    cidr: "200.18.92.104/32",
    description: "IP Fixo - João Souza (Home Office)",
    environment: "sandbox",
    createdBy: "Carlos Oliveira",
    createdAt: "2026-04-18T10:00:00Z"
  }
];

export const MOCK_SECURITY_ACTIVITY_EVENTS: SecurityActivityEvent[] = [
  {
    id: "evt_sec_01",
    timestamp: "2026-05-19T14:20:00Z",
    event: "Login bem-sucedido (2FA)",
    userName: "Carlos Oliveira",
    ip: "186.204.12.98",
    result: "success",
    details: "Autenticado via App Autenticador (TOTP) no macOS."
  },
  {
    id: "evt_sec_02",
    timestamp: "2026-05-19T14:05:00Z",
    event: "Tentativa suspeita de login",
    userName: "Gabriel Silva",
    ip: "45.138.89.200",
    result: "warning",
    details: "Dispositivo incomum e geolocalização divergente detectados (Rússia)."
  },
  {
    id: "evt_sec_03",
    timestamp: "2026-05-19T13:40:00Z",
    event: "Papel de usuário atualizado",
    userName: "Carlos Oliveira",
    ip: "186.204.12.98",
    result: "success",
    details: "Usuário 'Lucas Pereira' alterado de Suporte para Desenvolvedor."
  },
  {
    id: "evt_sec_04",
    timestamp: "2026-05-19T12:15:00Z",
    event: "Tentativa de login bloqueada (CIDR)",
    userName: "Desconhecido",
    ip: "192.168.1.100",
    result: "error",
    details: "Acesso bloqueado: IP de origem fora da lista CIDR autorizada."
  },
  {
    id: "evt_sec_05",
    timestamp: "2026-05-19T11:45:00Z",
    event: "Desativação temporária do 2FA",
    userName: "João Souza",
    ip: "200.18.92.104",
    result: "warning",
    details: "Usuário desabilitou o 2FA para reconfiguração."
  }
];

export const MOCK_SECURITY_POLICY: SecurityPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  expirationDays: 90,
  previousPasswordsCount: 5,
  maxFailedAttempts: 5,
  lockMinutes: 15
};
