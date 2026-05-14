{{-- resources/views/components/brand-logos.blade.php --}}
{{-- SVGs das bandeiras de cartão — reutilizáveis em qualquer checkout --}}
@props(['brands' => ['visa', 'master', 'elo', 'amex'], 'size' => 'default'])

@php
    $sizeClass = match($size) {
        'sm' => 'h-4',
        'lg' => 'h-8',
        default => 'h-5',
    };
@endphp

<div class="brand-logos flex items-center gap-2 flex-wrap">
    @foreach($brands as $brand)
        @switch($brand)
            @case('visa')
            <svg viewBox="0 0 80 30" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#1A1F71"/>
                <text x="40" y="21" font-size="16" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">VISA</text>
            </svg>
            @break
            @case('master')
            <svg viewBox="0 0 44 28" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="14" r="12" fill="#EB001B"/>
                <circle cx="28" cy="14" r="12" fill="#F79E1B" opacity="0.85"/>
            </svg>
            @break
            @case('amex')
            <svg viewBox="0 0 50 22" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="50" height="22" rx="3" fill="#006FCF"/>
                <text x="25" y="16" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">AMEX</text>
            </svg>
            @break
            @case('elo')
            <svg viewBox="0 0 80 30" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#7C3AED"/>
                <text x="40" y="21" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">ELO</text>
            </svg>
            @break
            @case('hipercard')
            <svg viewBox="0 0 80 30" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#E6001A"/>
                <text x="40" y="21" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">HIPERCARD</text>
            </svg>
            @break
            @case('diners')
            <svg viewBox="0 0 80 30" class="{{ $sizeClass }} w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="30" rx="4" fill="#0064AA"/>
                <text x="40" y="21" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">DINERS</text>
            </svg>
            @break
        @endswitch
    @endforeach
</div>