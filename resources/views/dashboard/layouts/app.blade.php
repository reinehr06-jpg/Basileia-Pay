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
    </style>
    @stack('styles')
</head>
<body>
    <div class="layout-wrapper">
        <!-- Compact Sidebar -->
        <aside class="sidebar">
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
                    <span class="topbar-title">@yield('title', 'Início')</span>
                </div>
                <div class="topbar-actions">
                    <span class="topbar-user" style="font-weight: 700; color: var(--primary);">{{ auth()->user()->name ?? 'Usuário' }}</span>
                    <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                        @csrf
                        <button type="submit" class="topbar-logout" style="border: none; background: none; color: #f87171; font-weight: 700; cursor: pointer; padding: 6px 12px;">Sair</button>
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
