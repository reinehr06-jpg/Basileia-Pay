import os
import re

job_settings = {
    'ProcessGatewayWebhookJob': {'tries': 3, 'timeout': 30, 'queue': 'webhooks'},
    'ProcessWebhookEventJob': {'tries': 5, 'timeout': 30, 'queue': 'default'},
    'SendSubscriptionReminderJob': {'tries': 3, 'timeout': 15, 'queue': 'notifications'},
    'SendOriginWebhookJob': {'tries': 5, 'timeout': 30, 'queue': 'default'},
    'ProcessAnalyticsEventJob': {'tries': 3, 'timeout': 60, 'queue': 'analytics'},
    'AggregateGeographicRiskJob': {'tries': 2, 'timeout': 120, 'queue': 'analytics'},
    'SyncGatewayPaymentJob': {'tries': 3, 'timeout': 60, 'queue': 'default'},
    'SendWebhookJob': {'tries': 5, 'timeout': 30, 'queue': 'default'},
    'GenerateFinancialReportJob': {'tries': 2, 'timeout': 300, 'queue': 'default'},
    'ReconcileOrdersJob': {'tries': 2, 'timeout': 120, 'queue': 'default'},
    'SendRecoveryEmailJob': {'tries': 3, 'timeout': 15, 'queue': 'notifications'},
    'ProcessPixSubscriptionCycleJob': {'tries': 3, 'timeout': 60, 'queue': 'payments'},
    'ProcessAsaasWebhookJob': {'tries': 3, 'timeout': 30, 'queue': 'default'},
    'DeliverWebhookJob': {'tries': 3, 'timeout': 30, 'queue': 'webhooks'},
}

base_dir = "apps/api/app/Jobs/"
for file_name in os.listdir(base_dir):
    if not file_name.endswith('.php'): continue
    
    job_name = file_name[:-4]
    if job_name not in job_settings:
        continue
        
    settings = job_settings[job_name]
    
    with open(os.path.join(base_dir, file_name), 'r') as f:
        content = f.read()
        
    if 'public $tries' in content:
        continue
        
    if 'use Illuminate\\Support\\Facades\\Log;' not in content:
        content = re.sub(r'(namespace App\\Jobs;)', r'\1\n\nuse Illuminate\\Support\\Facades\\Log;', content)
        
    properties = f"""
    public $queue = '{settings['queue']}';
    public $tries = {settings['tries']};
    public $timeout = {settings['timeout']};
    public $backoff = [10, 60, 300, 1800, 3600];
"""
    content = re.sub(r'(use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;)', lambda m: m.group(1) + '\n' + properties, content)
    
    failed_method = """
    public function failed(?\\Throwable $exception): void
    {
        Log::error('Job failed permanently', [
            'job' => static::class,
            'error' => $exception?->getMessage(),
        ]);
    }
}"""
    content = re.sub(r'}\s*$', lambda _: failed_method, content)
    
    with open(os.path.join(base_dir, file_name), 'w') as f:
        f.write(content)
