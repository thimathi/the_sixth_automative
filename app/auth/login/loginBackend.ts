import {supabase} from "@/utils/supabase";

export const handleLogin = async (email: string, password: string) => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
            .from('employee')
            .select('role')
            .eq('empId', authData.user?.id)
            .single();

        if (userError) throw userError;

        return {
            user: authData.user,
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