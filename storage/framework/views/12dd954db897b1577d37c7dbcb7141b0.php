<?php $__env->startSection('title', 'Gateways de Pagamento'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Gateways de Pagamento</h2>
    <a href="<?php echo e(route('dashboard.gateways.create')); ?>" class="btn btn-primary">
        <i class="fas fa-plus"></i> Novo Gateway
    </a>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Padrão</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $gateways; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $gw): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td style="font-weight: 600;"><?php echo e($gw->name); ?></td>
                        <td><span class="badge badge-primary"><?php echo e(ucfirst($gw->type ?? 'N/A')); ?></span></td>
                        <td>
                            <span class="badge <?php echo e($gw->status === 'active' ? 'badge-success' : 'badge-danger'); ?>">
                                <?php echo e($gw->status === 'active' ? 'Ativo' : 'Inativo'); ?>

                            </span>
                        </td>
                        <td>
                            <?php if($gw->is_default): ?>
                                <span class="badge badge-primary"><i class="fas fa-star"></i> Padrão</span>
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                        <td style="color: var(--text-muted);"><?php echo e($gw->created_at?->format('d/m/Y')); ?></td>
                        <td style="text-align: right;">
                            <a href="<?php echo e(route('dashboard.gateways.show', $gw->id)); ?>" class="btn btn-secondary btn-sm"><i class="fas fa-cog"></i></a>
                            <form method="POST" action="<?php echo e(route('dashboard.gateways.toggle', $gw->id)); ?>" style="display: inline;">
                                <?php echo csrf_field(); ?>
                                <button type="submit" class="btn <?php echo e($gw->status === 'active' ? 'btn-danger' : 'btn-primary'); ?> btn-sm">
                                    <?php echo e($gw->status === 'active' ? 'Desativar' : 'Ativar'); ?>

                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhum gateway configurado.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/gateways/index.blade.php ENDPATH**/ ?>