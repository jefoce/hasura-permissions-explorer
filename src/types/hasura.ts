export interface Table {
  name: string;
  schema?: string;
}

export interface Permission {
  role: string;
  permission: {
    columns?: string[] | string;
    filter?: Record<string, unknown>;
    check?: Record<string, unknown>;
    set?: Record<string, string>;
  };
}

export interface TablePermissions {
  table: Table;
  insert_permissions?: Permission[];
  select_permissions?: Permission[];
  update_permissions?: Permission[];
  delete_permissions?: Permission[];
}

export interface Source {
  name: string;
  tables: TablePermissions[];
}

export interface HasuraMetadata {
  metadata?: {
    sources: Source[];
  };
  sources?: Source[];
}

export enum CRUDOperation {
  Create = 'C',
  Read = 'R',
  Update = 'U',
  Delete = 'D',
}
export const CRUDOperationsList = Object.values(CRUDOperation);

export const OperationFullNames: Record<CRUDOperation, string> = {
  [CRUDOperation.Create]: 'Create',
  [CRUDOperation.Read]: 'Read',
  [CRUDOperation.Update]: 'Update',
  [CRUDOperation.Delete]: 'Delete',
};

export interface FieldPermission {
  allowed: boolean;
  filter?: string;
}

export interface RolePermissions {
  C: FieldPermission;
  R: FieldPermission;
  U: FieldPermission;
  D: FieldPermission;
}
