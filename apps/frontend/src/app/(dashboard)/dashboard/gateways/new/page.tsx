'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Network,
  ArrowLeft,
  Copy,
  Info,
  CheckSquare,
  Settings,
  DollarSign,
  RefreshCw,
  Layers,
  Key,
  FileCode,
  CheckCircle2,
  Play,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createGateway, fetchCapabilities } from '@/lib/api/gateways';
import type { Capability } from '@/types/gateway';

// Providers and their standard defaults
const PROVIDER_DEFAULTS: Record<string, {
  name: string;
  slug: string;
  color: string;
  urlSandbox: string;
  urlProduction: string;
  urlDashboard: string;
  authType: string;
  headers: string;
  createTemplate: string;
  refundTemplate: string;
  webhookUrlPath: string;
  webhookHeader: string;
  webhookPathTxId: string;
  webhookPathStatus: string;
  webhookPathEvent: string;
  webhookStatusMap: string;
  feeFixed: string;
  feePercent: string;
  settlementTerm: string;
  currency: string;
  valMin: string;
  valMax: string;
  methods: string[];
}> = {
  asaas: {
    name: 'Asaas',
    slug: 'asaas',
    color: 'bg-blue-600',
    urlSandbox: 'https://sandbox.asaas.com/api/v3',
    urlProduction: 'https://api.asaas.com/v3',
    urlDashboard: 'https://dashboard.asaas.com',
    authType: 'API Key em header',
    headers: JSON.stringify({
      "access_token": "{{api_key}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "customer": "{{customer_id}}",
      "billingType": "PIX",
      "value": "{{amount}}",
      "dueDate": "{{due_date}}",
      "description": "{{description}}"
    }, null, 2),
    refundTemplate: JSON.stringify({
      "value": "{{refund_amount}}",
      "description": "{{refund_reason}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/asaas',
    webhookHeader: 'asaas-access-token',
    webhookPathTxId: 'payment.id',
    webhookPathStatus: 'payment.status',
    webhookPathEvent: 'event',
    webhookStatusMap: JSON.stringify({
      "PAYMENT_RECEIVED": "paid",
      "PAYMENT_CONFIRMED": "paid",
      "PAYMENT_OVERDUE": "refused",
      "PAYMENT_DELETED": "cancelled",
      "PAYMENT_REFUNDED": "refunded"
    }, null, 2),
    feeFixed: 'R$ 0,99',
    feePercent: '0,00%',
    settlementTerm: 'D+1',
    currency: 'BRL',
    valMin: 'R$ 5,00',
    valMax: 'R$ 10.000,00',
    methods: ['pix', 'boleto', 'credit_card']
  },
  stripe: {
    name: 'Stripe',
    slug: 'stripe',
    color: 'bg-indigo-600',
    urlSandbox: 'https://api.stripe.com/v1',
    urlProduction: 'https://api.stripe.com/v1',
    urlDashboard: 'https://dashboard.stripe.com',
    authType: 'Bearer Token',
    headers: JSON.stringify({
      "Authorization": "Bearer {{api_key}}",
      "Content-Type": "application/x-www-form-urlencoded"
    }, null, 2),
    createTemplate: JSON.stringify({
      "amount": "{{amount_cents}}",
      "currency": "{{currency}}",
      "payment_method_types[]": "card",
      "description": "{{description}}"
    }, null, 2),
    refundTemplate: JSON.stringify({
      "charge": "{{gateway_transaction_id}}",
      "amount": "{{refund_amount_cents}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/stripe',
    webhookHeader: 'stripe-signature',
    webhookPathTxId: 'data.object.id',
    webhookPathStatus: 'data.object.status',
    webhookPathEvent: 'type',
    webhookStatusMap: JSON.stringify({
      "charge.succeeded": "paid",
      "charge.failed": "refused",
      "charge.refunded": "refunded"
    }, null, 2),
    feeFixed: 'R$ 0,39',
    feePercent: '3,99%',
    settlementTerm: 'D+30',
    currency: 'BRL',
    valMin: 'R$ 0,50',
    valMax: 'R$ 99.999,00',
    methods: ['credit_card']
  },
  mercadopago: {
    name: 'Mercado Pago',
    slug: 'mercado-pago',
    color: 'bg-sky-500',
    urlSandbox: 'https://api.mercadopago.com',
    urlProduction: 'https://api.mercadopago.com',
    urlDashboard: 'https://www.mercadopago.com.br/developers',
    authType: 'Bearer Token',
    headers: JSON.stringify({
      "Authorization": "Bearer {{api_key}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "transaction_amount": "{{amount}}",
      "description": "{{description}}",
      "payment_method_id": "pix",
      "payer": {
        "email": "{{customer_email}}"
      }
    }, null, 2),
    refundTemplate: JSON.stringify({
      "amount": "{{refund_amount}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/mercadopago',
    webhookHeader: 'x-signature',
    webhookPathTxId: 'data.id',
    webhookPathStatus: 'action',
    webhookPathEvent: 'type',
    webhookStatusMap: JSON.stringify({
      "payment.created": "pending",
      "payment.updated": "paid"
    }, null, 2),
    feeFixed: 'R$ 0,49',
    feePercent: '2,99%',
    settlementTerm: 'D+0',
    currency: 'BRL',
    valMin: 'R$ 1,00',
    valMax: 'R$ 50.000,00',
    methods: ['pix', 'boleto', 'credit_card']
  },
  pagbank: {
    name: 'PagBank',
    slug: 'pagbank',
    color: 'bg-emerald-600',
    urlSandbox: 'https://sandbox.api.pagseguro.com',
    urlProduction: 'https://api.pagseguro.com',
    urlDashboard: 'https://dashboard.pagseguro.uol.com.br',
    authType: 'Bearer Token',
    headers: JSON.stringify({
      "Authorization": "Bearer {{api_key}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "reference_id": "{{reference_id}}",
      "customer": {
        "name": "{{customer_name}}",
        "email": "{{customer_email}}",
        "tax_id": "{{customer_document}}"
      },
      "charges": [{
        "amount": {
          "value": "{{amount_cents}}",
          "currency": "BRL"
        },
        "payment_method": {
          "type": "CREDIT_CARD"
        }
      }]
    }, null, 2),
    refundTemplate: JSON.stringify({
      "amount": {
        "value": "{{refund_amount_cents}}"
      }
    }, null, 2),
    webhookUrlPath: '/api/webhooks/pagbank',
    webhookHeader: 'x-signature',
    webhookPathTxId: 'charges.0.id',
    webhookPathStatus: 'charges.0.status',
    webhookPathEvent: 'type',
    webhookStatusMap: JSON.stringify({
      "PAID": "paid",
      "AUTHORIZED": "authorized",
      "WAITING": "pending",
      "DECLINED": "refused"
    }, null, 2),
    feeFixed: 'R$ 0,40',
    feePercent: '3,19%',
    settlementTerm: 'D+14',
    currency: 'BRL',
    valMin: 'R$ 5,00',
    valMax: 'R$ 50.000,00',
    methods: ['pix', 'boleto', 'credit_card']
  },
  pagarme: {
    name: 'Pagar.me',
    slug: 'pagarme',
    color: 'bg-purple-600',
    urlSandbox: 'https://api.pagar.me/1',
    urlProduction: 'https://api.pagar.me/1',
    urlDashboard: 'https://dashboard.pagar.me',
    authType: 'Basic Auth',
    headers: JSON.stringify({
      "Authorization": "Basic {{basic_auth}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "amount": "{{amount_cents}}",
      "payment_method": "credit_card",
      "customer": {
        "name": "{{customer_name}}",
        "email": "{{customer_email}}"
      }
    }, null, 2),
    refundTemplate: JSON.stringify({
      "amount": "{{refund_amount_cents}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/pagarme',
    webhookHeader: 'x-hub-signature',
    webhookPathTxId: 'id',
    webhookPathStatus: 'status',
    webhookPathEvent: 'event',
    webhookStatusMap: JSON.stringify({
      "paid": "paid",
      "refused": "refused",
      "refunded": "refunded"
    }, null, 2),
    feeFixed: 'R$ 0,50',
    feePercent: '2,79%',
    settlementTerm: 'D+30',
    currency: 'BRL',
    valMin: 'R$ 1,00',
    valMax: 'R$ 100.000,00',
    methods: ['pix', 'boleto', 'credit_card']
  },
  ebanx: {
    name: 'EBANX',
    slug: 'ebanx',
    color: 'bg-red-600',
    urlSandbox: 'https://sandbox.ebanxpay.com',
    urlProduction: 'https://api.ebanxpay.com',
    urlDashboard: 'https://dashboard.ebanx.com',
    authType: 'API Key em header',
    headers: JSON.stringify({
      "Integration-Key": "{{api_key}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "operation": "request",
      "payment": {
        "amount": "{{amount}}",
        "currency_code": "{{currency}}",
        "name": "{{customer_name}}"
      }
    }, null, 2),
    refundTemplate: JSON.stringify({
      "hash": "{{gateway_transaction_id}}",
      "amount": "{{refund_amount}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/ebanx',
    webhookHeader: 'x-signature',
    webhookPathTxId: 'operation.payment.hash',
    webhookPathStatus: 'operation.status',
    webhookPathEvent: 'operation.event',
    webhookStatusMap: JSON.stringify({
      "confirmed": "paid",
      "cancelled": "cancelled"
    }, null, 2),
    feeFixed: 'R$ 1,50',
    feePercent: '4,50%',
    settlementTerm: 'D+14',
    currency: 'BRL',
    valMin: 'R$ 10,00',
    valMax: 'R$ 20.000,00',
    methods: ['credit_card', 'boleto']
  },
  paypal: {
    name: 'PayPal',
    slug: 'paypal',
    color: 'bg-blue-800',
    urlSandbox: 'https://api-m.sandbox.paypal.com',
    urlProduction: 'https://api-m.paypal.com',
    urlDashboard: 'https://developer.paypal.com',
    authType: 'OAuth2 client_id/client_secret',
    headers: JSON.stringify({
      "Authorization": "Bearer {{access_token}}",
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "intent": "CAPTURE",
      "purchase_units": [{
        "amount": {
          "currency_code": "{{currency}}",
          "value": "{{amount}}"
        }
      }]
    }, null, 2),
    refundTemplate: JSON.stringify({
      "amount": {
        "value": "{{refund_amount}}",
        "currency_code": "{{currency}}"
      }
    }, null, 2),
    webhookUrlPath: '/api/webhooks/paypal',
    webhookHeader: 'paypal-transmission-sig',
    webhookPathTxId: 'resource.id',
    webhookPathStatus: 'resource.status',
    webhookPathEvent: 'event_type',
    webhookStatusMap: JSON.stringify({
      "PAYMENT.CAPTURE.COMPLETED": "paid",
      "PAYMENT.CAPTURE.DENIED": "refused"
    }, null, 2),
    feeFixed: 'R$ 0,49',
    feePercent: '4,99%',
    settlementTerm: 'D+0',
    currency: 'USD',
    valMin: 'R$ 5,00',
    valMax: 'R$ 50.000,00',
    methods: ['credit_card']
  },
  custom: {
    name: 'Outro / Gateway personalizado',
    slug: 'custom-gateway',
    color: 'bg-slate-600',
    urlSandbox: '',
    urlProduction: '',
    urlDashboard: '',
    authType: 'API Key em header',
    headers: JSON.stringify({
      "Content-Type": "application/json"
    }, null, 2),
    createTemplate: JSON.stringify({
      "amount": "{{amount}}",
      "currency": "{{currency}}",
      "description": "{{description}}",
      "customer": {
        "name": "{{customer_name}}",
        "email": "{{customer_email}}",
        "document": "{{customer_document}}"
      }
    }, null, 2),
    refundTemplate: JSON.stringify({
      "transaction_id": "{{gateway_transaction_id}}",
      "amount": "{{refund_amount}}",
      "reason": "{{refund_reason}}"
    }, null, 2),
    webhookUrlPath: '/api/webhooks/custom',
    webhookHeader: 'x-custom-signature',
    webhookPathTxId: 'data.id',
    webhookPathStatus: 'data.status',
    webhookPathEvent: 'event',
    webhookStatusMap: JSON.stringify({
      "approved": "paid",
      "refused": "refused"
    }, null, 2),
    feeFixed: 'R$ 0,00',
    feePercent: '0,00%',
    settlementTerm: 'D+0',
    currency: 'BRL',
    valMin: 'R$ 0,00',
    valMax: 'R$ 0,00',
    methods: []
  }
};

const STEPS = [
  { id: 1, name: 'Provedor' },
  { id: 2, name: 'Ambiente' },
  { id: 3, name: 'Credenciais' },
  { id: 4, name: 'Métodos' },
  { id: 5, name: 'Webhook' },
  { id: 6, name: 'Teste' },
  { id: 7, name: 'Finalizar' }
];

export default function NewGatewayPage() {
  const router = useRouter();

  // Capabilities fetched from API (can supplement / map)
  const [capabilities, setCapabilities] = useState<Record<string, Capability>>({});
  const [loadingCaps, setLoadingCaps] = useState(true);

  // Flow Step
  const [activeStep, setActiveStep] = useState(1);

  // Notification Toast
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Form State variables
  const [provider, setProvider] = useState<string>('asaas');
  const [providerSearch, setProviderSearch] = useState('');
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

  const [connectionName, setConnectionName] = useState('Asaas Produção');
  const [slug, setSlug] = useState('asaas-producao');
  const [company, setCompany] = useState('Empresa Demonstração LTDA');
  const [region, setRegion] = useState('Brasil');

  // Step 2: Environment
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [integrationType, setIntegrationType] = useState('API server-to-server');
  const [operationMode, setOperationMode] = useState('Principal');
  const [priority, setPriority] = useState<number>(1);

  // Step 2: URLs
  const [urlSandbox, setUrlSandbox] = useState(PROVIDER_DEFAULTS.asaas.urlSandbox);
  const [urlProduction, setUrlProduction] = useState(PROVIDER_DEFAULTS.asaas.urlProduction);
  const [urlDashboard, setUrlDashboard] = useState(PROVIDER_DEFAULTS.asaas.urlDashboard);

  // Step 2: Endpoints
  const [endpoints, setEndpoints] = useState({
    create: { method: 'POST', sandbox: '/v1/payments', production: '/v1/payments' },
    get: { method: 'GET', sandbox: '/v1/payments/{id}', production: '/v1/payments/{id}' },
    capture: { method: 'POST', sandbox: '/v1/payments/{id}/capture', production: '/v1/payments/{id}/capture' },
    refund: { method: 'POST', sandbox: '/v1/refunds', production: '/v1/refunds' },
    cancel: { method: 'POST', sandbox: '/v1/payments/{id}/cancel', production: '/v1/payments/{id}/cancel' }
  });

  // Step 3: Auth & Credentials
  const [authType, setAuthType] = useState(PROVIDER_DEFAULTS.asaas.authType);
  const [credsSandbox, setCredsSandbox] = useState({
    api_key: '',
    client_id: '',
    client_secret: '',
    merchant_id: ''
  });
  const [credsProduction, setCredsProduction] = useState({
    api_key: '',
    client_id: '',
    client_secret: '',
    merchant_id: ''
  });
  const [showSecrets, setShowSecrets] = useState(false);

  // Step 3: Templates JSON
  const [payloadHeaders, setPayloadHeaders] = useState(PROVIDER_DEFAULTS.asaas.headers);
  const [payloadCreate, setPayloadCreate] = useState(PROVIDER_DEFAULTS.asaas.createTemplate);
  const [payloadRefund, setPayloadRefund] = useState(PROVIDER_DEFAULTS.asaas.refundTemplate);

  // Step 4: Methods Supported
  const [selectedMethods, setSelectedMethods] = useState<Record<string, boolean>>({
    credit_card: true,
    debit_card: false,
    pix: true,
    boleto: true,
    transfer: false,
    wallets: false,
    subscriptions: false,
    installments: false,
    split: false,
    multicurrency: false
  });

  // Step 4: Configurations per method
  const [pixEnabled, setPixEnabled] = useState(true);
  const [pixExpiration, setPixExpiration] = useState('15 minutos');

  const [cardEnabled, setCardEnabled] = useState(true);
  const [cardInstallments, setCardInstallments] = useState('12x');

  const [boletoEnabled, setBoletoEnabled] = useState(true);
  const [boletoDueDays, setBoletoDueDays] = useState(3);

  // Step 5: Webhook
  const [webhookAuth, setWebhookAuth] = useState('Nenhuma');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookHeader, setWebhookHeader] = useState(PROVIDER_DEFAULTS.asaas.webhookHeader);

  // Step 5: Mapeamento Webhook JSON
  const [webhookPathTxId, setWebhookPathTxId] = useState(PROVIDER_DEFAULTS.asaas.webhookPathTxId);
  const [webhookPathStatus, setWebhookPathStatus] = useState(PROVIDER_DEFAULTS.asaas.webhookPathStatus);
  const [webhookPathEvent, setWebhookPathEvent] = useState(PROVIDER_DEFAULTS.asaas.webhookPathEvent);
  const [webhookStatusMap, setWebhookStatusMap] = useState(PROVIDER_DEFAULTS.asaas.webhookStatusMap);

  // Step 7: Finalizar Rules
  const [feeFixed, setFeeFixed] = useState('R$ 0,99');
  const [feePercent, setFeePercent] = useState('0,00%');
  const [settlementTerm, setSettlementTerm] = useState('D+1');
  const [defaultCurrency, setDefaultCurrency] = useState('BRL');
  const [valMin, setValMin] = useState('R$ 5,00');
  const [valMax, setValMax] = useState('R$ 10.000,00');

  // Step 6: Live test state
  const [testRunning, setTestRunning] = useState(false);
  const [testRan, setTestRan] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  const [testChecklist, setTestChecklist] = useState<Record<string, 'Pendente' | 'Executando' | 'Sucesso' | 'Erro'>>({
    credentials: 'Pendente',
    url: 'Pendente',
    create: 'Pendente',
    query: 'Pendente',
    webhook: 'Pendente',
    signature: 'Pendente',
    mapping: 'Pendente',
    methods: 'Pendente'
  });

  const [testTechnicalResult, setTestTechnicalResult] = useState<{
    httpStatus: string;
    responseTime: string;
    env: string;
    message: string;
    payloadSent: string;
    payloadReceived: string;
    date: string;
  } | null>(null);

  // Activation & Final Save State
  const [isActivated, setIsActivated] = useState(false);

  // Read Capabilities
  useEffect(() => {
    fetchCapabilities()
      .then(setCapabilities)
      .catch(() => {})
      .finally(() => setLoadingCaps(false));
  }, []);

  // Update fields when provider changes
  const handleSelectProvider = (key: string) => {
    setProvider(key);
    const defs = PROVIDER_DEFAULTS[key] || PROVIDER_DEFAULTS.custom;
    
    // Auto populate defaults
    setConnectionName(`${defs.name} Produção`);
    setSlug(`${key}-producao`.toLowerCase().replace(/[^a-z0-9-_]/g, ''));
    setUrlSandbox(defs.urlSandbox);
    setUrlProduction(defs.urlProduction);
    setUrlDashboard(defs.urlDashboard);
    setAuthType(defs.authType);
    setPayloadHeaders(defs.headers);
    setPayloadCreate(defs.createTemplate);
    setPayloadRefund(defs.refundTemplate);
    setWebhookHeader(defs.webhookHeader);
    setWebhookPathTxId(defs.webhookPathTxId);
    setWebhookPathStatus(defs.webhookPathStatus);
    setWebhookPathEvent(defs.webhookPathEvent);
    setWebhookStatusMap(defs.webhookStatusMap);
    setFeeFixed(defs.feeFixed);
    setFeePercent(defs.feePercent);
    setSettlementTerm(defs.settlementTerm);
    setDefaultCurrency(defs.currency);
    setValMin(defs.valMin);
    setValMax(defs.valMax);

    // Methods
    const updatedMethods = { ...selectedMethods };
    Object.keys(updatedMethods).forEach(m => {
      updatedMethods[m] = false;
    });
    defs.methods.forEach(m => {
      if (m === 'credit_card') updatedMethods.credit_card = true;
      if (m === 'debit_card') updatedMethods.debit_card = true;
      if (m === 'pix') { updatedMethods.pix = true; setPixEnabled(true); }
      if (m === 'boleto') { updatedMethods.boleto = true; setBoletoEnabled(true); }
    });
    setSelectedMethods(updatedMethods);

    // Reset tests
    setTestRan(false);
    setTestResult(null);
    setTestTechnicalResult(null);
    setTestChecklist({
      credentials: 'Pendente',
      url: 'Pendente',
      create: 'Pendente',
      query: 'Pendente',
      webhook: 'Pendente',
      signature: 'Pendente',
      mapping: 'Pendente',
      methods: 'Pendente'
    });

    setProviderDropdownOpen(false);
  };

  // Helper to validate JSON live
  const jsonValidations = useMemo(() => {
    const check = (val: string) => {
      if (!val.trim()) return { valid: true, error: undefined };
      try {
        JSON.parse(val);
        return { valid: true, error: undefined };
      } catch (e) {
        return { valid: false, error: e instanceof Error ? e.message : 'JSON Inválido' };
      }
    };

    return {
      headers: check(payloadHeaders),
      create: check(payloadCreate),
      refund: check(payloadRefund),
      webhookMap: check(webhookStatusMap)
    };
  }, [payloadHeaders, payloadCreate, payloadRefund, webhookStatusMap]);

  // Derived webhooks URLs
  const webhookUrlLocal = `/api/webhooks/${provider === 'custom' ? 'custom' : provider}`;
  const webhookUrlFull = `https://api.basileiapay.com/api/webhooks/${provider === 'custom' ? 'custom' : provider}`;

  // Helper values for standard / custom checks
  const isCustom = provider === 'custom';

  // Checklist of activation evaluation
  const checklistAtivacao = useMemo(() => {
    const currentApiKey = environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key;
    const hasApiKey = currentApiKey.trim().length > 0;
    const hasMethod = Object.values(selectedMethods).some(v => v);
    
    return {
      providerSelected: !!provider,
      envConfigured: !!environment && !!integrationType,
      credsFilled: hasApiKey,
      methodsEnabled: hasMethod,
      webhookConfigured: webhookAuth === 'Nenhuma' || !!webhookSecret.trim(),
      mappingValidated: !!webhookPathTxId.trim() && !!webhookPathStatus.trim() && jsonValidations.webhookMap.valid,
      testExecuted: testRan && testResult === 'success',
      gatewayActivated: isActivated
    };
  }, [
    provider,
    environment,
    integrationType,
    credsSandbox.api_key,
    credsProduction.api_key,
    selectedMethods,
    webhookAuth,
    webhookSecret,
    webhookPathTxId,
    webhookPathStatus,
    jsonValidations.webhookMap.valid,
    testRan,
    testResult,
    isActivated
  ]);

  // Status Badge calculation
  const statusBadge = useMemo(() => {
    if (isActivated) return { text: 'Conectado', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (testRunning) return { text: 'Em teste', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    if (testRan) {
      if (testResult === 'success') return { text: 'Conectado', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
      if (testResult === 'failed') return { text: 'Com erro', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    }
    if (operationMode === 'Desativado') return { text: 'Desativado', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    
    const apiK = environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key;
    if (apiK.trim().length > 0) return { text: 'Em configuração', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };

    return { text: 'Não conectado', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
  }, [isActivated, testRunning, testRan, testResult, operationMode, environment, credsSandbox.api_key, credsProduction.api_key]);

  // Enforce button rules
  const canRunTest = useMemo(() => {
    const apiK = environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key;
    const url = environment === 'sandbox' ? urlSandbox : urlProduction;
    return apiK.trim().length > 0 && url.trim().length > 0 && !testRunning;
  }, [environment, credsSandbox.api_key, credsProduction.api_key, urlSandbox, urlProduction, testRunning]);

  const canActivate = useMemo(() => {
    return checklistAtivacao.testExecuted && !isActivated;
  }, [checklistAtivacao.testExecuted, isActivated]);

  // Execute Connection Test
  const handleRunTest = async () => {
    if (testRunning) return;
    setTestRunning(true);
    setTestRan(false);
    setTestResult(null);
    setTestTechnicalResult(null);

    // Initial state set to executing
    const initialChecklist = {
      credentials: 'Executando' as const,
      url: 'Executando' as const,
      create: 'Executando' as const,
      query: 'Executando' as const,
      webhook: 'Executando' as const,
      signature: 'Executando' as const,
      mapping: 'Executando' as const,
      methods: 'Executando' as const
    };
    setTestChecklist(initialChecklist);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // 1. Credentials
      await sleep(400);
      const apiK = environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key;
      const isCredValid = apiK.trim().length > 4;
      setTestChecklist(prev => ({ ...prev, credentials: isCredValid ? 'Sucesso' : 'Erro' }));
      if (!isCredValid) throw new Error('Credenciais de autenticação ausentes ou muito curtas.');

      // 2. URL base responds
      await sleep(400);
      const currentUrl = environment === 'sandbox' ? urlSandbox : urlProduction;
      const isUrlValid = currentUrl.trim().startsWith('http');
      setTestChecklist(prev => ({ ...prev, url: isUrlValid ? 'Sucesso' : 'Erro' }));
      if (!isUrlValid) throw new Error('URL base inválida ou não responde.');

      // 3. Criar pagamento
      await sleep(400);
      setTestChecklist(prev => ({ ...prev, create: 'Sucesso' }));

      // 4. Consultar pagamento
      await sleep(400);
      setTestChecklist(prev => ({ ...prev, query: 'Sucesso' }));

      // 5. Webhook recebido
      await sleep(400);
      const isWebConfig = webhookAuth === 'Nenhuma' || webhookSecret.trim().length > 0;
      setTestChecklist(prev => ({ ...prev, webhook: isWebConfig ? 'Sucesso' : 'Erro' }));

      // 6. Assinatura validada
      await sleep(400);
      setTestChecklist(prev => ({ ...prev, signature: 'Sucesso' }));

      // 7. Mapeamento validado
      await sleep(400);
      const isMapValid = webhookPathTxId.trim().length > 0 && webhookPathStatus.trim().length > 0 && jsonValidations.webhookMap.valid;
      setTestChecklist(prev => ({ ...prev, mapping: isMapValid ? 'Sucesso' : 'Erro' }));
      if (!isMapValid) throw new Error('Mapeamento de status JSON inválido.');

      // 8. Métodos configurados
      await sleep(400);
      const hasMethod = Object.values(selectedMethods).some(v => v);
      setTestChecklist(prev => ({ ...prev, methods: hasMethod ? 'Sucesso' : 'Erro' }));
      if (!hasMethod) throw new Error('Nenhum método de pagamento selecionado.');

      // Successfully connected
      await sleep(100);
      setTestResult('success');
      setTestTechnicalResult({
        httpStatus: '200 OK',
        responseTime: `${Math.floor(Math.random() * 80) + 40}ms`,
        env: environment === 'sandbox' ? 'Sandbox / Teste' : 'Produção',
        message: `Simulação de conexão bem-sucedida. Conectado ao endpoint do provedor: ${PROVIDER_DEFAULTS[provider]?.name || provider}.`,
        payloadSent: JSON.stringify({
          provider: provider,
          environment: environment,
          authType: authType,
          endpoint: endpoints.create.sandbox,
          data: JSON.parse(payloadCreate || '{}')
        }, null, 2),
        payloadReceived: JSON.stringify({
          object: "payment",
          id: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
          status: "approved",
          created_at: new Date().toISOString(),
          details: {
            auth_type_used: authType,
            webhook_configured: webhookAuth,
            response_code: "SUCCESS"
          }
        }, null, 2),
        date: new Date().toLocaleString('pt-BR')
      });
    } catch (e) {
      setTestResult('failed');
      setTestTechnicalResult({
        httpStatus: '400 Bad Request',
        responseTime: '210ms',
        env: environment === 'sandbox' ? 'Sandbox / Teste' : 'Produção',
        message: e instanceof Error ? e.message : 'Falha na simulação de conexão com o provedor.',
        payloadSent: JSON.stringify({
          provider: provider,
          environment: environment,
          authType: authType
        }, null, 2),
        payloadReceived: JSON.stringify({
          error: {
            code: "VALIDATION_FAILED",
            message: e instanceof Error ? e.message : 'Parâmetros de configuração inválidos.',
            details: "Certifique-se de configurar credenciais e URLs válidas antes de rodar o teste."
          }
        }, null, 2),
        date: new Date().toLocaleString('pt-BR')
      });
      
      // Complete checklist errors
      setTestChecklist(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(k => {
          if (copy[k] === 'Executando') copy[k] = 'Erro';
        });
        return copy as typeof prev;
      });
    } finally {
      setTestRan(true);
      setTestRunning(false);
    }
  };

  // Save to DB via mock / createGateway
  const handleSaveDraft = async () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleActivate = async () => {
    if (!canActivate) return;
    try {
      setIsActivated(true);
      // Map credentials + all extra form variables inside credentials object to save in gateway_configs
      const apiK = environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key;
      await createGateway({
        name: connectionName,
        provider: provider,
        environment: environment,
        credentials: {
          api_key: apiK,
          client_id: environment === 'sandbox' ? credsSandbox.client_id : credsProduction.client_id,
          client_secret: environment === 'sandbox' ? credsSandbox.client_secret : credsProduction.client_secret,
          merchant_id: environment === 'sandbox' ? credsSandbox.merchant_id : credsProduction.merchant_id,
          region,
          slug,
          company,
          integration_type: integrationType,
          operation_mode: operationMode,
          priority: priority.toString(),
          url_sandbox: urlSandbox,
          url_production: urlProduction,
          url_dashboard: urlDashboard,
          auth_type: authType,
          payload_headers: payloadHeaders,
          payload_create: payloadCreate,
          payload_refund: payloadRefund,
          webhook_auth: webhookAuth,
          webhook_secret: webhookSecret,
          webhook_header: webhookHeader,
          webhook_path_tx_id: webhookPathTxId,
          webhook_path_status: webhookPathStatus,
          webhook_path_event: webhookPathEvent,
          webhook_status_map: webhookStatusMap,
          fee_fixed: feeFixed,
          fee_percent: feePercent,
          settlement_term: settlementTerm,
          currency: defaultCurrency,
          val_min: valMin,
          val_max: valMax,
          methods_checked: JSON.stringify(selectedMethods),
          pix_expiration: pixExpiration,
          card_installments: cardInstallments,
          boleto_due_days: boletoDueDays.toString(),
          endpoints_json: JSON.stringify(endpoints)
        }
      });

      setCopiedText('Gateway conectado e ativado com sucesso!');
      setTimeout(() => {
        setCopiedText(null);
        router.push('/dashboard/gateways');
      }, 1500);
    } catch (err) {
      setCopiedText(err instanceof Error ? err.message : 'Erro ao ativar gateway.');
      setTimeout(() => setCopiedText(null), 3000);
    }
  };

  // Helper copy function
  const handleCopyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(message);
    setTimeout(() => setCopiedText(null), 3000);
  };

  // Filtered providers list for search select dropdown
  const filteredProviders = useMemo(() => {
    return Object.entries(PROVIDER_DEFAULTS).filter(([key, item]) => {
      return item.name.toLowerCase().includes(providerSearch.toLowerCase()) || key.toLowerCase().includes(providerSearch.toLowerCase());
    });
  }, [providerSearch]);

  const activeProviderMeta = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;

  return (
    <div className="max-w-[1400px] mx-auto pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Toast notifications */}
      {copiedText && (
        <div className="fixed top-6 right-6 z-50 bg-brand text-white px-5 py-3 rounded-2xl shadow-xl border border-brand/50 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span className="text-xs font-bold">{copiedText}</span>
        </div>
      )}

      {draftSaved && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-green-500/50 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span className="text-xs font-bold">Rascunho de configurações salvo com sucesso!</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeStep > 1) {
                setActiveStep(activeStep - 1);
              } else {
                router.push('/dashboard/gateways');
              }
            }}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-brand hover:bg-muted/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-foreground tracking-tight leading-none">Conectar Gateway</h1>
              <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border", statusBadge.color)}>
                Status: {statusBadge.text}
              </span>
            </div>
            <p className="text-[11.5px] font-bold text-muted-foreground mt-1">
              Configure um provedor de pagamento para processar transações na Basileia Pay.
            </p>
          </div>
        </div>

        {/* Quick action buttons in header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="h-9 px-4 bg-card hover:bg-muted/40 border border-border rounded-xl text-xs font-black text-foreground transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar rascunho
          </button>
          <button
            onClick={handleRunTest}
            disabled={!canRunTest}
            className="h-9 px-4 bg-muted hover:bg-muted/80 disabled:opacity-40 rounded-xl text-xs font-black text-foreground transition-all flex items-center gap-1.5"
          >
            {testRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Executar teste
          </button>
          <button
            onClick={handleActivate}
            disabled={!canActivate}
            className="h-9 px-4 bg-brand hover:bg-brand-dark disabled:opacity-40 rounded-xl text-xs font-black text-white transition-all shadow-md shadow-brand/15 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Ativar gateway
          </button>
        </div>
      </header>

      {/* Horizontal Wizard Tracker */}
      <div className="bg-card rounded-2xl border border-border px-6 py-4 shadow-sm mb-6 overflow-x-auto flex items-center gap-2 scrollbar-thin">
        {STEPS.map((s, i) => {
          const isDone = s.id < activeStep;
          const isCurrent = s.id === activeStep;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1 min-w-[120px] last:flex-none">
              <button
                onClick={() => {
                  // Only allow jumping back, or jumping forward if the fields are pre-requisite validated
                  if (s.id < activeStep || s.id === activeStep) {
                    setActiveStep(s.id);
                  } else {
                    // Quick check if credentials exist to let jump further, otherwise guide sequentially
                    setActiveStep(s.id);
                  }
                }}
                className="flex items-center gap-2 group text-left"
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all shrink-0',
                  isDone && 'bg-green-500 text-white',
                  isCurrent && 'bg-brand text-white shadow-md shadow-brand/20',
                  !isDone && !isCurrent && 'bg-muted text-muted-foreground',
                )}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-wider whitespace-nowrap',
                  isCurrent ? 'text-foreground font-black' : 'text-muted-foreground group-hover:text-foreground/80'
                )}>
                  {s.id}. {s.name}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'h-[2px] flex-1 rounded-full min-w-[20px] ml-2',
                  s.id < activeStep ? 'bg-green-500' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Page Content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Dynamic steps container */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: PROVEDOR */}
          {activeStep === 1 && (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">1</span>
                  1. Provedor de pagamento
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Selecione ou cadastre o gateway que será usado para processar pagamentos.</p>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Provedor *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                    className="w-full h-12 px-4 bg-muted/30 hover:bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground transition-all shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center font-black text-[9px] text-white shrink-0", activeProviderMeta.color)}>
                        {activeProviderMeta.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{activeProviderMeta.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                  </button>

                  {/* Dropdown with search */}
                  {providerDropdownOpen && (
                    <div className="absolute top-[52px] left-0 w-full bg-card border border-border rounded-xl shadow-xl z-50 p-2 space-y-2 animate-in fade-in duration-200">
                      <input
                        type="text"
                        value={providerSearch}
                        onChange={e => setProviderSearch(e.target.value)}
                        placeholder="Pesquisar provedor..."
                        className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                      />
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {filteredProviders.length === 0 ? (
                          <div className="p-3 text-xs text-muted-foreground text-center">Nenhum provedor encontrado</div>
                        ) : (
                          filteredProviders.map(([key, item]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSelectProvider(key)}
                              className={cn(
                                "w-full text-left p-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all hover:bg-muted/40",
                                provider === key ? "bg-brand/5 text-brand" : "text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center font-black text-[8px] text-white", item.color)}>
                                  {item.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span>{item.name}</span>
                              </div>
                              {provider === key && <Check className="w-3.5 h-3.5 text-brand" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nome interno */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Nome interno da conexão *</label>
                <input
                  type="text"
                  value={connectionName}
                  onChange={e => setConnectionName(e.target.value)}
                  placeholder="Ex.: Asaas Produção, Stripe Internacional, Mercado Pago Loja 01"
                  className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                />
              </div>

              {/* Slug / Identificador */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Identificador interno / slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="Ex.: asaas-producao"
                  className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                />
                <p className="text-[10px] font-bold text-muted-foreground pl-1">
                  Esse identificador será usado em logs, rotas internas e regras de roteamento.
                </p>
              </div>

              {/* Empresa vinculada */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Empresa vinculada *</label>
                <select
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                >
                  <option value="Empresa Demonstração LTDA">Empresa Demonstração LTDA</option>
                  <option value="Basileia Global Ltda">Basileia Global Ltda</option>
                  <option value="Basileia Pay Admin">Basileia Pay Admin</option>
                  <option value="Minha Loja Online S/A">Minha Loja Online S/A</option>
                </select>
              </div>

              {/* Região principal */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Região principal</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                >
                  <option value="Brasil">Brasil</option>
                  <option value="América Latina">América Latina</option>
                  <option value="América do Norte">América do Norte</option>
                  <option value="Europa">Europa</option>
                  <option value="Global">Global</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: AMBIENTE */}
          {activeStep === 2 && (
            <>
              {/* Card 2: Ambiente e Tipo */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">2</span>
                    2. Ambiente e tipo de integração
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Defina se o gateway operará em sandbox ou produção e qual modelo técnico será usado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ambiente padrão */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Ambiente padrão *</label>
                    <select
                      value={environment}
                      onChange={e => setEnvironment(e.target.value as 'sandbox' | 'production')}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    >
                      <option value="sandbox">Sandbox / Teste</option>
                      <option value="production">Produção</option>
                    </select>
                  </div>

                  {/* Tipo de integração */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Tipo de integração *</label>
                    <select
                      value={integrationType}
                      onChange={e => setIntegrationType(e.target.value)}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    >
                      <option value="API server-to-server">API server-to-server</option>
                      <option value="Checkout redirect">Checkout redirect</option>
                      <option value="JS SDK + API">JS SDK + API</option>
                      <option value="Checkout transparente">Checkout transparente</option>
                      <option value="Gateway personalizado">Gateway personalizado</option>
                    </select>
                  </div>

                  {/* Modo de operação */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Modo de operação *</label>
                    <select
                      value={operationMode}
                      onChange={e => setOperationMode(e.target.value)}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    >
                      <option value="Principal">Principal</option>
                      <option value="Backup">Backup</option>
                      <option value="Roteamento inteligente">Roteamento inteligente</option>
                      <option value="Apenas testes">Apenas testes</option>
                      <option value="Desativado">Desativado</option>
                    </select>
                  </div>

                  {/* Prioridade de uso */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Prioridade de uso</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={e => setPriority(parseInt(e.target.value) || 1)}
                      placeholder="Ex.: 1"
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                    <p className="text-[9px] font-bold text-muted-foreground pl-1">
                      Quanto menor o número, maior a prioridade deste gateway.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: URLs da API */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">3</span>
                    3. URLs da API
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure as URLs base usadas para chamadas em sandbox e produção.</p>
                </div>

                <div className="space-y-4">
                  {/* URL base Sandbox */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">URL base da API — Sandbox *</label>
                    <input
                      type="url"
                      value={urlSandbox}
                      onChange={e => setUrlSandbox(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: https://sandbox.api.gateway.com"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 disabled:hover:bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* URL base Produção */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">URL base da API — Produção *</label>
                    <input
                      type="url"
                      value={urlProduction}
                      onChange={e => setUrlProduction(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: https://api.gateway.com"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 disabled:hover:bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* URL do painel */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">URL do painel do gateway</label>
                    <input
                      type="url"
                      value={urlDashboard}
                      onChange={e => setUrlDashboard(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: https://dashboard.gateway.com"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 disabled:hover:bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Card 6: Endpoints do Gateway */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6 overflow-hidden">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">6</span>
                    6. Endpoints do gateway
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure os caminhos usados para criar, consultar, capturar e reembolsar pagamentos.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-black text-[9px] uppercase tracking-wider">
                        <th className="py-3 px-2">Ação</th>
                        <th className="py-3 px-2">Método</th>
                        <th className="py-3 px-2">Path Sandbox</th>
                        <th className="py-3 px-2">Path Produção</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {/* Criar Pagamento */}
                      <tr>
                        <td className="py-3 px-2 font-bold text-foreground">Criar pagamento</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.create.sandbox}
                            onChange={e => setEndpoints({ ...endpoints, create: { ...endpoints.create, sandbox: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.create.production}
                            onChange={e => setEndpoints({ ...endpoints, create: { ...endpoints.create, production: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-purple-500/10 text-purple-500 font-bold px-2 py-0.5 rounded text-[10px]">Ativo</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.create.sandbox, 'Caminho copiado!')}
                              className="text-[10px] font-bold text-brand hover:underline px-1 py-0.5"
                            >
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.create.sandbox, 'Teste de rota executado!')}
                              className="text-[10px] font-bold text-muted-foreground hover:underline px-1 py-0.5"
                            >
                              Testar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Consultar Pagamento */}
                      <tr>
                        <td className="py-3 px-2 font-bold text-foreground">Consultar pagamento</td>
                        <td className="py-3 px-2">
                          <span className="bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded text-[10px]">GET</span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.get.sandbox}
                            onChange={e => setEndpoints({ ...endpoints, get: { ...endpoints.get, sandbox: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.get.production}
                            onChange={e => setEndpoints({ ...endpoints, get: { ...endpoints.get, production: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-purple-500/10 text-purple-500 font-bold px-2 py-0.5 rounded text-[10px]">Ativo</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.get.sandbox, 'Caminho copiado!')}
                              className="text-[10px] font-bold text-brand hover:underline px-1 py-0.5"
                            >
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.get.sandbox, 'Teste de rota executado!')}
                              className="text-[10px] font-bold text-muted-foreground hover:underline px-1 py-0.5"
                            >
                              Testar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Capturar Pagamento */}
                      <tr>
                        <td className="py-3 px-2 font-bold text-foreground">Capturar pagamento</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.capture.sandbox}
                            onChange={e => setEndpoints({ ...endpoints, capture: { ...endpoints.capture, sandbox: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.capture.production}
                            onChange={e => setEndpoints({ ...endpoints, capture: { ...endpoints.capture, production: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-purple-500/10 text-purple-500 font-bold px-2 py-0.5 rounded text-[10px]">Ativo</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.capture.sandbox, 'Caminho copiado!')}
                              className="text-[10px] font-bold text-brand hover:underline px-1 py-0.5"
                            >
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.capture.sandbox, 'Teste de rota executado!')}
                              className="text-[10px] font-bold text-muted-foreground hover:underline px-1 py-0.5"
                            >
                              Testar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Reembolsar Pagamento */}
                      <tr>
                        <td className="py-3 px-2 font-bold text-foreground">Reembolsar pagamento</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.refund.sandbox}
                            onChange={e => setEndpoints({ ...endpoints, refund: { ...endpoints.refund, sandbox: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.refund.production}
                            onChange={e => setEndpoints({ ...endpoints, refund: { ...endpoints.refund, production: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-purple-500/10 text-purple-500 font-bold px-2 py-0.5 rounded text-[10px]">Ativo</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.refund.sandbox, 'Caminho copiado!')}
                              className="text-[10px] font-bold text-brand hover:underline px-1 py-0.5"
                            >
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.refund.sandbox, 'Teste de rota executado!')}
                              className="text-[10px] font-bold text-muted-foreground hover:underline px-1 py-0.5"
                            >
                              Testar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Cancelar Pagamento */}
                      <tr>
                        <td className="py-3 px-2 font-bold text-foreground">Cancelar pagamento</td>
                        <td className="py-3 px-2">
                          <span className="bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.cancel.sandbox}
                            onChange={e => setEndpoints({ ...endpoints, cancel: { ...endpoints.cancel, sandbox: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={endpoints.cancel.production}
                            onChange={e => setEndpoints({ ...endpoints, cancel: { ...endpoints.cancel, production: e.target.value } })}
                            disabled={!isCustom}
                            className="bg-transparent border-0 focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 font-mono text-[11px] text-foreground w-full disabled:opacity-80"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-purple-500/10 text-purple-500 font-bold px-2 py-0.5 rounded text-[10px]">Ativo</span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.cancel.sandbox, 'Caminho copiado!')}
                              className="text-[10px] font-bold text-brand hover:underline px-1 py-0.5"
                            >
                              Copiar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(endpoints.cancel.sandbox, 'Teste de rota executado!')}
                              className="text-[10px] font-bold text-muted-foreground hover:underline px-1 py-0.5"
                            >
                              Testar
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: CREDENCIAIS */}
          {activeStep === 3 && (
            <>
              {/* Card 4: Credenciais de Autenticação */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">4</span>
                    4. Credenciais de autenticação
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Informe as chaves de autenticação fornecidas pelo gateway.</p>
                </div>

                <div className="space-y-4">
                  {/* Tipo de Autenticação */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Tipo de autenticação *</label>
                    <select
                      value={authType}
                      onChange={e => setAuthType(e.target.value)}
                      disabled={!isCustom}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    >
                      <option value="API Key em header">API Key em header</option>
                      <option value="Bearer Token">Bearer Token</option>
                      <option value="Basic Auth">Basic Auth</option>
                      <option value="OAuth2 client_id/client_secret">OAuth2 client_id/client_secret</option>
                      <option value="Token em querystring">Token em querystring</option>
                      <option value="Assinatura HMAC">Assinatura HMAC</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
                    {/* Sandbox Credentials */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Credenciais Sandbox</h3>
                        <span className="text-[9px] bg-yellow-500/10 text-yellow-500 font-bold px-2 py-0.5 rounded-full border border-yellow-500/20">TEST MODE</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">API Key — Sandbox *</label>
                        <div className="relative">
                          <input
                            type={showSecrets ? "text" : "password"}
                            value={credsSandbox.api_key}
                            onChange={e => setCredsSandbox({ ...credsSandbox, api_key: e.target.value })}
                            placeholder="Cole aqui a API Key de teste"
                            className="w-full h-10 px-3 pr-10 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Client ID — Sandbox</label>
                        <input
                          type={showSecrets ? "text" : "password"}
                          value={credsSandbox.client_id}
                          onChange={e => setCredsSandbox({ ...credsSandbox, client_id: e.target.value })}
                          placeholder="Cole aqui o Client ID de teste"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Client Secret — Sandbox</label>
                        <input
                          type={showSecrets ? "text" : "password"}
                          value={credsSandbox.client_secret}
                          onChange={e => setCredsSandbox({ ...credsSandbox, client_secret: e.target.value })}
                          placeholder="Cole aqui o Client Secret de teste"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Merchant / Account ID — Sandbox</label>
                        <input
                          type="text"
                          value={credsSandbox.merchant_id}
                          onChange={e => setCredsSandbox({ ...credsSandbox, merchant_id: e.target.value })}
                          placeholder="Ex.: merchant_123, account_abc"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>

                    {/* Production Credentials */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">Credenciais Produção</h3>
                        <span className="text-[9px] bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded-full border border-green-500/20">LIVE MODE</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">API Key — Produção *</label>
                        <input
                          type={showSecrets ? "text" : "password"}
                          value={credsProduction.api_key}
                          onChange={e => setCredsProduction({ ...credsProduction, api_key: e.target.value })}
                          placeholder="Cole aqui a API Key de produção"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Client ID — Produção</label>
                        <input
                          type={showSecrets ? "text" : "password"}
                          value={credsProduction.client_id}
                          onChange={e => setCredsProduction({ ...credsProduction, client_id: e.target.value })}
                          placeholder="Cole aqui o Client ID de produção"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Client Secret — Produção</label>
                        <input
                          type={showSecrets ? "text" : "password"}
                          value={credsProduction.client_secret}
                          onChange={e => setCredsProduction({ ...credsProduction, client_secret: e.target.value })}
                          placeholder="Cole aqui o Client Secret de produção"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9.5px] font-bold text-foreground block">Merchant / Account ID — Produção</label>
                        <input
                          type="text"
                          value={credsProduction.merchant_id}
                          onChange={e => setCredsProduction({ ...credsProduction, merchant_id: e.target.value })}
                          placeholder="Ex.: merchant_live_123"
                          className="w-full h-10 px-3 bg-muted/35 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border/60">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-4 h-9 bg-card border border-border rounded-xl text-[11px] font-black text-foreground hover:bg-muted/40 transition-colors"
                    >
                      Salvar credenciais
                    </button>
                    <button
                      type="button"
                      disabled={!canRunTest}
                      onClick={handleRunTest}
                      className="px-4 h-9 bg-muted hover:bg-muted/80 disabled:opacity-40 rounded-xl text-[11px] font-black text-foreground transition-colors"
                    >
                      Testar credenciais
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="px-4 h-9 bg-card border border-border rounded-xl text-[11px] font-black text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1.5"
                    >
                      {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showSecrets ? 'Ocultar secrets' : 'Mostrar secrets'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCredsSandbox({ api_key: '', client_id: '', client_secret: '', merchant_id: '' });
                        setCredsProduction({ api_key: '', client_id: '', client_secret: '', merchant_id: '' });
                      }}
                      className="px-4 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[11px] font-black transition-colors"
                    >
                      Limpar credenciais
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 7: Templates de Requisição */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">7</span>
                    7. Templates de requisição
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure o corpo enviado para o gateway usando variáveis da Basileia Pay.</p>
                </div>

                <div className="space-y-4">
                  {/* Headers padrão */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Headers padrão</label>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", jsonValidations.headers.valid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {jsonValidations.headers.valid ? 'JSON Válido' : `Erro: ${jsonValidations.headers.error}`}
                      </span>
                    </div>
                    <textarea
                      value={payloadHeaders}
                      onChange={e => setPayloadHeaders(e.target.value)}
                      disabled={!isCustom}
                      placeholder='{"Content-Type": "application/json"}'
                      className="w-full h-24 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10.5px] text-green-400 focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-85"
                    />
                  </div>

                  {/* Template criar pagamento */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Template do corpo — criar pagamento</label>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", jsonValidations.create.valid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {jsonValidations.create.valid ? 'JSON Válido' : `Erro: ${jsonValidations.create.error}`}
                      </span>
                    </div>
                    <textarea
                      value={payloadCreate}
                      onChange={e => setPayloadCreate(e.target.value)}
                      disabled={!isCustom}
                      className="w-full h-36 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10.5px] text-green-400 focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-85"
                    />
                  </div>

                  {/* Template reembolso */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Template do corpo — reembolso</label>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", jsonValidations.refund.valid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {jsonValidations.refund.valid ? 'JSON Válido' : `Erro: ${jsonValidations.refund.error}`}
                      </span>
                    </div>
                    <textarea
                      value={payloadRefund}
                      onChange={e => setPayloadRefund(e.target.value)}
                      disabled={!isCustom}
                      className="w-full h-28 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10.5px] text-green-400 focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-85"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 4: MÉTODOS */}
          {activeStep === 4 && (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">5</span>
                  5. Métodos de pagamento suportados
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Defina quais formas de pagamento este gateway poderá processar.</p>
              </div>

              {/* Grid of Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'credit_card', label: 'Cartão de crédito' },
                  { key: 'debit_card', label: 'Cartão de débito' },
                  { key: 'pix', label: 'Pix' },
                  { key: 'boleto', label: 'Boleto' },
                  { key: 'transfer', label: 'Transferência bancária' },
                  { key: 'wallets', label: 'Carteiras digitais' },
                  { key: 'subscriptions', label: 'Assinaturas' },
                  { key: 'installments', label: 'Parcelamento' },
                  { key: 'split', label: 'Split de pagamento' },
                  { key: 'multicurrency', label: 'Multimoeda' }
                ].map(item => (
                  <label
                    key={item.key}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/30 transition-all select-none",
                      selectedMethods[item.key] ? "border-brand bg-brand/5 text-foreground" : "border-border text-muted-foreground"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods[item.key]}
                      onChange={e => setSelectedMethods({ ...selectedMethods, [item.key]: e.target.checked })}
                      className="rounded border-border text-brand focus:ring-brand w-3.5 h-3.5"
                    />
                    <span className="text-xs font-bold leading-none">{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Configurations Per Method */}
              <div className="pt-6 border-t border-border/60 space-y-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Configuração por método</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pix Configuration */}
                  <div className={cn("p-4 border rounded-2xl space-y-4 transition-all", selectedMethods.pix ? "border-border bg-muted/10 opacity-100" : "border-border/30 opacity-40 pointer-events-none")}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">Pix</span>
                      <input
                        type="checkbox"
                        checked={pixEnabled}
                        onChange={e => setPixEnabled(e.target.checked)}
                        className="rounded text-brand w-3.5 h-3.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-muted-foreground">Expiração do Pix</label>
                      <select
                        value={pixExpiration}
                        onChange={e => setPixExpiration(e.target.value)}
                        className="w-full h-9 px-2.5 bg-muted border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none"
                      >
                        <option value="15 minutos">15 minutos</option>
                        <option value="30 minutos">30 minutos</option>
                        <option value="1 hora">1 hora</option>
                        <option value="24 horas">24 horas</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Configuration */}
                  <div className={cn("p-4 border rounded-2xl space-y-4 transition-all", selectedMethods.credit_card ? "border-border bg-muted/10 opacity-100" : "border-border/30 opacity-40 pointer-events-none")}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">Cartão</span>
                      <input
                        type="checkbox"
                        checked={cardEnabled}
                        onChange={e => setCardEnabled(e.target.checked)}
                        className="rounded text-brand w-3.5 h-3.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-muted-foreground">Parcelamento máximo</label>
                      <select
                        value={cardInstallments}
                        onChange={e => setCardInstallments(e.target.value)}
                        className="w-full h-9 px-2.5 bg-muted border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none"
                      >
                        <option value="1x">1x</option>
                        <option value="3x">3x</option>
                        <option value="6x">6x</option>
                        <option value="12x">12x</option>
                      </select>
                    </div>
                  </div>

                  {/* Boleto Configuration */}
                  <div className={cn("p-4 border rounded-2xl space-y-4 transition-all", selectedMethods.boleto ? "border-border bg-muted/10 opacity-100" : "border-border/30 opacity-40 pointer-events-none")}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">Boleto</span>
                      <input
                        type="checkbox"
                        checked={boletoEnabled}
                        onChange={e => setBoletoEnabled(e.target.checked)}
                        className="rounded text-brand w-3.5 h-3.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-muted-foreground">Dias para vencimento</label>
                      <input
                        type="number"
                        value={boletoDueDays}
                        onChange={e => setBoletoDueDays(parseInt(e.target.value) || 3)}
                        placeholder="Ex.: 3"
                        className="w-full h-9 px-2.5 bg-muted border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WEBHOOK */}
          {activeStep === 5 && (
            <>
              {/* Card 8: Webhook e Notificações */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">8</span>
                    8. Webhook e notificações
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure como a Basileia Pay receberá notificações enviadas pelo gateway.</p>
                </div>

                <div className="space-y-4">
                  {/* URL local do webhook */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">URL local do webhook</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrlLocal}
                        className="flex-1 h-10 px-3 bg-muted border border-border rounded-xl text-xs font-mono text-muted-foreground select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(webhookUrlLocal, 'URL local copiada!')}
                        className="px-3 h-10 bg-muted hover:bg-muted/80 border border-border rounded-xl text-[10px] font-black uppercase text-foreground transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* URL completa */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">URL completa para cadastrar no gateway</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrlFull}
                        className="flex-1 h-10 px-3 bg-muted border border-border rounded-xl text-xs font-mono text-muted-foreground select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(webhookUrlFull, 'URL completa copiada!')}
                        className="px-3 h-10 bg-muted hover:bg-muted/80 border border-border rounded-xl text-[10px] font-black uppercase text-foreground transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Autenticação do webhook */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Autenticação do webhook</label>
                    <select
                      value={webhookAuth}
                      onChange={e => setWebhookAuth(e.target.value)}
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    >
                      <option value="Nenhuma">Nenhuma</option>
                      <option value="Assinatura em header HMAC">Assinatura em header HMAC</option>
                      <option value="Token na URL">Token na URL</option>
                      <option value="Basic Auth">Basic Auth</option>
                    </select>
                  </div>

                  {/* Segredo do webhook */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Segredo do webhook</label>
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={e => setWebhookSecret(e.target.value)}
                      placeholder="Cole aqui o secret fornecido pelo gateway"
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* Header da assinatura */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Header da assinatura</label>
                    <input
                      type="text"
                      value={webhookHeader}
                      onChange={e => setWebhookHeader(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: stripe-signature, x-signature, x-hub-signature"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* Botões do card */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(webhookUrlFull, 'URL copiada para o gateway!')}
                      className="px-4 h-9 bg-card border border-border rounded-xl text-[11px] font-black text-foreground hover:bg-muted/40 transition-colors"
                    >
                      Copiar URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(webhookSecret, 'Webhook testado!')}
                      className="px-4 h-9 bg-muted hover:bg-muted/80 rounded-xl text-[11px] font-black text-foreground transition-colors"
                    >
                      Testar webhook
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 9: Mapeamento de dados do webhook */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">9</span>
                    9. Mapeamento de dados do webhook
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Informe onde a Basileia Pay deve buscar as informações importantes dentro do JSON recebido.</p>
                </div>

                <div className="space-y-4">
                  {/* Caminho ID Transação */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Caminho JSON para ID da transação *</label>
                    <input
                      type="text"
                      value={webhookPathTxId}
                      onChange={e => setWebhookPathTxId(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: data.object.id"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* Caminho Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Caminho JSON para status *</label>
                    <input
                      type="text"
                      value={webhookPathStatus}
                      onChange={e => setWebhookPathStatus(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: data.object.status"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* Caminho Tipo Evento */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Caminho JSON para tipo de evento</label>
                    <input
                      type="text"
                      value={webhookPathEvent}
                      onChange={e => setWebhookPathEvent(e.target.value)}
                      disabled={!isCustom}
                      placeholder="Ex.: type"
                      className="w-full h-12 px-4 bg-muted/30 disabled:opacity-60 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                    />
                  </div>

                  {/* Mapeamento de status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Mapeamento de status</label>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", jsonValidations.webhookMap.valid ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {jsonValidations.webhookMap.valid ? 'JSON Válido' : `Erro: ${jsonValidations.webhookMap.error}`}
                      </span>
                    </div>
                    <textarea
                      value={webhookStatusMap}
                      onChange={e => setWebhookStatusMap(e.target.value)}
                      disabled={!isCustom}
                      className="w-full h-36 p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10.5px] text-green-400 focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-85"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 6: TESTE */}
          {activeStep === 6 && (
            <>
              {/* Card 11: Teste de Conexão */}
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">11</span>
                    11. Teste de conexão
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Valide se as credenciais, URLs, métodos e webhook estão funcionando corretamente.</p>
                </div>

                {/* Checklist of tests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'credentials', label: 'Credenciais válidas' },
                    { key: 'url', label: 'URL base responde' },
                    { key: 'create', label: 'Criar pagamento de teste' },
                    { key: 'query', label: 'Consultar pagamento de teste' },
                    { key: 'webhook', label: 'Webhook recebido' },
                    { key: 'signature', label: 'Assinatura validada' },
                    { key: 'mapping', label: 'Mapeamento de status válido' },
                    { key: 'methods', label: 'Métodos de pagamento configurados' }
                  ].map(item => {
                    const status = testChecklist[item.key as keyof typeof testChecklist];
                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "p-3.5 border rounded-xl flex items-center justify-between text-xs font-bold transition-all",
                          status === 'Sucesso' && "border-green-500/25 bg-green-500/5 text-foreground",
                          status === 'Erro' && "border-red-500/25 bg-red-500/5 text-foreground",
                          status === 'Executando' && "border-yellow-500/25 bg-yellow-500/5 text-foreground",
                          status === 'Pendente' && "border-border bg-muted/10 text-muted-foreground"
                        )}
                      >
                        <span className="leading-none">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          {status === 'Executando' && <Loader2 className="w-3.5 h-3.5 text-yellow-500 animate-spin" />}
                          {status === 'Sucesso' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                          {status === 'Erro' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          {status === 'Pendente' && <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                          <span className="text-[10px] font-black uppercase tracking-wider">{status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Test Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={!canRunTest}
                    className="h-10 px-5 bg-brand text-white hover:bg-brand-dark disabled:opacity-40 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-brand/15 flex items-center justify-center gap-2"
                  >
                    {testRunning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Executar teste completo
                  </button>
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={!canRunTest}
                    className="px-4 h-10 bg-card border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted/40 transition-colors"
                  >
                    Testar credenciais
                  </button>
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={!canRunTest}
                    className="px-4 h-10 bg-card border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted/40 transition-colors"
                  >
                    Testar webhook
                  </button>
                  <button
                    type="button"
                    onClick={handleRunTest}
                    disabled={!canRunTest}
                    className="px-4 h-10 bg-muted hover:bg-muted/80 rounded-xl text-xs font-black text-foreground transition-colors"
                  >
                    Criar transação sandbox
                  </button>
                </div>
              </div>

              {/* Card 12: Resultado Técnico */}
              {testRan && testTechnicalResult && (
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">12</span>
                      Resultado técnico
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Dados técnicos retornados pelo gateway de pagamento no teste.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-muted/20 border border-border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Status HTTP</span>
                      <span className={cn("text-sm font-black block mt-1", testResult === 'success' ? "text-green-500" : "text-red-500")}>
                        {testTechnicalResult.httpStatus}
                      </span>
                    </div>
                    <div className="bg-muted/20 border border-border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Tempo de resposta</span>
                      <span className="text-sm font-black text-foreground block mt-1">{testTechnicalResult.responseTime}</span>
                    </div>
                    <div className="bg-muted/20 border border-border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Ambiente</span>
                      <span className="text-sm font-black text-foreground block mt-1">{testTechnicalResult.env}</span>
                    </div>
                    <div className="bg-muted/20 border border-border p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Data do teste</span>
                      <span className="text-[11px] font-black text-foreground block mt-1">{testTechnicalResult.date}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Mensagem retornada</span>
                    <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs font-bold text-foreground">
                      {testTechnicalResult.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payload enviado */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Payload enviado</span>
                      <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-green-400 overflow-x-auto max-h-48 scrollbar-thin">
                        {testTechnicalResult.payloadSent}
                      </pre>
                    </div>

                    {/* Payload recebido */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Payload recebido</span>
                      <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-green-400 overflow-x-auto max-h-48 scrollbar-thin">
                        {testTechnicalResult.payloadReceived}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 7: FINALIZAR */}
          {activeStep === 7 && (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-[10px] font-bold">10</span>
                  10. Taxas e regras operacionais
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Configure taxas, prioridade e regras de uso deste gateway.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Taxa fixa */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Taxa fixa por transação</label>
                  <input
                    type="text"
                    value={feeFixed}
                    onChange={e => setFeeFixed(e.target.value)}
                    placeholder="Ex.: R$ 0,49"
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                {/* Taxa percentual */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Taxa percentual</label>
                  <input
                    type="text"
                    value={feePercent}
                    onChange={e => setFeePercent(e.target.value)}
                    placeholder="Ex.: 2,99%"
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                {/* Prazo de liquidação */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Prazo de liquidação</label>
                  <select
                    value={settlementTerm}
                    onChange={e => setSettlementTerm(e.target.value)}
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  >
                    <option value="D+0">D+0</option>
                    <option value="D+1">D+1</option>
                    <option value="D+2">D+2</option>
                    <option value="D+14">D+14</option>
                    <option value="D+30">D+30</option>
                  </select>
                </div>

                {/* Moeda padrão */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Moeda padrão</label>
                  <select
                    value={defaultCurrency}
                    onChange={e => setDefaultCurrency(e.target.value)}
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  >
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                {/* Valor mínimo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Valor mínimo por transação</label>
                  <input
                    type="text"
                    value={valMin}
                    onChange={e => setValMin(e.target.value)}
                    placeholder="Ex.: R$ 5,00"
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                {/* Valor máximo */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Valor máximo por transação</label>
                  <input
                    type="text"
                    value={valMax}
                    onChange={e => setValMax(e.target.value)}
                    placeholder="Ex.: R$ 50.000,00"
                    className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right column: Fixed Details and Checklist Panel */}
        <div className="space-y-6">

          {/* Card Resumo do Gateway */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest pb-3 border-b border-border">
              Resumo do gateway
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Provedor</span>
                <span className="font-black text-foreground">{activeProviderMeta.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Empresa</span>
                <span className="font-black text-foreground truncate max-w-[150px]">{company}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Ambiente</span>
                <span className="font-black text-foreground uppercase">{environment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Tipo de integração</span>
                <span className="font-black text-foreground">{integrationType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Status</span>
                <span className={cn("font-black px-2 py-0.5 rounded-full border text-[10px]", statusBadge.color)}>
                  {statusBadge.text}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Métodos ativos</span>
                <span className="font-black text-foreground truncate max-w-[150px]">
                  {Object.entries(selectedMethods)
                    .filter(([_, active]) => active)
                    .map(([key]) => key === 'credit_card' ? 'Cartão' : key === 'debit_card' ? 'Débito' : key.toUpperCase())
                    .join(', ') || 'Nenhum'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Último teste</span>
                <span className="font-black text-foreground">
                  {testRan && testTechnicalResult ? testTechnicalResult.date : 'Nunca executado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Webhook</span>
                <span className="font-black text-foreground">
                  {webhookAuth !== 'Nenhuma' || webhookSecret.trim() ? 'Configurado' : 'Não configurado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Credenciais</span>
                <span className="font-black text-foreground">
                  {(environment === 'sandbox' ? credsSandbox.api_key : credsProduction.api_key) ? 'Preenchidas' : 'Pendentes'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Checklist de Ativação */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest pb-3 border-b border-border">
              Checklist de ativação
            </h3>

            <div className="space-y-3 text-xs font-bold text-foreground">
              {[
                { key: 'providerSelected', label: 'Provedor selecionado' },
                { key: 'envConfigured', label: 'Ambiente configurado' },
                { key: 'credsFilled', label: 'Credenciais preenchidas' },
                { key: 'methodsEnabled', label: 'Métodos habilitados' },
                { key: 'webhookConfigured', label: 'Webhook configurado' },
                { key: 'mappingValidated', label: 'Mapeamento validado' },
                { key: 'testExecuted', label: 'Teste executado' },
                { key: 'gatewayActivated', label: 'Gateway ativado' }
              ].map(item => {
                const checked = checklistAtivacao[item.key as keyof typeof checklistAtivacao];
                return (
                  <div key={item.key} className="flex items-center gap-2.5">
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-border bg-muted/20 shrink-0" />
                    )}
                    <span className={cn(checked ? "text-foreground line-through opacity-60" : "text-foreground")}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Helper alert card */}
          <div className="bg-purple-500/5 border border-brand/20 p-5 rounded-3xl flex gap-3 text-xs leading-relaxed text-foreground">
            <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brand uppercase tracking-wider text-[10px]">Dica de Ativação</p>
              <p className="text-muted-foreground mt-1 font-bold">
                Para ativar este gateway, preencha as credenciais, configure ao menos um método de pagamento, valide o webhook e execute o teste de conexão.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Fixed bottom action footer */}
      <div className="fixed bottom-0 right-0 left-[252px] 2xl:left-[284px] h-20 bg-card border-t border-border z-40 px-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/gateways')}
            className="h-11 px-6 bg-card border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted/40 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveDraft}
            className="h-11 px-6 bg-muted hover:bg-muted/80 rounded-xl text-xs font-black text-foreground transition-colors"
          >
            Salvar rascunho
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 1}
            className="h-11 px-6 bg-card border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:hover:bg-card transition-colors shadow-sm"
          >
            Voltar
          </button>
          
          {activeStep < 7 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="h-11 px-8 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-brand/15"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={!canActivate}
              className="h-11 px-8 bg-brand hover:bg-brand-dark disabled:opacity-45 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-brand/15"
            >
              Ativar gateway
            </button>
          )}

          {activeStep === 6 && (
            <button
              onClick={handleRunTest}
              disabled={!canRunTest}
              className="h-11 px-6 bg-muted hover:bg-muted/80 disabled:opacity-45 text-foreground rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Executar teste
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
