<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Dashboard' }} - Basileia Secure</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <link rel="stylesheet" href="/css/checkout.css?v={{ time() }}">
    <style>
        /* INLINED CRITICAL DASHBOARD CSS - PURPLE THEME */
        :root {
            --bg-main: #f8fafc;
            --bg-sidebar: #111827;
            --primary: #7c3aed; /* Basileia Purple */
            --border: #e2e8f0;
        }
        .layout-wrapper { display: flex; min-height: 100vh; background: var(--bg-main); margin: 0; }
        .sidebar { 
            width: 220px; background: var(--bg-sidebar); color: white; 
            position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
        }
        .main-content { flex: 1; margin-left: 220px; min-height: 100vh; display: flex; flex-direction: column; }
        .topbar { 
            height: 56px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
            border-bottom: 1px solid var(--border); display: flex; align-items: center; 
            padding: 0 24px; position: sticky; top: 0; z-index: 50; justify-content: space-between;
        }
        .dropdown-menu.show { display: block !important; }
        .dropdown-menu a:hover { background: #f8fafc; }
        .hamburger { border: none; background: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 8px; display: none; }
        @media (max-width: 1024px) { .hamburger { display: block; } }
    </style>
    @stack('styles')
</head>
<body>
    <div class="layout-wrapper">
        <!-- Compact Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                <h2 style="font-size: 1.4rem; color: #fff;">Basileia</h2>
                <span style="color: var(--primary); font-weight: 800; font-size: 0.7rem; text-transform: uppercase;">Secure</span>
            </div>

            <div class="sidebar-user">
                <div class="sidebar-user-avatar">
                    {{ substr(Auth::user()->name ?? 'A', 0, 1) }}
                </div>
                <div style="flex: 1; overflow: hidden;">
                    <div class="sidebar-user-name">{{ Auth::user()->name ?? 'Admin' }}</div>
                    <div class="sidebar-user-role">Super Usuário</div>
                </div>
            </div>

            <!-- Operação -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Operação</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.index') }}" class="{{ request()->routeIs('dashboard.index') ? 'active' : '' }}"><i class="fas fa-chart-line"></i><span>Início</span></a></li>
                    <li><a href="{{ route('dashboard.transactions') }}" class="{{ request()->routeIs('dashboard.transactions*') ? 'active' : '' }}"><i class="fas fa-exchange-alt"></i><span>Transações</span></a></li>
                    <li><a href="{{ route('dashboard.tokenizer') }}" class="{{ request()->routeIs('dashboard.tokenizer') ? 'active' : '' }}"><i class="fas fa-shield-halved"></i><span>Gerador de Link</span></a></li>
                    <li><a href="{{ route('dashboard.events.index') }}" class="{{ request()->routeIs('dashboard.events*') ? 'active' : '' }}"><i class="fas fa-link"></i><span>Links de Pagto</span></a></li>
                </ul>
            </div>

<!-- Sistemas -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Sistemas</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.gateways.index') }}" class="{{ request()->routeIs('dashboard.gateways*') ? 'active' : '' }}"><i class="fas fa-wallet"></i><span>Gateways</span></a></li>
                    <li><a href="{{ route('dashboard.integrations.index') }}" class="{{ request()->routeIs('dashboard.integrations*') ? 'active' : '' }}"><i class="fas fa-plug"></i><span>Integrações</span></a></li>
                    <li><a href="{{ route('dashboard.webhooks') }}" class="{{ request()->routeIs('dashboard.webhooks*') ? 'active' : '' }}"><i class="fas fa-tower-broadcast"></i><span>Webhooks</span></a></li>
                    <li><a href="{{ route('dashboard.settings.receipt') }}" class="{{ request()->routeIs('dashboard.settings.receipt') ? 'active' : '' }}"><i class="fas fa-file-invoice"></i><span>Comprovante</span></a></li>
                </ul>
            </div>

            <!-- Lab -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">🧪 Lab Test</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.lab') }}" class="{{ request()->routeIs('dashboard.lab*') ? 'active' : '' }}"><i class="fas fa-flask"></i><span>Lab Test</span></a></li>
                </ul>
            </div>

            <!-- Financeiro -->
            <div class="sidebar-section">
                <div class="sidebar-section-title">Financeiro</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.companies.index') }}" class="{{ request()->routeIs('dashboard.companies*') ? 'active' : '' }}"><i class="fas fa-building"></i> Empresas</a></li>
                </ul>
            </div>

            <div class="sidebar-logout">
                <form method="POST" action="{{ route('logout') }}" id="logout-form-sidebar">
                    @csrf
                    <a href="#" onclick="document.getElementById('logout-form-sidebar').submit(); return false;"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </form>
            </div>
        </aside>

        <div class="main-content">
            <header class="topbar">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <button class="hamburger" onclick="document.getElementById('sidebar').classList.toggle('open')"><i class="fas fa-bars"></i></button>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="background: var(--bg-main); color: var(--primary); padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800;">BASILEIA SECURE</span>
                        <i class="fas fa-chevron-right" style="font-size: 0.6rem; color: var(--text-muted);"></i>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">@yield('title', 'Início')</span>
                    </div>
                </div>
                <div class="topbar-actions" style="display: flex; align-items: center; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);"></div>
                        <span style="font-size: 0.75rem; font-weight: 700; color: #475569;">SISTEMA ONLINE</span>
                    </div>
                    <div style="height: 20px; width: 1px; background: var(--border);"></div>
                    <span class="topbar-user" style="font-weight: 700; color: var(--primary); font-size: 0.8rem;">{{ auth()->user()->name ?? 'Usuário' }}</span>
                </div>
            </header>

            <div class="elite-header">
                <div>
                    <h1>@yield('title', 'Dashboard')</h1>
                    <div class="elite-breadcrumb">
                        <span>Workspace</span>
                        <i class="fas fa-chevron-right" style="font-size: 0.5rem;"></i>
                        <span>{{ auth()->user()->company->name ?? 'Minha Empresa' }}</span>
                        <i class="fas fa-chevron-right" style="font-size: 0.5rem;"></i>
                        <span style="color: #fff; font-weight: 800;">@yield('title', 'Início')</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; align-items: center;">
                    @yield('header_actions')
                    
                    <div style="position: relative; display: inline-block;">
                        <button onclick="this.nextElementSibling.classList.toggle('show')" style="background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-download"></i> EXPORTAR <i class="fas fa-chevron-down" style="font-size: 0.6rem;"></i>
                        </button>
                        <div class="dropdown-menu" style="position: absolute; right: 0; top: 110%; background: white; border: 1px solid var(--border); border-radius: 12px; min-width: 160px; box-shadow: var(--shadow-lg); display: none; z-index: 100;">
                            <a href="#" style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; font-weight: 700; border-bottom: 1px solid var(--border-light);">
                                <i class="fas fa-file-pdf" style="color: #ef4444;"></i> PDF Document
                            </a>
                            <a href="#" style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; font-weight: 700; border-bottom: 1px solid var(--border-light);">
                                <i class="fas fa-file-excel" style="color: #10b981;"></i> Excel Template
                            </a>
                            <a href="#" style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; font-weight: 700;">
                                <i class="fas fa-file-csv" style="color: #64748b;"></i> CSV (Raw Data)
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <main class="page-content">
                @if(session('success'))
                    <div class="alert alert-success animate-up"><i class="fas fa-check-circle"></i> {{ session('success') }}</div>
                @endif
                @if(session('error'))
                    <div class="alert alert-danger animate-up"><i class="fas fa-exclamation-circle"></i> {{ session('error') }}</div>
                @endif
                @yield('content')
            </main>
        </div>
    </div>
    @stack('scripts')
    @yield('scripts')
</body>
</html>
