
// Resolve a user's role on a document, or null if they have no access.
// The creator is always OWNER; everyone else carries an explicit EDITOR/VIEWER
// role via the collaborators list. This is the single source of truth for
// "what can this user do", used both by the request-time guards below and by
// the socket role cache. Kept synchronous — it only inspects an already-loaded
// document, so callers can use it without awaiting.
export function getRole(userId, document) {
    if(document.createdBy.toString() === userId.toString()){
        return "OWNER"
    }

    const collaborator = document.collaborators.find(
        (c) => c.userId.toString() === userId.toString()
    )

    return collaborator ? collaborator.role : null
}


export async function canViewDocument(userId, document){
    if(!getRole(userId, document)){
        throw new Error("You don't have access to view this document")
    }

    return true
}


export async function canEditDocument(userId, document){
    const role = getRole(userId, document)

    if(!role){
        throw new Error("You don't have access to edit this document")
    }

    if(role === "VIEWER"){
        throw new Error("You don't have editor access")
    }

    return true
}


export async function canShareDocument(userId, document){
    if(getRole(userId, document) !== "OWNER"){
        throw new Error("Only Owner can share this document")
    }

    return true
}
