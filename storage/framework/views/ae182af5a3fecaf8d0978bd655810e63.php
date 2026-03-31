<?php $__env->startSection('title', 'Dashboard'); ?>

<?php $__env->startSection('content'); ?>
<div class="animate-up" style="animation-delay: 0.1s;">
    <div class="welcome-section">
        <div class="welcome-text">
            <h1>Olá, <?php echo e($userName ?? 'Admin'); ?> 👋</h1>
            <p>Acompanhe os resultados de <?php echo e(now()->translatedFormat('F')); ?>.</p>
        </div>
        <div class="welcome-badge">
            <span>Checkout <i class="fas fa-check-circle" style="margin-left: 8px;"></i></span>
        </div>
    </div>
</div>

<div class="kpi-grid">
    <!-- Volume Transacionado -->
    <div class="kpi-card animate-up" style="animation-delay: 0.2s;">
        <i class="fas fa-money-bill-trend-up kpi-icon"></i>
        <span class="label">Volume Transacionado</span>
        <div class="value">R$ <?php echo e(number_format($volumeMonth ?? 0, 2, ',', '.')); ?></div>
        <div class="footer">
            <span class="<?php echo e(($volumeTrend ?? 0) >= 0 ? 'trend-up' : 'trend-down'); ?>">
                <i class="fas fa-caret-<?php echo e(($volumeTrend ?? 0) >= 0 ? 'up' : 'down'); ?>"></i>
                <?php echo e(number_format(abs($volumeTrend ?? 0), 1)); ?>%
            </span>
            <span style="color: var(--text-muted); font-size: 0.7rem;">vs mês anterior</span>
        </div>
    </div>

    <!-- Taxa de Aprovação -->
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <i class="fas fa-chart-line kpi-icon"></i>
        <span class="label">Taxa de Aprovação</span>
        <div class="value"><?php echo e(number_format($approvalRate ?? 0, 1)); ?>%</div>
        <div class="footer">
            <span style="color: var(--success); font-weight: 700; font-size: 0.75rem;">
                <?php echo e($approvedCount ?? 0); ?> aprovadas
            </span>
            <span style="color: var(--text-muted); font-size: 0.7rem;">este mês</span>
        </div>
    </div>

    <!-- Integrações Ativas -->
    <div class="kpi-card animate-up" style="animation-delay: 0.4s;">
        <i class="fas fa-plug kpi-icon"></i>
        <span class="label">Integrações Ativas</span>
        <div class="value"><?php echo e($activeIntegrations ?? 0); ?></div>
        <div class="footer">
            <span style="color: var(--text-muted); font-size: 0.7rem;">
                <?php echo e($totalIntegrations ?? 0); ?> total cadastradas
            </span>
        </div>
    </div>

    <!-- Webhooks Entregues -->
    <div class="kpi-card animate-up" style="animation-delay: 0.5s;">
        <i class="fas fa-bolt kpi-icon"></i>
        <span class="label">Webhooks Entregues</span>
        <div class="value" style="color: var(--success);"><?php echo e(number_format($webhookDelivered ?? 0)); ?></div>
        <div class="footer">
            <?php if(($webhookFailed ?? 0) > 0): ?>
                <span style="color: var(--danger); font-weight: 700; font-size: 0.75rem;">
                    <?php echo e($webhookFailed); ?> falharam
                </span>
            <?php else: ?>
                <span style="color: var(--success); font-weight: 700; font-size: 0.75rem;">100% entregues</span>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="main-grid">
    <!-- Gráfico de Volume -->
    <div class="chart-container animate-up" style="animation-delay: 0.6s;">
        <div class="card-header">
            <h3>Volume de Transações</h3>
            <span class="badge badge-primary">Últimos 7 dias</span>
        </div>
        <canvas id="volumeChart" style="max-height: 280px;"></canvas>
    </div>

    <!-- Insights -->
    <div class="insights-container animate-up" style="animation-delay: 0.7s;">
        <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 5px; margin-left: 5px;">Insights Rápidos</h3>

        <div class="insight-card">
            <div class="insight-header"><i class="fas fa-shopping-basket"></i> Transações Hoje</div>
            <div class="insight-value"><?php echo e(number_format($todayTransactions ?? 0)); ?></div>
            <p class="insight-desc">R$ <?php echo e(number_format($todayVolume ?? 0, 2, ',', '.')); ?> em volume</p>
        </div>

        <div class="insight-card">
            <div class="insight-header"><i class="fas fa-credit-card"></i> Gateway Principal</div>
            <div class="insight-value"><?php echo e($defaultGateway ?? 'Nenhum'); ?></div>
            <p class="insight-desc"><?php echo e($activeGateways ?? 0); ?> gateway(s) configurado(s)</p>
        </div>

        <div class="insight-card" style="border-left: 3px solid var(--warning);">
            <div class="insight-header"><i class="fas fa-clock" style="color: var(--warning);"></i> Pendentes</div>
            <div class="insight-value" style="color: var(--warning);"><?php echo e($pendingTransactions ?? 0); ?> <small style="font-size: 0.7rem; opacity: 0.6;">transações</small></div>
            <p class="insight-desc">Aguardando processamento</p>
        </div>

        <?php if(($webhookFailed ?? 0) > 0): ?>
        <div class="insight-card" style="border-left: 3px solid var(--danger);">
            <div class="insight-header"><i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i> Webhooks com Falha</div>
            <div class="insight-value" style="color: var(--danger);"><?php echo e($webhookFailed); ?> <small style="font-size: 0.7rem; opacity: 0.6;">entregas</small></div>
            <p class="insight-desc">Necessitam retry manual</p>
        </div>
        <?php endif; ?>
    </div>
</div>

<div style="margin-top: 25px;">
    <!-- Transações Recentes -->
    <div class="card animate-up" style="animation-delay: 0.8s;">
        <div class="card-header">
            <h3>Transações Recentes</h3>
            <a href="<?php echo e(route('dashboard.transactions')); ?>" style="font-size: 0.85rem; color: var(--primary); text-decoration: none; font-weight: 600;">Ver todas <i class="fas fa-arrow-right" style="font-size: 0.7rem;"></i></a>
        </div>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>UUID</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Método</th>
                        <th>Status</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__empty_1 = true; $__currentLoopData = $recentTransactions ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $tx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                        <tr>
                            <td style="font-family: monospace; font-size: 0.8rem;">
                                <a href="<?php echo e(route('dashboard.transactions.show', $tx->uuid)); ?>" style="color: var(--primary); text-decoration: none;">
                                    <?php echo e(Str::limit($tx->uuid, 12)); ?>

                                </a>
                            </td>
                            <td><?php echo e($tx->customer_name ?? '-'); ?></td>
                            <td style="font-weight: 600;">R$ <?php echo e(number_format($tx->amount, 2, ',', '.')); ?></td>
                            <td><?php echo e(ucfirst(str_replace('_', ' ', $tx->payment_method ?? '-'))); ?></td>
                            <td>
                                <?php
                                    $statusColors = [
                                        'approved' => 'badge-success',
                                        'pending'  => 'badge-warning',
                                        'refused'  => 'badge-danger',
                                        'refunded' => 'badge-gray',
                                        'cancelled'=> 'badge-gray',
                                        'processing'=> 'badge-primary',
                                        'overdue'  => 'badge-danger',
                                    ];
                                    $statusLabels = [
                                        'approved' => 'Aprovado',
                                        'pending'  => 'Pendente',
                                        'refused'  => 'Recusado',
                                        'refunded' => 'Estornado',
                                        'cancelled'=> 'Cancelado',
                                        'processing'=> 'Processando',
                                        'overdue'  => 'Vencido',
                                    ];
                                    $cls = $statusColors[$tx->status] ?? 'badge-gray';
                                    $lbl = $statusLabels[$tx->status] ?? ucfirst($tx->status);
                                ?>
                                <span class="badge <?php echo e($cls); ?>"><?php echo e($lbl); ?></span>
                            </td>
                            <td style="color: var(--text-muted);"><?php echo e($tx->created_at?->format('d/m/Y H:i') ?? '-'); ?></td>
                        </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                        <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhuma transação recente.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('scripts'); ?>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('volumeChart');
        if (!ctx) return;

        const labels = <?php echo json_encode($dailyLabels ?? [], 15, 512) ?>;
        const data = <?php echo json_encode($dailyVolumes ?? [], 15, 512) ?>;

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(76, 29, 149, 0.2)');
        gradient.addColorStop(1, 'rgba(76, 29, 149, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Volume (R$)',
                    data: data.length ? data : [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#4C1D95',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4C1D95',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5], color: '#f1f5f9' },
                        ticks: {
                            color: '#64748b',
                            font: { size: 11 },
                            callback: function(value) { return 'R$ ' + value.toLocaleString('pt-BR'); }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    }
                }
            }
        });
    });
</script>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/index.blade.php ENDPATH**/ ?>