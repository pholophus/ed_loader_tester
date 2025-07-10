<template>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <div class="logo">
                    <!-- <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="16" fill="#8B5CF6"/>
                        <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="white"/>
                        <path d="M16 16L20 20L16 24L12 20L16 16Z" fill="white"/>
                    </svg> -->
                </div>
                <h1 class="logo-text">ED LOADER</h1>
            </div>
            
            <div class="form-section">
                <h2 class="form-title">Log in</h2>
                <p class="form-subtitle">Welcome back! Please enter your details.</p>
                
                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <label for="email" class="form-label">Email *</label>
                        <input 
                            id="email"
                            v-model="email"
                            type="email"
                            class="form-input"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password *</label>
                        <input 
                            id="password"
                            v-model="password"
                            type="password"
                            class="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <!-- <div class="form-actions">
                        <a href="#" class="forgot-password">Forgot password?</a>
                    </div> -->
                    
                    <button 
                        type="submit" 
                        class="sign-in-button"
                        :disabled="loading"
                    >
                        {{ loading ? 'Signing in...' : 'Sign in' }}
                    </button>
                    
                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../Composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
    if (!email.value || !password.value) {
        error.value = 'Please enter both email and password';
        return;
    }
    
    loading.value = true;
    error.value = '';
    
    try {
        const result = await login({
            identity: email.value,
            password: password.value
        });
        
        if (result.error) {
            error.value = result.error;
        } else {
            // Login successful, redirect to dashboard
            router.push('/');
        }
    } catch (err) {
        error.value = 'An unexpected error occurred. Please try again.';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 2rem;
}

.login-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.logo-section {
    margin-bottom: 2rem;
}

.logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #8B5CF6;
    margin: 0;
}

.form-section {
    text-align: left;
}

.form-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    text-align: center;
}

.form-subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0 0 2rem 0;
    text-align: center;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.form-input {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    outline: none;
    background: white;
}

.form-input:focus {
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.5rem;
}

.forgot-password {
    color: #8B5CF6;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
}

.forgot-password:hover {
    text-decoration: underline;
}

.sign-in-button {
    background: #8B5CF6;
    color: white;
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
}

.sign-in-button:hover:not(:disabled) {
    background: #7c3aed;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

.sign-in-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.error-message {
    color: #dc2626;
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
}

/* Responsive design */
@media (max-width: 480px) {
    .login-container {
        padding: 1rem;
    }
    
    .login-card {
        padding: 2rem;
    }
    
    .form-title {
        font-size: 1.75rem;
    }
}
</style> 