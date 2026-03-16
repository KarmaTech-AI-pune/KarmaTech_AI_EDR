import { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { WBSStructureAPI, WBSOptionsAPI } from '../services/wbsApi';
import { ResourceAPI } from '../../../services/resourceApi';
import { WBSOption, WBSRowData, TaskType } from '../types/wbs';
import { resourceRole } from '../../../models/resourceRoleModel';
import { Employee } from '../../../models/employeeModel';
import { wbsVersionApi } from '../services/wbsVersionApi';

interface PlannedHours {
  [year: string]: {
    [month: string]: number;
  };
}

interface UseWBSDataProps {
  formType: 'manpower' | 'odc';
  selectedVersion: string | null;
}

export const useWBSData = ({ formType, selectedVersion }: UseWBSDataProps) => {
  const { projectId } = useProject();
  const [manpowerRows, setManpowerRows] = useState<WBSRowData[]>([]);
  const [odcRows, setOdcRows] = useState<WBSRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<resourceRole[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [level1Options, setLevel1Options] = useState<WBSOption[]>([]);
  const [level2OptionsMap, setLevel2OptionsMap] = useState<{ [key: string]: WBSOption[] }>({});
  const [level3OptionsMap, setLevel3OptionsMap] = useState<{ [key: string]: WBSOption[] }>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [wbsHeaderId, setWbsHeaderId] = useState<number>(0);

  // Helper function to find a WBS option by its ID
  const findWBSOptionById = (optionId: any, l1: WBSOption[], l2Map: { [key: string]: WBSOption[] }, l3Map: { [key: string]: WBSOption[] }): WBSOption | undefined => {
    if (optionId === null || optionId === undefined) return undefined;
    const idStr = optionId.toString();

    let found = l1.find(opt => opt.id.toString() === idStr);
    if (found) return found;

    for (const key in l2Map) {
      if (l2Map.hasOwnProperty(key)) {
        found = l2Map[key].find(opt => opt.id.toString() === idStr);
        if (found) return found;
      }
    }

    for (const key in l3Map) {
      if (l3Map.hasOwnProperty(key)) {
        found = l3Map[key].find(opt => opt.id.toString() === idStr);
        if (found) return found;
      }
    }
    return undefined;
  };

  const getProjectStartDate = () => {
    return new Date().toISOString();
  };

  const calculateAndSetMonths = (rowsToCalculateFrom: WBSRowData[]) => {
    const allMonths = new Set<string>();
    rowsToCalculateFrom.forEach((row) => {
      if (row.plannedHours) {
        Object.keys(row.plannedHours).forEach(year => {
          const yearStr = year.toString().slice(2);
          Object.keys(row.plannedHours[year]).forEach(monthName => {
            allMonths.add(`${monthName} ${yearStr}`);
          });
        });
      }
    });

    if (allMonths.size > 0) {
      const sortedMonths = Array.from(allMonths).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const yearIntA = parseInt(yearA);
        const yearIntB = parseInt(yearB);
        if (isNaN(yearIntA) || isNaN(yearIntB)) return 0;

        const yearDiff = yearIntA - yearIntB;
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
      });
      setMonths(sortedMonths);
    } else {
      const startDate = getProjectStartDate();
      if (startDate) {
        const date = new Date(startDate);
        const initialMonths = [];
        for (let i = 0; i < 5; i++) {
          initialMonths.push(
            `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear().toString().slice(2)}`
          );
          date.setMonth(date.getMonth() + 1);
        }
        setMonths(initialMonths);
      } else {
        setMonths([]);
      }
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const formTypeValue = formType === 'odc' ? 1 : 0;

      let l1Options: WBSOption[] = [];
      const newLevel2OptionsMap: { [key: string]: WBSOption[] } = {};
      const newLevel3OptionsMap: { [key: string]: WBSOption[] } = {};

      try {
        const fetchedL1Options = await WBSOptionsAPI.getLevel1Options(formTypeValue);
        l1Options = fetchedL1Options;

        const level2Promises = l1Options.map(async (level1Option) => {
          const level2Options = await WBSOptionsAPI.getLevel2Options(level1Option.id, formTypeValue);
          return { parentValue: level1Option.value.toLowerCase(), options: level2Options };
        });
        const level2Results = await Promise.all(level2Promises);

        level2Results.forEach(result => {
          newLevel2OptionsMap[result.parentValue] = result.options;
        });

        setLevel1Options(l1Options);
        setLevel2OptionsMap(newLevel2OptionsMap);
      } catch (error) {
        console.error('Error loading WBS options:', error);
        setSnackbarMessage('Failed to load work description options.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }

      try {
        const [allRoles, employees] = await Promise.all([
          ResourceAPI.getAllRoles(),
          ResourceAPI.getAllEmployees()
        ]);
        setRoles(allRoles);
        setAllEmployees(employees);
      } catch (error) {
        console.error('Error loading roles/employees:', error);
      }

      if (projectId) {
        try {
          let wbsData: any[] = [];
          let fetchedWbsHeaderId = 0;

          if (selectedVersion) {
            const [versionRes, liveRes] = await Promise.all([
              wbsVersionApi.getWBSVersion(projectId.toString(), selectedVersion),
              WBSStructureAPI.getProjectWBS(projectId)
            ]);

            wbsData = versionRes.tasks;
            fetchedWbsHeaderId = (versionRes as any).wbsHeaderId || 0;

            // --- Hierarchy Reconstruction (UI-Only Fix) ---
            // Create maps for quick lookup
            const originalToVersionIdMap = new Map<number, string>();
            wbsData.forEach((task: any) => {
              if (task.originalTaskId) originalToVersionIdMap.set(task.originalTaskId, task.id.toString());
            });

            const liveTasks = (liveRes.workBreakdownStructures || []).flatMap((wbs: any) =>
              (wbs.tasks || []).map((task: any) => ({
                ...task,
                workBreakdownStructureId: wbs.workBreakdownStructureId
              }))
            );

            const liveTemplateMap = new Map<number, { parentId: number | null, wbsId: number, optionId: any, title: string }>();
            liveTasks.forEach((task: any) => {
              liveTemplateMap.set(task.id, {
                parentId: task.parentId,
                wbsId: task.workBreakdownStructureId,
                optionId: task.wbsOptionId,
                title: task.title
              });
            });

            // Restore ParentId, WorkBreakdownStructureId, wbsOptionId, AND title from live template
            wbsData = wbsData.map((task: any) => {
              const template = liveTemplateMap.get(task.originalTaskId);
              if (template) {
                const reconstructedParentId = template.parentId ? originalToVersionIdMap.get(template.parentId) : null;
                return {
                  ...task,
                  workBreakdownStructureId: template.wbsId,
                  wbsOptionId: template.optionId || task.wbsOptionId, // Use template as fallback for optionId
                  title: template.title || task.title, // Restore title from template (CRITICAL for Version 1.0)
                  parentId: reconstructedParentId || null
                };
              }
              return task;
            });
          } else {
            const wbsResponse = await WBSStructureAPI.getProjectWBS(projectId);
            wbsData = wbsResponse.tasks;
            fetchedWbsHeaderId = wbsResponse.wbsHeaderId;
          }

          // Step 2: Use the processed data (no more accidental filtering by header ID)
          const wbsDataToProcess = wbsData;

          const uniqueTasks = Array.from(new Map(wbsDataToProcess.map((task: any) => [task.id, task])).values());
          setWbsHeaderId(fetchedWbsHeaderId);

          const allTransformedRows: WBSRowData[] = uniqueTasks.map((task: any) => {
            const transformedPlannedHours: PlannedHours = {};
            
            if (task.plannedHours && Array.isArray(task.plannedHours)) {
              task.plannedHours.forEach((monthEntry: any) => {
                if (monthEntry?.year && monthEntry?.month) {
                  const yearStr = monthEntry.year.toString();
                  if (!transformedPlannedHours[yearStr]) transformedPlannedHours[yearStr] = {};
                  transformedPlannedHours[yearStr][monthEntry.month] = monthEntry.plannedHours;
                }
              });
            } else if (task.plannedHours) {
              Object.assign(transformedPlannedHours, task.plannedHours);
            }
            
            // Debug: Log only if plannedHours exist
            if (Object.keys(transformedPlannedHours).length > 0) {
              console.log(`Task ${task.id} transformed plannedHours:`, transformedPlannedHours);
            }

            const isOdcTask = task.taskType === TaskType.ODC;
            return {
              id: task.id ? task.id.toString() : '',
              level: task.level,
              title: task.title,
              role: isOdcTask ? null : (task.assignedUserId || null),
              name: isOdcTask ? (task.resourceName ?? null) : (task.assignedUserId?.toString() || null),
              costRate: task.costRate || 0,
              plannedHours: transformedPlannedHours,
              odc: isOdcTask ? (task.totalCost || 0) : (task.odc || 0),
              odcHours: isOdcTask ? (task.totalHours || 0) : 0,
              totalHours: task.totalHours || 0,
              totalCost: task.totalCost || (Number(task.totalHours || 0) * Number(task.costRate || 0)),
              parentId: task.parentId ? task.parentId.toString() : null,
              taskType: task.taskType !== undefined ? task.taskType : (formType === 'odc' ? TaskType.ODC : TaskType.Manpower),
              unit: isOdcTask ? (task.resourceUnit || task.unit || '') : 'hours',
              resource_role: task.resourceRoleId ?? (task as any).resourceRoleId ?? null,
              resource_role_name: task.resourceRoleName ?? (task as any).resourceRoleName ?? null,
              wbsOptionId: task.wbsOptionId ?? (task as any).wbsOptionId ?? null,
              workBreakdownStructureId: task.workBreakdownStructureId ?? (task as any).workBreakdownStructureId ?? 0
            };
          });

          let initialManpowerRows = allTransformedRows.filter(row => row.taskType === TaskType.Manpower);
          let initialOdcRows = allTransformedRows.filter(row => row.taskType === TaskType.ODC);

          setManpowerRows(initialManpowerRows);
          setOdcRows(initialOdcRows);
          calculateAndSetMonths(formType === 'manpower' ? initialManpowerRows : initialOdcRows);

          const uniqueLevel2Titles = new Set<string>();
          const rowsToProcess = formType === 'manpower' ? initialManpowerRows : initialOdcRows;
          rowsToProcess.filter(row => row.level === 2 && row.wbsOptionId).forEach(row => {
            if (row.wbsOptionId) {
              const option = findWBSOptionById(row.wbsOptionId, l1Options, newLevel2OptionsMap, {});
              if (option) uniqueLevel2Titles.add(option.value);
            }
          });

          await Promise.all(
            Array.from(uniqueLevel2Titles).map(async (level2Title) => {
              try {
                let level2Option: WBSOption | undefined;
                for (const key in newLevel2OptionsMap) {
                  level2Option = newLevel2OptionsMap[key].find(opt => opt.value === level2Title);
                  if (level2Option) break;
                }
                if (level2Option) {
                  const options = await WBSOptionsAPI.getLevel3Options(level2Option.id, formTypeValue);
                  newLevel3OptionsMap[level2Title.toLowerCase()] = options;
                }
              } catch (error) {
                console.error(`Error loading level 3 options for ${level2Title}:`, error);
              }
            })
          );
          setLevel3OptionsMap(newLevel3OptionsMap);

          const finalTransformedRows = allTransformedRows.map(row => {
            let finalTitle = row.title; // Template title

            if (row.wbsOptionId) {
              const option = findWBSOptionById(row.wbsOptionId, l1Options, newLevel2OptionsMap, newLevel3OptionsMap);
              if (option) {
                finalTitle = option.value; // Exact value match for Select
              } else if (finalTitle && finalTitle.includes(' ')) {
                // Robust Fallback: If option lookup fails (e.g. level 3 options not loaded yet),
                // and we have a human title from template, convert it to a safe value match.
                finalTitle = finalTitle.toLowerCase().replace(/ /g, '_');
              }
            }
            return { ...row, title: finalTitle };
          });

          setManpowerRows(finalTransformedRows.filter(row => row.taskType === TaskType.Manpower));
          setOdcRows(finalTransformedRows.filter(row => row.taskType === TaskType.ODC));
          calculateAndSetMonths(formType === 'manpower' ? finalTransformedRows.filter(row => row.taskType === TaskType.Manpower) : finalTransformedRows.filter(row => row.taskType === TaskType.ODC));

        } catch (error) {
          console.error('Error loading WBS data:', error);
          setSnackbarMessage('Failed to load WBS data');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Error in loadInitialData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId, formType, lastUpdateTime, selectedVersion]);

  const reloadWBSData = () => setLastUpdateTime(Date.now());

  return {
    manpowerRows,
    setManpowerRows,
    odcRows,
    setOdcRows,
    months,
    setMonths,
    roles,
    setRoles,
    allEmployees,
    setAllEmployees,
    loading,
    setLoading,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    level1Options,
    setLevel1Options,
    level2OptionsMap,
    setLevel2OptionsMap,
    level3OptionsMap,
    setLevel3OptionsMap,
    reloadWBSData,
    getProjectStartDate,
    wbsHeaderId,
  };
};
