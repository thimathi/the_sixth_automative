import { supabase } from "@/utils/supabase";

interface ResetPasswordParams {
    newPassword: string;
    email: string;
}

export const handleResetPassword = async ({ newPassword, email }: ResetPasswordParams) => {
    try {
        const { error: authError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (authError) throw authError;

        const { error: employeeError } = await supabase
            .from('employee')
            .update({ password: newPassword })
            .eq('email', email);

        if (employeeError) throw employeeError;

        return { error: null };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Password reset failed'
        };
    }
};