import os

files = {
    'PasswordResetMail.php': 'PasswordResetMail',
    'CheckoutRecoveryMail.php': 'CheckoutRecoveryMail',
    'SubscriptionReminderMail.php': 'SubscriptionReminderMail',
    'PaymentReceiptMail.php': 'PaymentReceiptMail',
    'WelcomeMail.php': 'WelcomeMail'
}

mail_dir = "apps/api/app/Mail"
os.makedirs(mail_dir, exist_ok=True)

for file_name, class_name in files.items():
    content = f"""<?php

namespace App\\Mail;

use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Mail\\Mailable;
use Illuminate\\Mail\\Mailables\\Content;
use Illuminate\\Mail\\Mailables\\Envelope;
use Illuminate\\Queue\\SerializesModels;

class {class_name} extends Mailable implements ShouldQueue
{{
    use Queueable, SerializesModels;

    public $data;

    public function __construct($data = [])
    {{
        $this->data = $data;
    }}

    public function envelope(): Envelope
    {{
        return new Envelope(
            subject: 'Notificação Basileia',
        );
    }}

    public function content(): Content
    {{
        return new Content(
            view: 'emails.default',
        );
    }}
}}
"""
    with open(os.path.join(mail_dir, file_name), 'w') as f:
        f.write(content)
