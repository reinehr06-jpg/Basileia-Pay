<?php $__env->startSection('title', 'Transações'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Transações</h2>
    <a href="<?php echo e(route('dashboard.transactions.export', request()->query())); ?>" class="btn btn-primary">
        <i class="fas fa-download"></i> Exportar CSV
    </a>
</div>

<div class="filter-form animate-up" style="animation-delay: 0.2s;">
    <form method="GET" action="<?php echo e(route('dashboard.transactions')); ?>">
        <div class="filter-row">
            <div class="filter-group">
                <label>Status</label>
                <select name="status">
                    <option value="">Todos</option>
                    <option value="pending" <?php echo e(request('status') == 'pending' ? 'selected' : ''); ?>>Pendente</option>
                    <option value="approved" <?php echo e(request('status') == 'approved' ? 'selected' : ''); ?>>Aprovado</option>
                    <option value="refused" <?php echo e(request('status') == 'refused' ? 'selected' : ''); ?>>Recusado</option>
                    <option value="cancelled" <?php echo e(request('status') == 'cancelled' ? 'selected' : ''); ?>>Cancelado</option>
                    <option value="refunded" <?php echo e(request('status') == 'refunded' ? 'selected' : ''); ?>>Estornado</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Data Início</label>
                <input type="date" name="date_from" value="<?php echo e(request('date_from')); ?>">
            </div>
            <div class="filter-group">
                <label>Data Fim</label>
                <input type="date" name="date_to" value="<?php echo e(request('date_to')); ?>">
            </div>
            <div class="filter-group">
                <label>Buscar</label>
                <input type="text" name="search" value="<?php echo e(request('search')); ?>" placeholder="UUID, cliente...">
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i></button>
                <a href="<?php echo e(route('dashboard.transactions')); ?>" class="btn btn-secondary">Limpar</a>
            </div>
        </div>
    </form>
</div>

<div class="card animate-up" style="animation-delay: 0.3s;">
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
                <?php $__empty_1 = true; $__currentLoopData = $transactions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $tx): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td style="font-family: monospace; font-size: 0.8rem;">
                            <a href="<?php echo e(route('dashboard.transactions.show', $tx->id)); ?>" style="color: var(--primary); text-decoration: none; font-weight: 600;">
                                <?php echo e(Str::limit($tx->uuid, 12)); ?>

                            </a>
                        </td>
                        <td><?php echo e($tx->customer_name ?? ($tx->customer?->name ?? '-')); ?></td>
                        <td style="font-weight: 700;">R$ <?php echo e(number_format($tx->amount, 2, ',', '.')); ?></td>
                        <td><?php echo e(ucfirst(str_replace('_', ' ', $tx->payment_method ?? '-'))); ?></td>
                        <td>
                            <?php
                                $statusMap = [
                                    'approved' => ['badge-success', 'Aprovado'],
                                    'pending' => ['badge-warning', 'Pendente'],
                                    'refused' => ['badge-danger', 'Recusado'],
                                    'refunded' => ['badge-gray', 'Estornado'],
                                    'cancelled' => ['badge-gray', 'Cancelado'],
                                    'processing' => ['badge-primary', 'Processando'],
                                    'overdue' => ['badge-danger', 'Vencido'],
                                ];
                                $s = $statusMap[$tx->status] ?? ['badge-gray', ucfirst($tx->status)];
                            ?>
                            <span class="badge <?php echo e($s[0]); ?>"><?php echo e($s[1]); ?></span>
                        </td>
                        <td style="color: var(--text-muted);"><?php echo e($tx->created_at?->format('d/m/Y H:i') ?? '-'); ?></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhuma transação encontrada.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if(method_exists($transactions, 'links')): ?>
        <div class="pagination"><?php echo e($transactions->links()); ?></div>
    <?php endif; ?>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/transactions/index.blade.php ENDPATH**/ ?>