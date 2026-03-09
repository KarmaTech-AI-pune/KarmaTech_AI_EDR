import { useState, useEffect } from 'react';
import { useProject } from '../../../context/ProjectContext';
import { WBSStructureAPI, WBSOptionsAPI } from '../services/wbsApi';
import { ResourceAPI } from '../../../services/resourceApi';
import { WBSOption, WBSRowData, TaskType } from '../types/wbs';
import { resourceRole } from '../../../models/resourceRoleModel';
import { Employee } from '../../../models/employeeModel';

interface PlannedHours {
  [year: string]: {
    [month: string]: number;
  };
}

interface UseWBSDataProps {
  formType: 'manpower' | 'odc';
}

export const useWBSData = ({ formType }: UseWBSDataProps) => {
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
  const findWBSOptionById = (optionId: string, l1: WBSOption[], l2Map: { [key: string]: WBSOption[] }, l3Map: { [key: string]: WBSOption[] }): WBSOption | undefined => {
    // Search in level 1 options
    let found = l1.find(opt => opt.id === optionId);
    if (found) return found;

    // Search in level 2 options map
    for (const key in l2Map) {
      if (l2Map.hasOwnProperty(key)) {
        found = l2Map[key].find(opt => opt.id === optionId);
        if (found) return found;
      }
    }

    // Search in level 3 options map
    for (const key in l3Map) {
      if (l3Map.hasOwnProperty(key)) {
        found = l3Map[key].find(opt => opt.id === optionId);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Separate function to calculate and set months based on provided rows
  const calculateAndSetMonths = (rowsToCalculateFrom: WBSRowData[]) => {
    const allMonths = new Set<string>();
    rowsToCalculateFrom.forEach((row) => {
      if (row.plannedHours) {
        Object.keys(row.plannedHours).forEach(year => {
          const yearStr = year.toString().slice(2); // Ensure year is string, then slice
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
        // Handle potential parsing errors
        const yearIntA = parseInt(yearA);
        const yearIntB = parseInt(yearB);
        if (isNaN(yearIntA) || isNaN(yearIntB)) return 0; // Default sort order if year parsing fails

        const yearDiff = yearIntA - yearIntB;
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
      });
      setMonths(sortedMonths);
    } else {
      // If no months found in data, potentially set default months based on start date
      const startDate = getProjectStartDate(); // This will need to be passed or fetched
      if (startDate) {
        const date = new Date(startDate);
        const initialMonths = [];
        for (let i = 0; i < 5; i++) { // Default to 5 months if none exist
          initialMonths.push(
            `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear().toString().slice(2)}`
          );
          date.setMonth(date.getMonth() + 1);
        }
        setMonths(initialMonths);
      } else {
        setMonths([]); // Set empty if no start date either
      }
    }
  };

  const getProjectStartDate = () => {
    // This function needs to be updated to get project details from an API if needed,
    // as the full project object is no longer in the context.
    // For now, we'll assume a start date is always present for simplicity.
    // A more robust solution would involve fetching project details using the projectId.
    return new Date().toISOString(); // Placeholder
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Convert formType to numeric value for API
      const formTypeValue = formType === 'odc' ? 1 : 0; // 0 = Manpower, 1 = ODC

      let l1Options: WBSOption[] = [];
      let newLevel2OptionsMap: { [key: string]: WBSOption[] } = {};
      let newLevel3OptionsMap: { [key: string]: WBSOption[] } = {};

      // Load WBS options (level 1 and 2)
      try {
        const fetchedL1Options = await WBSOptionsAPI.getLevel1Options(formTypeValue);
        l1Options = fetchedL1Options;

        // Fetch level 2 options for each level 1 option and store as keyed map
        const level2Promises = l1Options.map(async (level1Option) => {
          const level2Options = await WBSOptionsAPI.getLevel2Options(level1Option.id, formTypeValue);
          return { parentValue: level1Option.value.toLowerCase(), options: level2Options };
        });
        const level2Results = await Promise.all(level2Promises);

        // Build level 2 options map
        level2Results.forEach(result => {
          newLevel2OptionsMap[result.parentValue] = result.options;
        });

        setLevel1Options(l1Options);
        setLevel2OptionsMap(newLevel2OptionsMap);
      } catch (error) {
        console.error('Error loading WBS options (level 1 & 2):', error);
        setSnackbarMessage('Failed to load work description options. Please ensure the backend service is running and database is properly configured with WBS options.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLevel1Options([]);
        setLevel2OptionsMap({});
      }

      // Load roles and employees
      try {
        const [allRoles, employees] = await Promise.all([
          ResourceAPI.getAllRoles(),
          ResourceAPI.getAllEmployees()
        ]);
        setRoles(allRoles);
        setAllEmployees(employees);
      } catch (error) {
        console.error('Error loading roles and employees:', error);
        setSnackbarMessage('Failed to load resource roles and employees.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setRoles([]);
        setAllEmployees([]);
      }

      // Load existing WBS data if project is selected
      let initialManpowerRows: WBSRowData[] = [];
      let initialOdcRows: WBSRowData[] = [];
      if (projectId) {
        try {
          const wbsResponse = await WBSStructureAPI.getProjectWBS(projectId);
          const wbsData = wbsResponse.tasks;
          const fetchedWbsHeaderId = wbsResponse.wbsHeaderId;

          // Store the wbsHeaderId for later use when saving
          setWbsHeaderId(fetchedWbsHeaderId);

          const allTransformedRows = wbsData.map((task) => {
            const transformedPlannedHours: PlannedHours = {};
            
            if (task.plannedHours && Array.isArray(task.plannedHours)) {
              task.plannedHours.forEach((monthEntry: any) => {
                if (monthEntry && typeof monthEntry === 'object' && monthEntry.year && monthEntry.month && typeof monthEntry.plannedHours === 'number') {
                  const yearStr = monthEntry.year.toString();
                  const monthName = monthEntry.month;
                  if (!transformedPlannedHours[yearStr]) {
                    transformedPlannedHours[yearStr] = {};
                  }
                  transformedPlannedHours[yearStr][monthName] = monthEntry.plannedHours;
                }
              });
            } else if (task.plannedHours && typeof task.plannedHours === 'object') {
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
              odc: isOdcTask ? task.totalCost : (task.odc || 0),
              odcHours: isOdcTask ? task.totalHours : 0,
              totalHours: task.totalHours || 0,
              totalCost: task.totalCost || 0,
              parentId: task.parentId ? task.parentId.toString() : null,
              taskType: task.taskType !== undefined ? task.taskType : (formType === 'odc' ? TaskType.ODC : TaskType.Manpower),
              unit: isOdcTask ? (task.resourceUnit ?? '') : 'hours',
              resource_role: (task as any).resourceRoleId ?? null,
              resource_role_name: (task as any).resourceRoleName ?? null,
              wbsOptionId: (task as any).wbsOptionId ?? null, // Capture wbsOptionId from backend
              workBreakdownStructureId: (task as any).workBreakdownStructureId || 0 // Capture workBreakdownStructureId
            };
          });

          // Filter rows based on TaskType
          initialManpowerRows = allTransformedRows.filter(row => row.taskType === TaskType.Manpower);
          initialOdcRows = allTransformedRows.filter(row => row.taskType === TaskType.ODC);

          setManpowerRows(initialManpowerRows);
          setOdcRows(initialOdcRows);
          calculateAndSetMonths(formType === 'manpower' ? initialManpowerRows : initialOdcRows);

          // Dynamically load level 3 options for existing level 2 tasks
          const uniqueLevel2Titles = new Set<string>();
          const rowsToProcess = formType === 'manpower' ? initialManpowerRows : initialOdcRows;
          rowsToProcess.filter(row => row.level === 2 && row.wbsOptionId).forEach(row => {
            if (row.wbsOptionId) {
              const option = findWBSOptionById(row.wbsOptionId, l1Options, newLevel2OptionsMap, {});
              if (option) {
                uniqueLevel2Titles.add(option.value);
              }
            }
          });

          await Promise.all(
            Array.from(uniqueLevel2Titles).map(async (level2Title) => {
              try {
                // Find the level 2 option by value to get its ID from the map
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

          // After all options are loaded, re-process allTransformedRows to set titles based on wbsOptionId
          const finalTransformedRows = allTransformedRows.map(row => {
            if (row.wbsOptionId) {
              const option = findWBSOptionById(row.wbsOptionId, l1Options, newLevel2OptionsMap, newLevel3OptionsMap);
              if (option) {
                return { ...row, title: option.value.toLowerCase() };
              }
            }
            return row;
          });

          // Filter rows based on TaskType
          initialManpowerRows = finalTransformedRows.filter(row => row.taskType === TaskType.Manpower);
          initialOdcRows = finalTransformedRows.filter(row => row.taskType === TaskType.ODC);

          setManpowerRows(initialManpowerRows);
          setOdcRows(initialOdcRows);
          calculateAndSetMonths(formType === 'manpower' ? initialManpowerRows : initialOdcRows);

        } catch (error) {
          console.error('Error loading WBS data:', error);
          setSnackbarMessage('Failed to load WBS data');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setManpowerRows([]);
          setOdcRows([]);
          setMonths([]);
          setLevel3OptionsMap({});
        }
      } else {
        setManpowerRows([]);
        setOdcRows([]);
        setMonths([]);
        setLevel3OptionsMap({});
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setSnackbarMessage('Failed to load initial data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId, formType, lastUpdateTime]);

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
