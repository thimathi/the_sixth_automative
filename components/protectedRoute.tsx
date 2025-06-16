'use client'

import { useUser } from "@/context/user-context";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
                                           children,
                                           allowedRoles,
                                       }: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const { user, loading } = useUser();

    useEffect(() => {
        if (!loading && !user) {
            redirect('/auth/login');
        }
        if (!loading && user && !allowedRoles.includes(user.role || '')) {
            redirect('/unauthorized');
        }
    }, [user, loading, allowedRoles]);

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
}