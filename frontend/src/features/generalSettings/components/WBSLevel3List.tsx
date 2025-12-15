import React from 'react';
import { WBSItemRow } from './WBSItemRow';
import { IWBSLevel3, IWBSItem } from '../../wbs/types/wbs';

interface WBSLevel3ListProps {
  items: IWBSLevel3[];
  parentLabel: string;
  onEdit: (item: IWBSItem) => void;
  onDelete: (item: IWBSItem) => void;
}

export const WBSLevel3List: React.FC<WBSLevel3ListProps> = ({
  items,
  parentLabel,
  onEdit,
  onDelete,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <>
      {items.map((item, index) => (
        <WBSItemRow
          key={item.id}
          id={item.id}
          label={item.label}
          levelLabel={`L3-${index + 1}`}
          parentLabel={parentLabel}
          isExpanded={false}
          hasChildren={false}
          backgroundColor="#fafafa"
          paddingLeft={8}
          fontWeight={400}
          onToggle={() => {}}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </>
  );
};
