const ReceivedSeenStatus = require('../models/receivedSeenStatusModel')


const addOfflineSender = async (id) => {
    const user = await findReceiverById(id);
    if (!user) {
        const newOfflineSender = new ReceivedSeenStatus({
            received: true,
            seen: false,
            userId: id
        })
        await newOfflineSender.save();
    }

}
const findReceiverById = async (id) => {
    return await ReceivedSeenStatus.findOne({ userId: id });
}

const updateOneUserRecivedStatus = async (id) => {
    await ReceivedSeenStatus.findOneAndUpdate({ userId: id }, { received: true });
}

const updateOneUserSeenStatus = async (id) => {
    await ReceivedSeenStatus.findOneAndUpdate({ userId: id }, { seen: true });
}

const deleteOneAfterSeen = async (id) => {
    await ReceivedSeenStatus.findOneAndDelete({ userId: id });
}

module.exports = {
    findReceiverById, updateOneUserRecivedStatus, updateOneUserSeenStatus, deleteOneAfterSeen, addOfflineSender
}