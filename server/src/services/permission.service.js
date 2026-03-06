
export async function canViewDocument(userId, document){
    const isOwner = document.createdBy.toString() === userId.toString()
    
    const collaborator = document.collaborators.find(
        (c) => c.userId.toString() === userId.toString()
    )

    if(!isOwner && !collaborator){
        throw new Error("You don't have access to view this document")
    }

    return true
}


export async function canEditDocument(userId, document){
    const isOwner = document.createdBy.toString() === userId.toString()
    
    const collaborator = document.collaborators.find(
        (c) => c.userId.toString() === userId.toString()
    )

    if(!isOwner && !collaborator){
        throw new Error("You don't have access to edit this document")
    }

    if(collaborator && collaborator.role !== "EDITOR"){
        throw new Error("You don't have editor access")
    }

    return true
}


export async function canShareDocument(userId, document){
    const isOwner = document.createdBy.toString() === userId.toString()

    if(!isOwner){
        throw new Error("Only Owner can share this document")
    }

    return true
}