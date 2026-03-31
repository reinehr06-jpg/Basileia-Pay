<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') - Checkout</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="/css/checkout.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="layout-wrapper">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                <h2>Checkout</h2>
                <span>Payment Platform</span>
            </div>
            <div class="sidebar-user">
                <div class="sidebar-user-avatar">{{ substr(auth()->user()->name ?? 'A', 0, 1) }}</div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name">{{ auth()->user()->name ?? 'Admin' }}</div>
                    <div class="sidebar-user-role">{{ ucfirst(auth()->user()->role ?? 'admin') }}</div>
                </div>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Visão Geral</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.index') }}" class="{{ request()->routeIs('dashboard.index') ? 'active' : '' }}"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Operação</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.transactions') }}" class="{{ request()->routeIs('dashboard.transactions*') ? 'active' : '' }}"><i class="fas fa-money-bill-trend-up"></i> Transações</a></li>
                    <li><a href="{{ route('dashboard.webhooks') }}" class="{{ request()->routeIs('dashboard.webhooks*') ? 'active' : '' }}"><i class="fas fa-bolt"></i> Webhooks</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Integrações</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.integrations.index') }}" class="{{ request()->routeIs('dashboard.integrations*') ? 'active' : '' }}"><i class="fas fa-store"></i> Basileia Vendas</a></li>
                    <li><a href="{{ route('dashboard.integrations.index') }}" class="{{ request()->routeIs('dashboard.integrations*') ? 'active' : '' }}"><i class="fas fa-globe"></i> Site Contratação</a></li>
                    <li><a href="{{ route('dashboard.events.index') }}" class="{{ request()->routeIs('dashboard.events*') ? 'active' : '' }}"><i class="fas fa-link"></i> Eventos / Links</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Financeiro</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.gateways.index') }}" class="{{ request()->routeIs('dashboard.gateways*') ? 'active' : '' }}"><i class="fas fa-credit-card"></i> Gateways</a></li>
                    <li><a href="{{ route('dashboard.reports') }}" class="{{ request()->routeIs('dashboard.reports*') ? 'active' : '' }}"><i class="fas fa-chart-bar"></i> Relatórios</a></li>
                </ul>
            </div>
            @if(auth()->user()?->isSuperAdmin())
            <div class="sidebar-section">
                <div class="sidebar-section-title">Sistema</div>
                <ul class="sidebar-nav">
                    <li><a href="{{ route('dashboard.companies.index') }}" class="{{ request()->routeIs('dashboard.companies*') ? 'active' : '' }}"><i class="fas fa-building"></i> Empresas</a></li>
                </ul>
            </div>
            @endif
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
                    <span class="topbar-title">@yield('title', 'Dashboard')</span>
                </div>
                <div class="topbar-actions">
                    <span class="topbar-user">{{ auth()->user()->name ?? 'Usuário' }}</span>
                    <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                        @csrf
                        <button type="submit" class="topbar-logout">Sair</button>
                    </form>
                </div>
            </header>
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
    @yield('scripts')
</body>
</html>
