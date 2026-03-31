<?php $__env->startSection('title', 'Integrações'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up" style="animation-delay: 0.1s;">
    <h2>Integrações</h2>
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nova Integração
    </button>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>API Key</th>
                    <th>Status</th>
                    <th>Transações</th>
                    <th>Criado em</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $integrations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $int): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td style="font-weight: 600;"><?php echo e($int->name); ?></td>
                        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);"><?php echo e($int->api_key_prefix); ?>...</td>
                        <td>
                            <span class="badge <?php echo e($int->status === 'active' ? 'badge-success' : 'badge-danger'); ?>">
                                <?php echo e($int->status === 'active' ? 'Ativa' : 'Inativa'); ?>

                            </span>
                        </td>
                        <td><?php echo e(number_format($int->transactions_count ?? 0)); ?></td>
                        <td style="color: var(--text-muted);"><?php echo e($int->created_at?->format('d/m/Y')); ?></td>
                        <td style="text-align: right;">
                            <a href="<?php echo e(route('dashboard.integrations.show', $int->id)); ?>" class="btn btn-secondary btn-sm">
                                <i class="fas fa-eye"></i> Ver
                            </a>
                            <form method="POST" action="<?php echo e(route('dashboard.integrations.toggle', $int->id)); ?>" style="display: inline;">
                                <?php echo csrf_field(); ?>
                                <button type="submit" class="btn <?php echo e($int->status === 'active' ? 'btn-danger' : 'btn-primary'); ?> btn-sm">
                                    <?php echo e($int->status === 'active' ? 'Desativar' : 'Ativar'); ?>

                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhuma integração cadastrada.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Create -->
<div id="modal-create" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Nova Integração</h3>
            <button class="modal-close" onclick="document.getElementById('modal-create').classList.remove('show')">&times;</button>
        </div>
        <form method="POST" action="<?php echo e(route('dashboard.integrations.store')); ?>">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label>Nome</label>
                <input type="text" name="name" required placeholder="Ex: Basileia Vendas">
            </div>
            <div class="form-group">
                <label>URL Base</label>
                <input type="url" name="base_url" placeholder="https://seudominio.com">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-create').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Integração</button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/integrations/index.blade.php ENDPATH**/ ?>