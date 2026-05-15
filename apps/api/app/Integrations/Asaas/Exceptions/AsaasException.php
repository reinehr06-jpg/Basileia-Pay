<?php

namespace App\Integrations\Asaas\Exceptions;

use Exception;

class AsaasException extends Exception
{
    private array $responsePayload;

    public function __construct(string $message, int $code = 0, array $responsePayload = [])
    {
        parent::__construct($message, $code);
        $this->responsePayload = $responsePayload;
    }

    public function getResponsePayload(): array
    {
        return $this->responsePayload;
    }
}
