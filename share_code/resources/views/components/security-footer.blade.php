{{-- resources/views/components/security-footer.blade.php --}}
{{-- Rodapé de segurança "Pagamento 100% Seguro" — reutilizável em todos os checkouts --}}
@props(['message' => 'Pagamento 100% seguro e criptografado'])

<div class="security-row">
    <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
    <span>{{ $message }}</span>
</div>