const activeUsers = {}


const addUsers = async function (documentId, socket) {

    if(!activeUsers[documentId]){
        activeUsers[documentId] = {}
    }

    activeUsers[documentId][socket.id] = {
        userId : socket.user.id,
        username : socket.user.name,
    }

}

const removeUsers = async function (documentId, socketId){

    if(!activeUsers[documentId]){
        return []
    }

    delete activeUsers[documentId][socketId]

}

const getUsers  = async function (documentId) {

    if(!activeUsers[documentId]){
        return []
    }

    return Object.values(activeUsers[documentId])
}

const removeUserFromAllDocuments = (socketId) => {

    const updatedDocs = []

    for (const documentId in activeUsers) {

        if (activeUsers[documentId][socketId]) {

            delete activeUsers[documentId][socketId]
            updatedDocs.push(documentId)

            if (Object.keys(activeUsers[documentId]).length === 0) {
                delete activeUsers[documentId]
            }
        }
    }

    return updatedDocs
}

export {
    getUsers,
    addUsers,
    removeUsers,
    removeUserFromAllDocuments
}