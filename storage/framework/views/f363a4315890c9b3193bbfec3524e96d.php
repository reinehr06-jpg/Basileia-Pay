<?php $__env->startSection('title', 'Empresas'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Empresas</h2>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Integrações</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $companies; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $company): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td style="font-weight: 600;"><?php echo e($company->name); ?></td>
                        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);"><?php echo e($company->slug); ?></td>
                        <td>
                            <span class="badge <?php echo e($company->status === 'active' ? 'badge-success' : 'badge-danger'); ?>">
                                <?php echo e($company->status === 'active' ? 'Ativa' : 'Inativa'); ?>

                            </span>
                        </td>
                        <td><?php echo e(number_format($company->integrations_count ?? 0)); ?></td>
                        <td style="color: var(--text-muted);"><?php echo e($company->created_at?->format('d/m/Y')); ?></td>
                        <td style="text-align: right;">
                            <form method="POST" action="<?php echo e(route('dashboard.companies.toggle', $company->id)); ?>" style="display: inline;">
                                <?php echo csrf_field(); ?>
                                <button type="submit" class="btn <?php echo e($company->status === 'active' ? 'btn-danger' : 'btn-primary'); ?> btn-sm">
                                    <?php echo e($company->status === 'active' ? 'Desativar' : 'Ativar'); ?>

                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhuma empresa encontrada.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/companies/index.blade.php ENDPATH**/ ?>