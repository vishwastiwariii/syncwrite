const handleCursorMove = async function (data, io, socket) {

    const { documentId, position } = data; 

    socket.to(documentId).emit('CURSOR_UPDATE', { 
        userId: socket.user.id,
        name: socket.user.name,
        position
    })
}

export default handleCursorMove