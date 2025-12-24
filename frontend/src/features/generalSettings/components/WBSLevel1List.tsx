import React from 'react';
import { TableRow, TableCell, Typography } from '@mui/material';
import { WBSItemRow } from './WBSRowItem';
import { WBSLevel2List } from './WBSLevel2List';
import { CollapsibleTableRow } from '../common/CollapsibleTableRow';
import { IWBSLevel1, IWBSItem } from '../../wbs/types/wbs';

interface WBSLevel1ListProps {
  items: IWBSLevel1[];
  expandedLevel1Ids: Set<string>;
  expandedLevel2Ids: Set<string>;
  onToggleLevel1: (id: string) => void;
  onToggleLevel2: (id: string) => void;
  onEdit: (item: IWBSItem) => void;
  onDelete: (item: IWBSItem) => void;
  onAddLevel2: (parentId: string) => void;
  onAddLevel3: (parentId: string) => void;
}

export const WBSLevel1List: React.FC<WBSLevel1ListProps> = ({
  items,
  expandedLevel1Ids,
  expandedLevel2Ids,
  onToggleLevel1,
  onToggleLevel2,
  onEdit,
  onDelete,
  onAddLevel2,
  onAddLevel3,
}) => {
  if (!items || items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} align="center">
          <Typography variant="body2" color="text.secondary">
            No WBS options available. Click "Add Item" to create Level 1 items.
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const isExpanded = expandedLevel1Ids.has(item.id);
        const hasChildren = !!item.children && item.children.length > 0;

        return (
          <React.Fragment key={item.id}>
            <WBSItemRow
              id={item.id}
              label={item.label}
              levelLabel={`L1-${index + 1}`}
              parentLabel={null}
              isExpanded={isExpanded}
              hasChildren={hasChildren}
              backgroundColor="#e8f4f8"
              paddingLeft={2}
              fontWeight={600}
              onToggle={() => onToggleLevel1(item.id)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
              onAddChild={() => onAddLevel2(item.id)}
              showAddChild={true}
              addChildLabel="Add Level 2"
            />
            {hasChildren && (
              <CollapsibleTableRow isOpen={isExpanded} colSpan={4}>
                <WBSLevel2List
                  items={item.children!}
                  parentLabel={item.label}
                  expandedIds={expandedLevel2Ids}
                  onToggle={onToggleLevel2}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddLevel3={onAddLevel3}
                />
              </CollapsibleTableRow>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
