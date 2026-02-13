import { flatMap, uniq, sortBy, isObject, isArray } from 'lodash-es';

import type { TablePermissions, Permission, FieldPermission, RolePermissions } from '@/types/hasura';
import { CRUDOperation, CRUDOperationsList } from '@/types/hasura';
import { getValueHash } from '@/utils/get-value-hash';

interface FieldRolePermissions {
  operation: CRUDOperation;
  hasFilter: boolean;
}

export class HasuraTableService {
  readonly tableName: string;
  readonly allRoles: string[];
  readonly fields: string[];

  // Precomputed maps for fast lookups
  private fieldPermissions: Map<string, Map<string, FieldRolePermissions[]>> = new Map();
  private roleFilters: Map<string, Map<CRUDOperation, Record<string, unknown> | null>> = new Map();
  private roleSets: Map<string, Map<CRUDOperation, Record<string, string> | null>> = new Map();

  // Hash-based highlighting: path -> hash
  private pathToHash: Map<string, string> = new Map();

  constructor(permissions: TablePermissions, allRoles: string[]) {
    this.tableName = permissions.table.name;
    this.allRoles = allRoles;
    this.fields = this.extractFields(permissions);

    // Precompute all data
    this.precomputeFieldPermissions(permissions);
    this.precomputeRoleFilters(permissions);
    this.precomputeRoleSets(permissions);
    this.precomputePathHashes();
  }

  private extractFields(permissions: TablePermissions): string[] {
    const cols = flatMap(
      [
        ...(permissions.insert_permissions || []),
        ...(permissions.select_permissions || []),
        ...(permissions.update_permissions || []),
        ...(permissions.delete_permissions || []),
      ],
      (perm) => {
        const columns = perm.permission.columns;
        return Array.isArray(columns) ? columns : [];
      }
    );

    return sortBy(uniq(cols));
  }

  private precomputeFieldPermissions(permissions: TablePermissions): void {
    for (const field of this.fields) {
      const roleMap = new Map<string, FieldRolePermissions[]>();

      for (const role of this.allRoles) {
        const perms = this.computeRolePermissions(permissions, role, field);
        roleMap.set(role, perms);
      }

      this.fieldPermissions.set(field, roleMap);
    }
  }

  private computeRolePermissions(permissions: TablePermissions, role: string, field: string): FieldRolePermissions[] {
    const rolePerms: RolePermissions = {
      C: this.getFieldPermission('insert', permissions.insert_permissions, role, field) || { allowed: false },
      R: this.getFieldPermission('select', permissions.select_permissions, role, field) || { allowed: false },
      U: this.getFieldPermission('update', permissions.update_permissions, role, field) || { allowed: false },
      D: this.getFieldPermission('delete', permissions.delete_permissions, role, field) || { allowed: false },
    };

    return (Object.keys(rolePerms) as CRUDOperation[])
      .filter((op) => rolePerms[op].allowed)
      .map((op) => ({
        operation: op,
        hasFilter: !!rolePerms[op].filter,
      }));
  }

  private getFieldPermission(
    action: string,
    permissions: Permission[] | undefined,
    role: string,
    field: string
  ): FieldPermission | null {
    if (!permissions) return null;

    const rolePermissions = permissions.find((p) => p.role === role);
    if (!rolePermissions) return null;

    const cols = rolePermissions.permission.columns;
    let allowed = cols === '*' || (Array.isArray(cols) && cols.includes(field));

    // Delete permissions with filters allow access even without explicit columns
    if (!allowed && action === 'delete' && rolePermissions.permission.filter) {
      allowed = true;
    }

    const filter = allowed ? this.formatFilter(rolePermissions.permission.filter) : undefined;

    return { allowed, filter };
  }

  private precomputeRoleFilters(permissions: TablePermissions): void {
    const permsMap: Record<CRUDOperation, Permission[] | undefined> = {
      [CRUDOperation.Create]: permissions.insert_permissions,
      [CRUDOperation.Read]: permissions.select_permissions,
      [CRUDOperation.Update]: permissions.update_permissions,
      [CRUDOperation.Delete]: permissions.delete_permissions,
    };

    for (const role of this.allRoles) {
      const opMap = new Map<CRUDOperation, Record<string, unknown> | null>();

      for (const operation of CRUDOperationsList) {
        const rolePermissions = permsMap[operation]?.find((p) => p.role === role);
        const filters = rolePermissions?.permission?.filter;
        const hasFilters = this.hasValidFilter(filters);
        opMap.set(operation, hasFilters ? filters : null);
      }

      this.roleFilters.set(role, opMap);
    }
  }

  private precomputeRoleSets(permissions: TablePermissions): void {
    const permsMap: Record<CRUDOperation, Permission[] | undefined> = {
      [CRUDOperation.Create]: permissions.insert_permissions,
      [CRUDOperation.Read]: permissions.select_permissions,
      [CRUDOperation.Update]: permissions.update_permissions,
      [CRUDOperation.Delete]: permissions.delete_permissions,
    };

    for (const role of this.allRoles) {
      const opMap = new Map<CRUDOperation, Record<string, string> | null>();

      for (const operation of CRUDOperationsList) {
        const rolePermissions = permsMap[operation]?.find((p) => p.role === role);
        const sets = rolePermissions?.permission?.set;
        const hasSets = sets && Object.keys(sets).length > 0;
        opMap.set(operation, hasSets ? sets : null);
      }

      this.roleSets.set(role, opMap);
    }
  }

  private hasValidFilter(filter: unknown): filter is Record<string, unknown> {
    if (!isObject(filter)) return false;
    const keys = Object.keys(filter).filter((k) => k !== 'columns' && k !== 'check');
    return keys.length > 0;
  }

  // Public getters - just return precomputed data
  getTableFields(): string[] {
    return this.fields;
  }

  getRolePermissions(role: string, field: string): FieldRolePermissions[] {
    return this.fieldPermissions.get(field)?.get(role) ?? [];
  }

  getRoleFilters(role: string, operation: CRUDOperation): Record<string, unknown> | null {
    return this.roleFilters.get(role)?.get(operation) ?? null;
  }

  getRoleSets(role: string, operation: CRUDOperation): Record<string, string> | null {
    return this.roleSets.get(role)?.get(operation) ?? null;
  }

  formatFilter(filter: Record<string, unknown> | null | undefined): string {
    if (!filter) return '';
    const keys = Object.keys(filter).filter((k) => k !== 'columns' && k !== 'check');
    if (keys.length === 0) return '';
    return JSON.stringify(filter, null, 2);
  }

  formatSet(set: Record<string, string> | null | undefined, separator = '\n'): string {
    if (!set) return '';
    return Object.entries(set)
      .map(([key, value]) => `${key}=${value}`)
      .join(separator);
  }

  private precomputePathHashes(): void {
    // Collect all filters across all roles and operations
    for (const role of this.allRoles) {
      for (const operation of CRUDOperationsList) {
        const filter = this.roleFilters.get(role)?.get(operation);
        if (filter) {
          // Use a unique prefix for each role+operation combination
          const prefix = `${role}:${operation}`;
          this.collectPathHashes(filter, prefix);
        }
      }
    }
  }

  private collectPathHashes(obj: unknown, currentPath: string): void {
    // Compute hash for this path
    const hash = getValueHash(obj);
    this.pathToHash.set(currentPath, hash);

    // Recursively process children
    if (!isObject(obj)) {
      return;
    }

    if (isArray(obj)) {
      obj.forEach((item, index) => {
        this.collectPathHashes(item, `${currentPath}[${index}]`);
      });
    } else {
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        this.collectPathHashes(value, `${currentPath}.${key}`);
      }
    }
  }

  // Get hash for a specific path
  getPathHash(path: string): string | undefined {
    return this.pathToHash.get(path);
  }
}
