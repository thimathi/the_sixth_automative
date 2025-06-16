import { supabase } from "@/utils/supabase";

export const handleLogin = async (email: string, password: string) => {
    try {
        // Sign in with email and password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        // Get user role from employee table
        const { data: userData, error: userError } = await supabase
            .from('employee')
            .select('role, empId, first_name, last_name')
            .eq('email', email)
            .single();

        if (userError) throw userError;

        return {
            user: {
                ...authData.user,
                empId: userData?.empId,
                name: `${userData?.first_name} ${userData?.last_name}`
            },
            role: userData?.role || 'employee',
            error: null,
        };
    } catch (error) {
        return {
            user: null,
            role: null,
            error: error instanceof Error ? error.message : 'Login failed',
        };
    }
};