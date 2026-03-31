<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <title>Login - Checkout</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #5B21B6 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 48px;
            width: 100%;
            max-width: 420px;
        }
        .login-header {
            text-align: center;
            margin-bottom: 36px;
        }
        .login-header h1 {
            font-size: 1.8rem;
            font-weight: 800;
            color: #3b3b5c;
            letter-spacing: -0.5px;
        }
        .login-header p {
            color: #a1a1b5;
            font-size: 0.9rem;
            margin-top: 8px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #6e6b8b;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #ededf2;
            border-radius: 10px;
            font-size: 0.9rem;
            font-family: inherit;
            transition: all 0.2s;
            color: #3b3b5c;
            background: #f8f7ff;
        }
        .form-group input:focus {
            outline: none;
            border-color: #4C1D95;
            box-shadow: 0 0 0 3px rgba(76, 29, 149, 0.1);
            background: white;
        }
        .btn-login {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #4C1D95 0%, #6366F1 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 8px;
        }
        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(76, 29, 149, 0.3);
        }
        .error-box {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 0.85rem;
        }
        .footer-text {
            text-align: center;
            color: #a1a1b5;
            font-size: 0.75rem;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-header">
            <h1>Checkout</h1>
            <p>Faça login para acessar o painel</p>
        </div>

        <?php if($errors->any()): ?>
            <div class="error-box">
                <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <p><?php echo e($error); ?></p>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="<?php echo e(route('login.post')); ?>">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="<?php echo e(old('email')); ?>" required autofocus placeholder="seu@email.com">
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn-login">Entrar</button>
        </form>

        <p class="footer-text">Checkout Payment Platform &copy; <?php echo e(date('Y')); ?></p>
    </div>
</body>
</html>
<?php /**PATH /Users/viniciusreinehr/.gemini/antigravity/scratch/Checkout/resources/views/auth/login.blade.php ENDPATH**/ ?>