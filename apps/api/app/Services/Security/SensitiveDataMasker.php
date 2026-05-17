<?php

namespace App\Services\Security;

class SensitiveDataMasker
{
    /**
     * Mascara dados sensíveis de acordo com o tipo.
     */
    public function mask(string $type, ?string $value): string
    {
        if (empty($value)) return '';

        return match ($type) {
            'email'    => $this->maskEmail($value),
            'cpf', 'cnpj', 'document' => $this->maskDocument($value),
            'card'     => $this->maskCard($value),
            'cvv'      => '***',
            'api_key'  => $this->maskApiKey($value),
            'token', 'secret' => $this->maskSecret($value),
            'phone'    => $this->maskPhone($value),
            default    => '********',
        };
    }

    /**
     * Mascara um payload (array) recursivamente.
     */
    public function maskArray(array $data, array $sensitiveFields = []): array
    {
        $sensitiveFields = array_merge([
            'cvv', 'card_number', 'number', 'password', 'token', 'secret', 'api_key', 
            'document', 'cpf', 'cnpj', 'email', 'phone'
        ], $sensitiveFields);

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->maskArray($value, $sensitiveFields);
                continue;
            }

            if (in_array(strtolower($key), $sensitiveFields)) {
                $data[$key] = $this->mask($this->resolveType($key), (string)$value);
            }
        }

        return $data;
    }

    protected function maskEmail(string $email): string
    {
        if (!str_contains($email, '@')) return '***@***';
        [$user, $domain] = explode('@', $email);
        return substr($user, 0, 1) . '***@' . $domain;
    }

    protected function maskDocument(string $doc): string
    {
        $clean = preg_replace('/[^0-9]/', '', $doc);
        if (strlen($clean) === 11) { // CPF
            return '***.***.' . substr($clean, 6, 3) . '-**';
        }
        return '**.***.***/****-**'; // CNPJ
    }

    protected function maskCard(string $number): string
    {
        $clean = preg_replace('/[^0-9]/', '', $number);
        return '**** **** **** ' . substr($clean, -4);
    }

    protected function maskApiKey(string $key): string
    {
        if (str_contains($key, '_')) {
            [$prefix, $rest] = explode('_', $key, 2);
            return $prefix . '_****' . substr($key, -4);
        }
        return '****' . substr($key, -4);
    }

    protected function maskSecret(string $secret): string
    {
        return '****' . substr($secret, -4);
    }

    protected function maskPhone(string $phone): string
    {
        return '(**) ****-' . substr($phone, -4);
    }

    protected function resolveType(string $key): string
    {
        return match (strtolower($key)) {
            'email' => 'email',
            'cpf', 'cnpj', 'document' => 'document',
            'card_number', 'number' => 'card',
            'cvv' => 'cvv',
            'api_key' => 'api_key',
            'token', 'secret' => 'token',
            'phone' => 'phone',
            default => 'token',
        };
    }
}
