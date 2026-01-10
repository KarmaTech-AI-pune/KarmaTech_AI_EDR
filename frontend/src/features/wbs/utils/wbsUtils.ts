import { IWBSItem, IWBSData, IWBSLevel2, IWBSLevel3 } from '../types/wbs';

/**
 * Returns the human-readable parent label for a given WBS item.
 * - Returns null for Level 1 and Level 2 items (as per clarification).
 * - For Level 3 items, it finds the corresponding Level 2 item and returns its label.
 */
export const getWBSParentLabel = (item: IWBSItem, allLevelsData: IWBSData): string | null => {
  if (item.level === 1 || item.level === 2) {
    return null; // As clarified, Level 1 and Level 2 items display NULL parent
  }

  if (item.level === 3) {
    const level3Item = item as IWBSLevel3;
    // Find the parent Level 2 item
    const parentLevel2 = allLevelsData.level2.find(
      (lvl2: IWBSLevel2) => Number(lvl2.id) === level3Item.parentId
    );
    return parentLevel2 ? parentLevel2.label : null;
  }

  return null;
};

/**
 * Transforms the nested level3 data object into a flat array of IWBSLevel3 items.
 * This makes it easier to iterate and display in a generic table component.
 */
export const transformLevel3Data = (
  level3Data: { [key: string]: IWBSLevel3[] }
): IWBSLevel3[] => {
  let flattenedData: IWBSLevel3[] = [];
  for (const key in level3Data) {
    if (Object.prototype.hasOwnProperty.call(level3Data, key)) {
      flattenedData = flattenedData.concat(level3Data[key]);
    }
  }
  return flattenedData;
};