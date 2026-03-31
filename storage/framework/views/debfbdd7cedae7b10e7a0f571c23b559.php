<?php $__env->startSection('title', 'Webhooks'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Webhooks</h2>
</div>

<div class="filter-form animate-up" style="animation-delay: 0.2s;">
    <form method="GET" action="<?php echo e(route('dashboard.webhooks')); ?>">
        <div class="filter-row">
            <div class="filter-group">
                <label>Status</label>
                <select name="status">
                    <option value="">Todos</option>
                    <option value="delivered" <?php echo e(request('status') == 'delivered' ? 'selected' : ''); ?>>Entregue</option>
                    <option value="pending" <?php echo e(request('status') == 'pending' ? 'selected' : ''); ?>>Pendente</option>
                    <option value="failed" <?php echo e(request('status') == 'failed' ? 'selected' : ''); ?>>Falhou</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Tipo de Evento</label>
                <input type="text" name="event_type" value="<?php echo e(request('event_type')); ?>" placeholder="payment.approved">
            </div>
            <div class="filter-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-search"></i></button>
                <a href="<?php echo e(route('dashboard.webhooks')); ?>" class="btn btn-secondary">Limpar</a>
            </div>
        </div>
    </form>
</div>

<div class="card animate-up" style="animation-delay: 0.3s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Integração</th>
                    <th>Status</th>
                    <th>Tentativas</th>
                    <th>Resp. Code</th>
                    <th>Data</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $deliveries; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $d): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td style="font-family: monospace; font-size: 0.8rem;"><?php echo e($d->event_type); ?></td>
                        <td><?php echo e($d->endpoint?->integration?->name ?? '-'); ?></td>
                        <td>
                            <?php
                                $ws = ['delivered' => 'badge-success', 'pending' => 'badge-warning', 'failed' => 'badge-danger'];
                                $wl = ['delivered' => 'Entregue', 'pending' => 'Pendente', 'failed' => 'Falhou'];
                            ?>
                            <span class="badge <?php echo e($ws[$d->status] ?? 'badge-gray'); ?>"><?php echo e($wl[$d->status] ?? ucfirst($d->status)); ?></span>
                        </td>
                        <td><?php echo e($d->attempts); ?>/<?php echo e($d->max_attempts); ?></td>
                        <td style="font-family: monospace; font-size: 0.8rem;"><?php echo e($d->response_code ?? '-'); ?></td>
                        <td style="color: var(--text-muted);"><?php echo e($d->created_at?->format('d/m/Y H:i')); ?></td>
                        <td style="text-align: right;">
                            <a href="<?php echo e(route('dashboard.webhooks.show', $d->id)); ?>" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i></a>
                            <?php if($d->status === 'failed'): ?>
                                <form method="POST" action="<?php echo e(route('dashboard.webhooks.retry', $d->id)); ?>" style="display: inline;">
                                    <?php echo csrf_field(); ?>
                                    <button type="submit" class="btn btn-primary btn-sm"><i class="fas fa-redo"></i></button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhum webhook encontrado.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/webhooks/index.blade.php ENDPATH**/ ?>