const bcrypt = require('bcrypt');

module.exports = function (collection) {
    return collection.find().toArray()
        .then((users) => Promise.all(users.map((user) => bcrypt.genSalt()
            .then((sault) => bcrypt.hash(user.password, sault))
            .then((hashPassword) => ({ ...user, password: hashPassword })))))
        .then((updatedUsers) => collection.deleteMany().then(() => collection.insertMany(updatedUsers)));
};
