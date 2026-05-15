<?php

namespace App\Http\Controllers\Local;

use App\Http\Controllers\Controller;
use App\Services\MasterAccess\MasterAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MasterAccessController extends Controller
{
    /**
     * Generate a one-time challenge for master access.
     * Only allowed from localhost.
     */
    public function generateChallenge(Request $request)
    {
        // Restrict to localhost
        if (!in_array($request->ip(), ['127.0.0.1', '::1'])) {
            abort(403, 'Only allowed from localhost.');
        }

        $validator = Validator::make($request->all(), [
            'allowed_email' => 'required|email',
            'generated_by' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $service = new MasterAccessService();
        $result = $service->generateChallenge($request->allowed_email, $request->generated_by);

        return response()->json($result, 201);
    }

    /**
     * Validate the token and show a form to enter ephemeral secret.
     * This route is accessed via GET with token as parameter.
     */
    public function showChallenge(string $token)
    {
        // Check if token exists and is valid (not expired, status created)
        $tokenHash = hash('sha256', $token);
        $challenge = \App\Models\MasterAccessChallenge::where('token_hash', $tokenHash)
            ->where('status', 'created')
            ->where('expires_at', '>', now())
            ->first();

        if (!$challenge) {
            abort(404, 'Invalid or expired token.');
        }

        // In API context, return JSON with prompt or we could return a view.
        return response()->json([
            'message' => 'Token valid. Please provide ephemeral secret.',
            'token_prefix' => $challenge->token_prefix,
            'expires_in' => $challenge->expires_at->diffInSeconds(now()),
        ]);
    }
}
