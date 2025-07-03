import React, { useState, useEffect } from 'react';
import { Gantt } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import { Willow } from 'wx-react-gantt';
import { WBSStructureAPI } from './../../services/wbsApi';
import { transformWbsToGantt } from '../../utils/wbsToGantt';
import { GanttTask, GanttLink } from './../../types/gantt';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [links, setLinks] = useState<GanttLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWbs = async () => {
      try {
        setLoading(true);
        const wbsData = await WBSStructureAPI.getProjectWBS(projectId);
        const { tasks, links } = transformWbsToGantt(wbsData);
        setTasks(tasks);
        setLinks(links);
      } catch (err) {
        setError('Failed to fetch WBS data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWbs();
  }, [projectId]);

  const scales = [
    { unit: 'year', step: 1, format: 'yyyy' },
    { unit: 'month', step: 1, format: 'MMMM' },
  ];

  const columns = [
  { id: "text",
    header: "Task Names", 
    flexGrow: 2 
  },
  {
    id: "start",
    header: "Start date",
    flexGrow: 1,
    align: "center",
  },
  {
    id: "duration",
    header: "Duration",
    align: "center",
    flexGrow: 1,
  },
];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Willow>
      <div style={{ height: '530px', width: '100%' }}>
        <Gantt
          tasks={tasks}
          links={links}
          scales={scales}
          columns={columns}
          readonly={true}
        />
      </div>
    </Willow>
  );
};
