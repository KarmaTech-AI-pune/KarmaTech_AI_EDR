import { Box, Chip } from '@mui/material';
import { CheckCircle, PendingOutlined } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { WorkflowEntry } from "../../models";
import { getWorkflowByOpportunityId } from '../../dummyapi/opportunityWorkflowApi';

type BDChipsProps = {
  opportunityId: string;
};

const WORKFLOW_CHIPS = [
  { id: "1", label: "FB01 Opportunity Tracking" },
  { id: "2", label: "FB02 Go/NoGo" },
  { id: "3", label: "FB03 Bid Preparation" }
];

export const BDChips: React.FC<BDChipsProps> = ({ opportunityId }) => {
  const [workflow, setWorkflow] = useState<WorkflowEntry | undefined>(undefined);

  useEffect(() => {
    const fetchWorkflow = async () => {
      const workflowData = await getWorkflowByOpportunityId(opportunityId);
      setWorkflow(workflowData);
    };
    fetchWorkflow();
  }, [opportunityId]);

  const getChipStatus = (chipNumber: string) => {
    const formStage = workflow?.formStage;

    switch (formStage) {
      case 'opportunityTracking':
        return chipNumber === "1" ? 'pending' : 'inactive';
      case 'goNoGo':
        return chipNumber === "1" ? 'completed' : 
               chipNumber === "2" ? 'pending' : 'inactive';
      case 'bidPreparation':
        return chipNumber === "1" || chipNumber === "2" ? 'completed' :
               chipNumber === "3" ? 'pending' : 'inactive';
      case 'bidSubmitted':
      case 'bidAccepted':
      case 'bidRejected':
        return 'completed';
      default:
        return 'inactive';
    }
  };

  const getChipProps = (status: 'completed' | 'pending' | 'inactive') => {
    switch (status) {
      case 'completed':
        return {
          color: 'success' as const,
          icon: <CheckCircle />
        };
      case 'pending':
        return {
          color: 'warning' as const,
          icon: <PendingOutlined />
        };
      case 'inactive':
        return {
          color: 'default' as const,
          icon: <CheckCircle />
        };
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {WORKFLOW_CHIPS.map((chip) => {
        const status = getChipStatus(chip.id);
        const { color, icon } = getChipProps(status);
        return (
          <Chip
            key={chip.id}
            label={chip.label}
            color={color}
            icon={icon}
            size="small"
          />
        );
      })}
    </Box>
  );
};
