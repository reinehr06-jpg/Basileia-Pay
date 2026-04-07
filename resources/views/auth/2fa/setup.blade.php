@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Ativar Autenticação de Dois Fatores</div>
                <div class="card-body">
                    <p class="text-muted">
                        Escaneie o QR Code abaixo com seu aplicativo de autenticação (Google Authenticator, Authy, etc.)
                    </p>
                    
                    <div class="text-center mb-4">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{ urlencode($qrCodeUrl) }}" alt="QR Code 2FA" class="img-fluid">
                    </div>
                    
                    <div class="alert alert-info">
                        <strong>Chave secreta:</strong> {{ $secret }}<br>
                        <small>Caso não seja possível escanear, insira esta chave manualmente no seu aplicativo.</small>
                    </div>
                    
                    <form method="POST" action="{{ route('profile.2fa.enable') }}">
                        @csrf
                        <div class="mb-3">
                            <label for="code" class="form-label">Código de 6 dígitos</label>
                            <input type="text" name="code" id="code" class="form-control @error('code') is-invalid @enderror" 
                                   maxlength="6" pattern="[0-9]*" inputmode="numeric" required>
                            @error('code')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">Ativar 2FA</button>
                            <a href="{{ route('dashboard.index') }}" class="btn btn-outline-secondary">Cancelar</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection