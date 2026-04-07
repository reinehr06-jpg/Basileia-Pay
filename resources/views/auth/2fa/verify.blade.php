@extends('dashboard.layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Verificação de Dois Fatores</div>
                <div class="card-body">
                    <p class="text-muted">
                        Digite o código de 6 dígitos do seu aplicativo de autenticação ou use um código de backup.
                    </p>
                    
                    <form method="POST" action="{{ route('profile.2fa.verify.post') }}">
                        @csrf
                        <div class="mb-3">
                            <label for="code" class="form-label">Código</label>
                            <input type="text" name="code" id="code" class="form-control @error('code') is-invalid @enderror" 
                                   maxlength="8" required autofocus>
                            @error('code')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">Verificar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection