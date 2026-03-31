<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title><?php echo $__env->yieldContent('title', 'Dashboard'); ?> - Checkout</title>
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
                <div class="sidebar-user-avatar"><?php echo e(substr(auth()->user()->name ?? 'A', 0, 1)); ?></div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name"><?php echo e(auth()->user()->name ?? 'Admin'); ?></div>
                    <div class="sidebar-user-role"><?php echo e(ucfirst(auth()->user()->role ?? 'admin')); ?></div>
                </div>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Visão Geral</div>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo e(route('dashboard.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.index') ? 'active' : ''); ?>"><i class="fas fa-chart-pie"></i> Dashboard</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Operação</div>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo e(route('dashboard.transactions')); ?>" class="<?php echo e(request()->routeIs('dashboard.transactions*') ? 'active' : ''); ?>"><i class="fas fa-money-bill-trend-up"></i> Transações</a></li>
                    <li><a href="<?php echo e(route('dashboard.webhooks')); ?>" class="<?php echo e(request()->routeIs('dashboard.webhooks*') ? 'active' : ''); ?>"><i class="fas fa-bolt"></i> Webhooks</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Integrações</div>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo e(route('dashboard.integrations.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.integrations*') ? 'active' : ''); ?>"><i class="fas fa-store"></i> Basileia Vendas</a></li>
                    <li><a href="<?php echo e(route('dashboard.integrations.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.integrations*') ? 'active' : ''); ?>"><i class="fas fa-globe"></i> Site Contratação</a></li>
                    <li><a href="<?php echo e(route('dashboard.events.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.events*') ? 'active' : ''); ?>"><i class="fas fa-link"></i> Eventos / Links</a></li>
                </ul>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Financeiro</div>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo e(route('dashboard.gateways.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.gateways*') ? 'active' : ''); ?>"><i class="fas fa-credit-card"></i> Gateways</a></li>
                    <li><a href="<?php echo e(route('dashboard.reports')); ?>" class="<?php echo e(request()->routeIs('dashboard.reports*') ? 'active' : ''); ?>"><i class="fas fa-chart-bar"></i> Relatórios</a></li>
                </ul>
            </div>
            <?php if(auth()->user()?->isSuperAdmin()): ?>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Sistema</div>
                <ul class="sidebar-nav">
                    <li><a href="<?php echo e(route('dashboard.companies.index')); ?>" class="<?php echo e(request()->routeIs('dashboard.companies*') ? 'active' : ''); ?>"><i class="fas fa-building"></i> Empresas</a></li>
                </ul>
            </div>
            <?php endif; ?>
            <div class="sidebar-logout">
                <form method="POST" action="<?php echo e(route('logout')); ?>" id="logout-form-sidebar">
                    <?php echo csrf_field(); ?>
                    <a href="#" onclick="document.getElementById('logout-form-sidebar').submit(); return false;"><i class="fas fa-sign-out-alt"></i> Sair</a>
                </form>
            </div>
        </aside>

        <div class="main-content">
            <header class="topbar">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <button class="hamburger" onclick="document.getElementById('sidebar').classList.toggle('open')"><i class="fas fa-bars"></i></button>
                    <span class="topbar-title"><?php echo $__env->yieldContent('title', 'Dashboard'); ?></span>
                </div>
                <div class="topbar-actions">
                    <span class="topbar-user"><?php echo e(auth()->user()->name ?? 'Usuário'); ?></span>
                    <form method="POST" action="<?php echo e(route('logout')); ?>" style="display: inline;">
                        <?php echo csrf_field(); ?>
                        <button type="submit" class="topbar-logout">Sair</button>
                    </form>
                </div>
            </header>
            <main class="page-content">
                <?php if(session('success')): ?>
                    <div class="alert alert-success animate-up"><i class="fas fa-check-circle"></i> <?php echo e(session('success')); ?></div>
                <?php endif; ?>
                <?php if(session('error')): ?>
                    <div class="alert alert-danger animate-up"><i class="fas fa-exclamation-circle"></i> <?php echo e(session('error')); ?></div>
                <?php endif; ?>
                <?php echo $__env->yieldContent('content'); ?>
            </main>
        </div>
    </div>
    <?php echo $__env->yieldContent('scripts'); ?>
</body>
</html>
<?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/layouts/app.blade.php ENDPATH**/ ?>