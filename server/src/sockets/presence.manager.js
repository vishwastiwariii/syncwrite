import { pubClient } from "../config/redis.js"

const PRESENCE_TTL = 60 * 5 

const addUsers = async function (documentId, socket) {

    const user = {
        userId: socket.user.id,
        username: socket.user.name
    }

    // use multi so both operations succeed in once
    await pubClient
                .multi()
                .hSet(
                    `presence:${documentId}`,
                    socket.id,
                    JSON.stringify(user)
                )
                .sAdd(`socket:docs:${socket.id}`, documentId)
                .expire(`presence:${documentId}`, PRESENCE_TTL)
                .exec()

}

const removeUsers = async function (documentId, socketId){
    await pubClient
                .multi()
                .hDel(`presence:${documentId}`, socketId)
                .sRem(`socket:docs:${socketId}`, documentId)
                .expire(`presence:${documentId}`, PRESENCE_TTL)
                .exec()
}

const getUsers  = async function (documentId) {
    const users = await pubClient.hVals(`presence:${documentId}`)

    return users.map((user) => JSON.parse(user))
}

// Refresh the presence key's TTL on document activity so live sessions don't
// silently expire mid-edit. The key-level TTL still evicts crash-ghosts once a
// document goes fully idle for PRESENCE_TTL. No-op if the key doesn't exist.
const refreshPresence = async function (documentId) {
    await pubClient.expire(`presence:${documentId}`, PRESENCE_TTL)
}

const removeUserFromAllDocuments = async (socketId) => {
    const documentIds = await pubClient.sMembers(`socket:docs:${socketId}`)

    const multi = pubClient.multi()

    for(const documentId of documentIds){
        multi.hDel(`presence:${documentId}`, socketId)
    }

    multi.del(`socket:docs:${socketId}`)
    await multi.exec()

    return documentIds
}

export {
    getUsers,
    addUsers,
    removeUsers,
    refreshPresence,
    removeUserFromAllDocuments
}