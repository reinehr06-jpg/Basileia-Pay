<?php $__env->startSection('title', 'Eventos / Links'); ?>

<?php $__env->startSection('content'); ?>
<div class="page-header animate-up">
    <h2>Eventos / Links</h2>
    <button onclick="document.getElementById('modal-create').classList.add('show')" class="btn btn-primary">
        <i class="fas fa-plus"></i> Criar Evento
    </button>
</div>

<div class="card animate-up" style="animation-delay: 0.2s;">
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Valor</th>
                    <th>Vagas</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th style="text-align: right;">Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $events; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $event): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td>
                        <strong><?php echo e($event->titulo); ?></strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);"><?php echo e($event->created_at->format('d/m/Y H:i')); ?></div>
                    </td>
                    <td>R$ <?php echo e(number_format($event->valor, 2, ',', '.')); ?></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; max-width: 80px;">
                                <div style="width: <?php echo e($event->vagas_total > 0 ? ($event->vagas_ocupadas / $event->vagas_total * 100) : 0); ?>%; height: 100%; background: <?php echo e($event->vagas_ocupadas >= $event->vagas_total ? '#ef4444' : '#10b981'); ?>; border-radius: 3px;"></div>
                            </div>
                            <span style="font-size: 0.8rem; font-weight: 600;"><?php echo e($event->vagas_ocupadas); ?>/<?php echo e($event->vagas_total); ?></span>
                        </div>
                    </td>
                    <td>
                        <?php if($event->status === 'ativo'): ?>
                            <span class="badge badge-success">Ativo</span>
                        <?php elseif($event->status === 'esgotado'): ?>
                            <span class="badge badge-danger">Esgotado</span>
                        <?php else: ?>
                            <span class="badge badge-secondary">Expirado</span>
                        <?php endif; ?>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <code style="font-size: 0.75rem; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><?php echo e(url("/evento/{$event->slug}")); ?></code>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('<?php echo e(url("/evento/{$event->slug}")); ?>'); this.innerHTML='<i class=\'fas fa-check\'></i>';" title="Copiar">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </td>
                    <td style="text-align: right;">
                        <?php if($event->status !== 'esgotado'): ?>
                        <form method="POST" action="<?php echo e(route('dashboard.events.toggle', $event)); ?>" style="display: inline;">
                            <?php echo csrf_field(); ?>
                            <button type="submit" class="btn btn-secondary btn-sm">
                                <i class="fas fa-<?php echo e($event->status === 'ativo' ? 'pause' : 'play'); ?>"></i>
                            </button>
                        </form>
                        <?php endif; ?>
                        <form method="POST" action="<?php echo e(route('dashboard.events.destroy', $event)); ?>" style="display: inline;" onsubmit="return confirm('Remover?')">
                            <?php echo csrf_field(); ?> <?php echo method_field('DELETE'); ?>
                            <button type="submit" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">Nenhum evento criado.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php if($events->hasPages()): ?>
    <div style="padding: 16px;"><?php echo e($events->links()); ?></div>
    <?php endif; ?>
</div>

<!-- Modal Create -->
<div id="modal-create" class="modal-overlay">
    <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
            <h3>Criar Evento</h3>
            <button class="modal-close" onclick="document.getElementById('modal-create').classList.remove('show')">&times;</button>
        </div>
        <form method="POST" action="<?php echo e(route('dashboard.events.store')); ?>">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label>Título *</label>
                <input type="text" name="titulo" required placeholder="Ex: Live de Lançamento 2026">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea name="descricao" rows="2" placeholder="Breve descrição..."></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                    <label>Valor (R$) *</label>
                    <input type="number" name="valor" step="0.01" min="0.01" required placeholder="197.00">
                </div>
                <div class="form-group">
                    <label>Total de Vagas *</label>
                    <input type="number" name="vagas_total" min="1" max="10000" required placeholder="10">
                </div>
                <div class="form-group">
                    <label>WhatsApp *</label>
                    <input type="text" name="whatsapp_vendedor" required placeholder="5511999999999">
                </div>
                <div class="form-group">
                    <label>Pagamento *</label>
                    <select name="metodo_pagamento" required>
                        <option value="all">Todos (PIX, Boleto, Cartão)</option>
                        <option value="pix">Somente PIX</option>
                        <option value="boleto">Somente Boleto</option>
                        <option value="credit_card">Somente Cartão</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Início</label>
                    <input type="datetime-local" name="data_inicio">
                </div>
                <div class="form-group">
                    <label>Fim</label>
                    <input type="datetime-local" name="data_fim">
                </div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-create').classList.remove('show')">Cancelar</button>
                <button type="submit" class="btn btn-primary">Criar Evento</button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('dashboard.layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/dashboard/events/index.blade.php ENDPATH**/ ?>