import { WBSRowData } from '../types/wbs';
// import { GanttTask, GanttLink } from '../types/gantt';


export const transformWbsToGantt = (wbsData: WBSRowData[]) => {

  const tasks = wbsData.map(wbsRow => {
    const startDate = new Date(2025, 6, 11);
    const endDate = new Date(2025, 9, 12);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: wbsRow.id,
      text: wbsRow.title,
      start: startDate,
      duration: duration,
      progress: 93,
      parent: wbsRow.parentId || undefined,
    };
  });
  
  const links = tasks
    .filter(link => link.parent!== null) // Ensure the task has a parent
    .map(link => {
      return {
        id: link.id,
        source: link.parent!,
        target: link.id,
        type:"e2s"
      }
    })

  return {tasks, links};
};


