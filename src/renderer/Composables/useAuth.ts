import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { pocketBaseConfig } from '../../config/api'
import { useEmployee } from './useEmployee'
import { User } from '../../schemas/User'
import { useUserStore } from '../store/userStore'
import { apiService } from '../../services/apiService'

export interface LoginPayload {
    identity: string
    password: string
}

export interface AuthResponse {
    token: string
    record: User
}

// Base URL configuration
const getBaseUrl = () => {
    return pocketBaseConfig.baseUrl;
}

// Cookie utility functions
const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

const validateToken = async (token: string) => {
    const response = await apiService.post('auth/validate-token', {
        token: token
    });

    return response.data
}

export function useAuth() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // Token management
    const getToken = () => getCookie('pb_auth')
    const setToken = (value: string) => setCookie('pb_auth', value, 20833) // 1800000 seconds = ~20833 days
    const removeToken = () => deleteCookie('pb_auth')
    
    const isAuthenticated = computed(() => !!getToken())

    const login = async (credentials: LoginPayload) => {
        try {
            const endpoint = getBaseUrl() + 'collections/users/auth-with-password';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Invalid credentials')
            }

            const data: AuthResponse = await response.json()

            // Store token in cookie
            setToken(data.token)

            if (data.record.id) {
                const userData = await useEmployee().fetchByPocketbaseID(data.record.id)
                userStore.setUser(userData)
            }

            console.log('User from useAuth', userStore.getUser);

            return { error: null, data }
        } catch (error: any) {
            console.error('Login error:', error)
            return {
                error: error.message || 'Invalid credentials',
                data: null
            }
        }
    }

    const logout = () => {
        removeToken()
        userStore.clearUser()
        router.push('/login')
    }

    const clearAuth = () => {
        removeToken()
        userStore.clearUser()
    }

    const getUser = () => {
        return userStore.getUser
    }

    const validateAndLoadUser = async () => {
        const token = getToken();

        console.log("token ", token);

        if (!token) {
            return false
        }

        const isValid = await validateToken(token);

        if (!isValid) {
            clearAuth();
            return false;
        }

        if (userStore.getUser) {
            console.log("user found, returning true ", userStore.getUser);
            return true
        }

        console.log("user not found, fetching user");

        try {
            // Try to get current user with the token
            const endpoint = getBaseUrl() + 'collections/users/auth-refresh'
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                clearAuth()
                return false
            }

            console.log("response auth fresh", response);

            const data: AuthResponse = await response.json()

            console.log("data auth fres response.jsonh", data);
            
            if (data.record.id) {
                const userData = await useEmployee().fetchByPocketbaseID(data.record.id)
                console.log("pocketbaseid passed ", data.record.id);
                console.log("userData by pocketbase", userData);
                userStore.setUser(userData)

                console.log("user store after set user ", userStore.getUser);
                return true
            }

            return false
        } catch (error) {
            console.error('Token validation error:', error)
            clearAuth()
            return false
        }
    }

    return {
        user: computed(() => userStore.getUser),
        isAuthenticated,
        login,
        logout,
        getToken,
        getUser,
        validateAndLoadUser,
        clearAuth,
        validateToken
    }
} 