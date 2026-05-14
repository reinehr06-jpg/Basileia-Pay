

<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['brands' => ['visa', 'master', 'elo', 'amex'], 'size' => 'default']));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter((['brands' => ['visa', 'master', 'elo', 'amex'], 'size' => 'default']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<?php
    $sizeClass = match($size) {
        'sm' => 'h-4',
        'lg' => 'h-8',
        default => 'h-5',
    };
?>

<div class="brand-logos flex items-center gap-2 flex-wrap">
    <?php $__currentLoopData = $brands; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $brand): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <?php switch($brand):
            case ('visa'): ?>
            <svg viewBox="0 0 80 30" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#1A1F71"/>
                <text x="40" y="21" font-size="16" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">VISA</text>
            </svg>
            <?php break; ?>
            <?php case ('master'): ?>
            <svg viewBox="0 0 44 28" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="14" r="12" fill="#EB001B"/>
                <circle cx="28" cy="14" r="12" fill="#F79E1B" opacity="0.85"/>
            </svg>
            <?php break; ?>
            <?php case ('amex'): ?>
            <svg viewBox="0 0 50 22" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="22" rx="3" fill="#006FCF"/>
                <text x="25" y="16" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">AMEX</text>
            </svg>
            <?php break; ?>
            <?php case ('elo'): ?>
            <svg viewBox="0 0 80 30" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#7C3AED"/>
                <text x="40" y="21" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">ELO</text>
            </svg>
            <?php break; ?>
            <?php case ('hipercard'): ?>
            <svg viewBox="0 0 80 30" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#E6001A"/>
                <text x="40" y="21" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">HIPERCARD</text>
            </svg>
            <?php break; ?>
            <?php case ('diners'): ?>
            <svg viewBox="0 0 80 30" class="<?php echo e($sizeClass); ?> w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#0064AA"/>
                <text x="40" y="21" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">DINERS</text>
            </svg>
            <?php break; ?>
        <?php endswitch; ?>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</div><?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/CheckOutFINAL/resources/views/components/brand-logos.blade.php ENDPATH**/ ?>