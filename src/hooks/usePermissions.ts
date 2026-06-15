export function usePermissions() {
    const permissions: string[] = JSON.parse(
        localStorage.getItem('permissions') || '[]'
    );

    const roles: string[] = JSON.parse(
        localStorage.getItem('roles') || '[]'
    );

    const can = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasRole = (role: string): boolean => {
        return roles.includes(role);
    };

    const isAdmin = (): boolean => {
        return roles.includes('SuperAdmin');
    };

    return { can, hasRole, isAdmin, permissions, roles };
}