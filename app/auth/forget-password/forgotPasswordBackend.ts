import { supabase} from "@/utils/supabase";

export const sendPasswordResetOtp = async (email: string) => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('employee')
            .select('email')
            .eq('email', email)
            .single();

        if (userError || !userData) {
            throw new Error('No account found with this email address');
        }

        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/forget-password-otp`,
        });

        if (authError) throw authError;

        return { error: null };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to send reset code',
        };
    }
};