'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

type User = {
    id: string
    empId: string
    email?: string
    name?: string
    role?: string
}

type UserContextType = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                await fetchUserData(session.user)
            }
            setLoading(false)
        }

        checkSession()

        // @ts-ignore
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchUserData(session.user)
            } else {
                setUser(null)
                router.push('/auth/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const fetchUserData = async (user: any) => {
        const { data } = await supabase
            .from('employee')
            .select('empId, first_name, last_name, role')
            .eq('email', user.email)
            .single()

        if (data) {
            const userData = {
                id: user.id,
                empId: data.empId,
                email: user.email,
                name: `${data.first_name} ${data.last_name}`,
                role: data.role
            }
            setUser(userData)

            // Redirect based on role after login
            redirectBasedOnRole(userData.role)
        }
    }

    const redirectBasedOnRole = (role: string) => {
        switch (role) {
            case 'accountant':
                router.push('/accountant/dashboard')
                break
            case 'md':
                router.push('/md/dashboard')
                break
            case 'manager':
                router.push('/manager/dashboard')
                break
            default:
                router.push('/auth/login')
        }
    }

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error

        if (data.user) {
            await fetchUserData(data.user)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/auth/login')
    }

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}