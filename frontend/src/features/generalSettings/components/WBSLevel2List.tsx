import React from 'react';
import { WBSItemRow } from './WBSItemRow';
import { WBSLevel3List } from './WBSLevel3List';
import { CollapsibleTableRow } from '../common/CollapsibleTableRow';
import { IWBSLevel2, IWBSItem } from '../../wbs/types/wbs';

interface WBSLevel2ListProps {
  items: IWBSLevel2[];
  parentLabel: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onEdit: (item: IWBSItem) => void;
  onDelete: (item: IWBSItem) => void;
  onAddLevel3: (parentId: string) => void;
}

export const WBSLevel2List: React.FC<WBSLevel2ListProps> = ({
  items,
  parentLabel,
  expandedIds,
  onToggle,
  onEdit,
  onDelete,
  onAddLevel3,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item, index) => {
        const isExpanded = expandedIds.has(item.id);
        const hasChildren = !!item.children && item.children.length > 0;

        return (
          <React.Fragment key={item.id}>
            <WBSItemRow
              id={item.id}
              label={item.label}
              levelLabel={`L2-${index + 1}`}
              parentLabel={parentLabel}
              isExpanded={isExpanded}
              hasChildren={hasChildren}
              backgroundColor="#f5f5f5"
              paddingLeft={6}
              fontWeight={500}
              onToggle={() => onToggle(item.id)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
              onAddChild={() => onAddLevel3(item.id)}
              showAddChild={true}
              addChildLabel="Add Level 3"
            />
            {hasChildren && (
              <CollapsibleTableRow isOpen={isExpanded} colSpan={4}>
                <WBSLevel3List
                  items={item.children!}
                  parentLabel={item.label}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </CollapsibleTableRow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
