import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useRoles } from '../../hooks/useRoles';
import { GoNoGoDecision } from '../../models/goNoGoDecisionModel';
import { WorkflowStatus } from '../../models/workflowModel';

interface GoNoGoFormProps {
    projectId: string;
    initialDecision?: GoNoGoDecision;
    onSubmit: (decision: GoNoGoDecision) => void;
}

export const GoNoGoForm: React.FC<GoNoGoFormProps> = ({ 
    projectId, 
    initialDecision, 
    onSubmit 
}) => {
    const { 
        workflowInstance, 
        initiateGoNoGoWorkflow, 
        createDecisionVersion,
        advanceWorkflowStep,
        loading,
        error 
    } = useWorkflow();

    const { currentUserRole } = useRoles();

    const [decision, setDecision] = useState<GoNoGoDecision>({
        projectId,
        bidType: initialDecision?.bidType || '',
        sector: initialDecision?.sector || '',
        tenderFee: initialDecision?.tenderFee || 0,
        emdAmount: initialDecision?.emdAmount || 0,
        
        // Workflow-related fields
        workflowInstanceId: initialDecision?.workflowInstanceId,
        currentVersion: initialDecision?.currentVersion || 1,
        workflowStatus: initialDecision?.workflowStatus || WorkflowStatus.Initiated,

        // Scoring fields (example)
        marketingPlanScore: initialDecision?.marketingPlanScore || 0,
        marketingPlanComments: initialDecision?.marketingPlanComments || '',
        // ... other scoring fields
        
        totalScore: initialDecision?.totalScore || 0,
        status: initialDecision?.status || 0, // GoNoGoStatus enum
        decisionComments: initialDecision?.decisionComments || '',
    });

    useEffect(() => {
        // If no workflow instance exists, initiate one
        const initWorkflow = async () => {
            if (!workflowInstance) {
                try {
                    await initiateGoNoGoWorkflow(projectId, 'GoNoGoForm');
                } catch (err) {
                    console.error('Failed to initiate workflow', err);
                }
            }
        };

        initWorkflow();
    }, [projectId, initiateGoNoGoWorkflow]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!workflowInstance) {
            console.error('No workflow instance');
            return;
        }

        try {
            // Create a new decision version
            const decisionVersion = await createDecisionVersion(
                workflowInstance.id,
                JSON.stringify(decision),
                currentUserRole || 'Unknown',
                decision.decisionComments,
                decision.status.toString()
            );

            // Optionally advance workflow step if appropriate
            if (currentUserRole === 'BDM' || currentUserRole === 'Regional Manager') {
                await advanceWorkflowStep(workflowInstance.id);
            }

            // Update decision with workflow information
            const updatedDecision = {
                ...decision,
                workflowInstanceId: workflowInstance.id,
                currentVersion: decisionVersion.versionNumber,
                workflowStatus: workflowInstance.status
            };

            // Call parent component's submit handler
            onSubmit(updatedDecision);
        } catch (err) {
            console.error('Failed to submit decision', err);
        }
    };

    // Render form fields
    return (
        <form onSubmit={handleSubmit}>
            {/* Basic Project Information */}
            <div>
                <label>Bid Type</label>
                <input 
                    type="text" 
                    value={decision.bidType}
                    onChange={(e) => setDecision({...decision, bidType: e.target.value})}
                />
            </div>

            <div>
                <label>Sector</label>
                <input 
                    type="text" 
                    value={decision.sector}
                    onChange={(e) => setDecision({...decision, sector: e.target.value})}
                />
            </div>

            {/* Scoring Sections */}
            <div>
                <label>Marketing Plan Score</label>
                <input 
                    type="number" 
                    value={decision.marketingPlanScore}
                    onChange={(e) => setDecision({
                        ...decision, 
                        marketingPlanScore: parseInt(e.target.value)
                    })}
                />
                <textarea 
                    value={decision.marketingPlanComments}
                    onChange={(e) => setDecision({
                        ...decision, 
                        marketingPlanComments: e.target.value
                    })}
                />
            </div>

            {/* Total Score and Decision */}
            <div>
                <label>Total Score</label>
                <input 
                    type="number" 
                    value={decision.totalScore}
                    onChange={(e) => setDecision({
                        ...decision, 
                        totalScore: parseInt(e.target.value)
                    })}
                />
            </div>

            <div>
                <label>Decision Comments</label>
                <textarea 
                    value={decision.decisionComments}
                    onChange={(e) => setDecision({
                        ...decision, 
                        decisionComments: e.target.value
                    })}
                />
            </div>

            {/* Workflow Status Display */}
            {workflowInstance && (
                <div>
                    <p>Workflow Status: {workflowInstance.status}</p>
                    <p>Current Step: {workflowInstance.currentStepOrder}</p>
                </div>
            )}

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit Decision'}
            </button>

            {/* Error Handling */}
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </form>
    );
};
