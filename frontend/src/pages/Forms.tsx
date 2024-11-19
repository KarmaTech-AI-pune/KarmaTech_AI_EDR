import {OpportunityForm} from "../components/forms/OpportunityForm"
export const Forms = () => {
    const project = {
        "id"  : 1
    }

    const dummySubmit = () => {
        console.log("#")
    }
    return (
        <>
        <OpportunityForm onClose={dummySubmit} open = {true} onSubmit={dummySubmit} project={project} />
        </>
    )
}