import {supabase} from "@/utils/supabase";

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    department: string;
}

export const handleRegister = async (formData: RegisterData) => {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (authError) throw authError;

        const { data: profileData, error: profileError } = await supabase
            .from('employee')
            .insert([
                {
                    id: authData.user?.id,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    role: formData.department,
                    password: formData.password,
                    created_at: new Date().toISOString(),
                },
            ]);

        if (profileError) throw profileError;

        return {
            user: authData.user,
            error: null,
        };
    } catch (error) {
        return {
            user: null,
            error: error instanceof Error ? error.message : 'Registration failed',
        };
    }

};