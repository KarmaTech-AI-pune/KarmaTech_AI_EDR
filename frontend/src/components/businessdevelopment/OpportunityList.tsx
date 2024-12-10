import React from 'react';
import { OpportunityItem } from './OpportunityItem';
import { OpportunityTracking } from "../../models";

interface OpportunityListProps {
  opportunities: OpportunityTracking[];
  emptyMessage?: string;
  onOpportunityDeleted: (opportunityId: number) => void;
  onOpportunityUpdated: () => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({ 
  opportunities,
  emptyMessage = 'No opportunities found',
  onOpportunityDeleted,
  onOpportunityUpdated
}) => {
  if (opportunities.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <div>
      {opportunities.map((opportunity) => (
        <OpportunityItem
          key={opportunity.id}
          opportunity={opportunity}
          onOpportunityDeleted={onOpportunityDeleted}
          onOpportunityUpdated={onOpportunityUpdated}
        />
      ))}
    </div>
  );
};
