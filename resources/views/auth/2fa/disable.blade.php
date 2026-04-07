@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">Desativar Autenticação de Dois Fatores</div>
                <div class="card-body">
                    <p class="text-muted">
                        Para desativar a autenticação de dois fatores, insira sua senha.
                    </p>
                    
                    <form method="POST" action="{{ route('profile.2fa.disable.post') }}">
                        @csrf
                        <div class="mb-3">
                            <label for="password" class="form-label">Senha</label>
                            <input type="password" name="password" id="password" class="form-control @error('password') is-invalid @enderror" required>
                            @error('password')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-danger">Desativar 2FA</button>
                            <a href="{{ route('dashboard.index') }}" class="btn btn-outline-secondary">Cancelar</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection