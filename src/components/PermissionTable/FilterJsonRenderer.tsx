import { isObject, isArray, isString, isNull } from 'lodash-es';
import React, { memo, useCallback } from 'react';

import type { HasuraTableService } from '@/services/HasuraTableService';

export type FilterJsonRendererProps = {
  data: unknown;
  path?: string;
  pathPrefix: string;
  service: HasuraTableService;
  selectedHash: string | null;
  onPathClick: (path: string) => void;
  indent?: number;
};

export const FilterJsonRenderer = memo<FilterJsonRendererProps>((props) => {
  const { data, path = '', pathPrefix, service, selectedHash, onPathClick, indent = 0 } = props;
  // Build the full path with prefix for hash lookup
  const fullPath = path ? `${pathPrefix}.${path}` : pathPrefix;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPathClick(fullPath);
    },
    [fullPath, onPathClick]
  );

  // Check if this path should be highlighted
  const pathHash = service.getPathHash(fullPath);
  const isHighlighted = selectedHash !== null && pathHash === selectedHash;

  const baseStyle: React.CSSProperties = {
    display: 'inline',
    transition: 'background-color 200ms',
    borderRadius: '2px',
    padding: '0 2px',
  };

  const containerStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: isHighlighted ? '#ffeb3b' : 'transparent',
    cursor: 'pointer',
  };

  const indentStr = '  '.repeat(indent);
  const childIndentStr = '  '.repeat(indent + 1);

  if (isNull(data)) {
    return (
      <span style={containerStyle} onClick={handleClick}>
        null
      </span>
    );
  }

  if (!isObject(data)) {
    const displayValue = isString(data) ? `"${data}"` : String(data);
    return (
      <span style={containerStyle} onClick={handleClick}>
        {displayValue}
      </span>
    );
  }

  if (isArray(data)) {
    if (data.length === 0) {
      return (
        <span style={containerStyle} onClick={handleClick}>
          []
        </span>
      );
    }
    return (
      <span style={containerStyle} onClick={handleClick}>
        {'['}
        {data.map((item, index) => (
          <span key={index}>
            {'\n'}
            {childIndentStr}
            <FilterJsonRenderer
              data={item}
              path={`${path}[${index}]`}
              pathPrefix={pathPrefix}
              service={service}
              selectedHash={selectedHash}
              onPathClick={onPathClick}
              indent={indent + 1}
            />
            {index < data.length - 1 && ','}
          </span>
        ))}
        {'\n'}
        {indentStr}
        {']'}
      </span>
    );
  }

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) {
    return (
      <span style={containerStyle} onClick={handleClick}>
        {'{}'}
      </span>
    );
  }

  return (
    <span style={containerStyle} onClick={handleClick}>
      {'{'}
      {entries.map(([key, value], index) => {
        const childPath = path ? `${path}.${key}` : key;
        const childFullPath = `${pathPrefix}.${childPath}`;
        const childPathHash = service.getPathHash(childFullPath);
        const isChildHighlighted = selectedHash !== null && childPathHash === selectedHash;

        // Key style: highlight if the child path has the same hash as selected
        const keyStyle: React.CSSProperties = {
          backgroundColor: isChildHighlighted ? '#ffeb3b' : undefined,
          color: '#1976d2',
          cursor: 'pointer',
        };

        return (
          <span key={key}>
            {'\n'}
            {childIndentStr}
            <span
              className="json-key"
              style={keyStyle}
              onClick={(e) => {
                e.stopPropagation();
                onPathClick(childFullPath);
              }}
            >
              "{key}"
            </span>
            :{' '}
            <FilterJsonRenderer
              data={value}
              path={childPath}
              pathPrefix={pathPrefix}
              service={service}
              selectedHash={selectedHash}
              onPathClick={onPathClick}
              indent={indent + 1}
            />
            {index < entries.length - 1 && ','}
          </span>
        );
      })}
      {'\n'}
      {indentStr}
      {'}'}
    </span>
  );
});
