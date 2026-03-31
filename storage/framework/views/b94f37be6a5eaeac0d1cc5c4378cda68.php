<?php $__env->startSection('title', 'Relatórios'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Relatórios</h2>
</div>

<div class="filter-form animate-up" style="animation-delay: 0.2s;">
    <form method="GET" action="<?php echo e(route('dashboard.reports')); ?>">
        <div class="filter-row">
            <div class="filter-group">
                <label>Data Início</label>
                <input type="date" name="date_from" value="<?php echo e(request('date_from', now()->startOfMonth()->format('Y-m-d'))); ?>">
            </div>
            <div class="filter-group">
                <label>Data Fim</label>
                <input type="date" name="date_to" value="<?php echo e(request('date_to', now()->format('Y-m-d'))); ?>">
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-chart-bar"></i> Gerar</button>
                <a href="<?php echo e(route('dashboard.reports.export', request()->query())); ?>" class="btn btn-secondary"><i class="fas fa-download"></i> CSV</a>
            </div>
        </div>
    </form>
</div>

<!-- KPI Cards -->
<div class="kpi-grid">
    <div class="kpi-card animate-up" style="animation-delay: 0.3s;">
        <i class="fas fa-money-bill-trend-up kpi-icon"></i>
        <span class="label">Total Transações</span>
        <div class="value"><?php echo e(number_format($total_transactions ?? 0)); ?></div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.4s;">
        <i class="fas fa-check-circle kpi-icon"></i>
        <span class="label">Aprovadas</span>
        <div class="value" style="color: var(--success);"><?php echo e(number_format($total_approved ?? 0)); ?></div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.5s;">
        <i class="fas fa-coins kpi-icon"></i>
        <span class="label">Volume Total</span>
        <div class="value">R$ <?php echo e(number_format($total_amount ?? 0, 2, ',', '.')); ?></div>
    </div>
    <div class="kpi-card animate-up" style="animation-delay: 0.6s;">
        <i class="fas fa-percentage kpi-icon"></i>
        <span class="label">Taxa Aprovação</span>
        <div class="value"><?php echo e(number_format($approval_rate ?? 0, 1)); ?>%</div>
    </div>
</div>

<!-- Breakdown Tables -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
    <div class="card animate-up" style="animation-delay: 0.7s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Por Método de Pagamento</h3>
        <table>
            <thead>
                <tr><th>Método</th><th style="text-align: right;">Qtd</th><th style="text-align: right;">Volume</th></tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $by_method ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td><?php echo e(ucfirst(str_replace('_', ' ', $row->method))); ?></td>
                        <td style="text-align: right;"><?php echo e(number_format($row->count)); ?></td>
                        <td style="text-align: right; font-weight: 600;">R$ <?php echo e(number_format($row->total, 2, ',', '.')); ?></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="3" class="text-center" style="padding: 20px; color: var(--text-muted);">Sem dados</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div class="card animate-up" style="animation-delay: 0.8s;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">Por Status</h3>
        <table>
            <thead>
                <tr><th>Status</th><th style="text-align: right;">Qtd</th><th style="text-align: right;">Volume</th></tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $by_status ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td>
                            <?php $labels = ['approved'=>'Aprovado','pending'=>'Pendente','refused'=>'Recusado','refunded'=>'Estornado','cancelled'=>'Cancelado']; ?>
                            <?php echo e($labels[$row->status] ?? ucfirst($row->status)); ?>

                        </td>
                        <td style="text-align: right;"><?php echo e(number_format($row->count)); ?></td>
                        <td style="text-align: right; font-weight: 600;">R$ <?php echo e(number_format($row->total, 2, ',', '.')); ?></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="3" class="text-center" style="padding: 20px; color: var(--text-muted);">Sem dados</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/reports/index.blade.php ENDPATH**/ ?>