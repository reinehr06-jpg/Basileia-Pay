<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'search' => 'sometimes|string|max:255',
        ]);

        $query = Company::withCount('users', 'integrations');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('created_at', 'desc')->paginate(20);

        return view('dashboard.companies.index', compact('companies'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'required|string|max:20|unique:companies,document',
            'email' => 'required|email|unique:companies,email',
            'phone' => 'sometimes|string|max:20',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:8',
        ]);

        $company = Company::create([
            'name' => $request->input('name'),
            'document' => $request->input('document'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'is_active' => true,
        ]);

        User::create([
            'company_id' => $company->id,
            'name' => $request->input('owner_name'),
            'email' => $request->input('owner_email'),
            'password' => Hash::make($request->input('owner_password')),
            'role' => 'admin',
        ]);

        return redirect()->route('dashboard.companies.show', $company->id)
            ->with('success', 'Empresa criada com sucesso.');
    }

    public function show(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::with(['users', 'integrations'])->find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        return view('dashboard.companies.show', compact('company'));
    }

    public function update(Request $request, int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'document' => ['sometimes', 'string', 'max:20', Rule::unique('companies', 'document')->ignore($id)],
            'email' => ['sometimes', 'email', Rule::unique('companies', 'email')->ignore($id)],
            'phone' => 'sometimes|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update($request->only(['name', 'document', 'email', 'phone', 'is_active']));

        return redirect()->route('dashboard.companies.show', $company->id)
            ->with('success', 'Empresa atualizada com sucesso.');
    }

    public function destroy(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update(['is_active' => false]);

        return redirect()->route('dashboard.companies.index')
            ->with('success', 'Empresa desativada com sucesso.');
    }

    public function toggle(int $id)
    {
        $user = Auth::user();

        if ($user->role !== 'super_admin') {
            abort(403, 'Acesso não autorizado.');
        }

        $company = Company::find($id);

        if (!$company) {
            abort(404, 'Empresa não encontrada.');
        }

        $company->update(['status' => $company->status === 'active' ? 'inactive' : 'active']);

        return redirect()->route('dashboard.companies.index')
            ->with('success', 'Status da empresa atualizado.');
    }
}
