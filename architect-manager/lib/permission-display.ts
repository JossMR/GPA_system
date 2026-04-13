type PermissionLike = {
    screen?: string
    screen_name?: string
    permission_type?: string
}

const normalize = (value: string | undefined) =>
    (value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-")

// Single source of truth for custom permission labels in role views.
const permissionDisplayMap: Record<string, string> = {
    "clientes|view": "Ver clientes",
    "clientes-id|view": "Ver detalles de cliente",
    "clientes-id-editar|edit": "Editar clientes",
    "client-id-editar|edit": "Editar clientes",
    "clientes-nuevo|create": "Crear clientes",
    "cliente-nuevo|create": "Crear clientes",

    "proyectos|view": "Ver proyectos",
    "proyectos-id|view": "Ver detalles de proyectos",
    "proyectos-id-editar|edit": "Editar proyectos",
    "proyecto-id-editar|edit": "Editar proyectos",
    "proyectos-nuevo|create": "Crear proyectos",

    "pagos|view": "Ver pagos",
    "pagos-nuevo|create": "Crear pagos",
    "pagos|edit": "Editar/Eliminar pagos",

    "reportes|all": "Gestionar reportes",
    "usuarios|all": "Gestionar usuarios",
    "usuarios-administrar-roles|all": "Gestionar roles",
    "usuario-administrar-role|all": "Gestionar roles",
}

export function getPermissionDisplayName(permission: PermissionLike): string {
    const screen = normalize(permission.screen || permission.screen_name)
    const permissionType = normalize(permission.permission_type)

    const exactKey = `${screen}|${permissionType}`
    if (permissionDisplayMap[exactKey]) {
        return permissionDisplayMap[exactKey]
    }

    const fallbackKey = `${screen}|all`
    if (permissionDisplayMap[fallbackKey]) {
        return permissionDisplayMap[fallbackKey]
    }

    return permission.screen_name || permission.screen || "Permiso"
}
