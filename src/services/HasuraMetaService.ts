import { flatMap, uniq, sortBy } from 'lodash-es';

import type { TablePermissions, HasuraMetadata } from '@/types/hasura';
import { fnMemo } from '@/utils/memoize';

import { HasuraTableService } from './HasuraTableService';

export interface MetadataResult {
  tables: HasuraTableService[];
  allRoles: string[];
  error: string | null;
}

export class HasuraMetaService {
  readonly tables: HasuraTableService[];
  readonly allRoles: string[];
  readonly error: string | null;
  readonly rawMetadata: HasuraMetadata;

  constructor(data: HasuraMetadata) {
    this.rawMetadata = data;
    const result = this.parseMetadata(data);
    this.tables = result.tables;
    this.allRoles = result.allRoles;
    this.error = result.error;
  }

  private parseMetadata(data: unknown): MetadataResult {
    try {
      const metadata = data as HasuraMetadata;
      const sources = metadata?.metadata?.sources || metadata?.sources;

      if (!sources) {
        return {
          tables: [],
          allRoles: [],
          error: 'Invalid metadata format: no sources found',
        };
      }

      const tablePermissions = flatMap(sources, (source) => source.tables).filter(
        (table: TablePermissions) =>
          table.select_permissions || table.update_permissions || table.insert_permissions || table.delete_permissions
      );

      const allRoles = this.extractAllRoles(tablePermissions);

      const tables = tablePermissions.map((permissions) => new HasuraTableService(permissions, allRoles));

      return {
        tables,
        allRoles,
        error: null,
      };
    } catch {
      return {
        tables: [],
        allRoles: [],
        error: 'Failed to parse metadata',
      };
    }
  }

  private extractAllRoles(tables: TablePermissions[]): string[] {
    const allRoles = flatMap(tables, (table) => this.getTableRoles(table));
    return sortBy(uniq(allRoles));
  }

  private getTableRoles(table: TablePermissions): string[] {
    const roles = [
      ...(table.insert_permissions || []),
      ...(table.select_permissions || []),
      ...(table.update_permissions || []),
      ...(table.delete_permissions || []),
    ].map((perm) => perm.role);

    return sortBy(uniq(roles));
  }

  // Memoized filtering - returns table names that have visible fields based on search criteria
  getVisibleTableNames = fnMemo(
    (searchQuery: string = '', searchExactMatch: boolean = false, searchCaseSensitive: boolean = false): string[] => {
      return this.tables
        .filter((table) => table.hasVisibleFields(searchQuery, searchExactMatch, searchCaseSensitive))
        .map((t) => t.tableName);
    },
    20
  );
}
