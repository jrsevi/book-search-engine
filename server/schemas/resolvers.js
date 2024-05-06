const { User, Book } = require('../models');
const { create } = require('../models/User');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query : {
        me: async (parent, { username }) => {
            return await User.findOne( { username: username })
            .select('-__v -password')
            .populate('savedBooks');
        }
    },

    Mutation: {
        login: async (parent, { username, email, password }) => {
            const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (!user) {
            throw new Error("Can't find this user");
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
            throw new Error('Wrong password!');
        }
        const token = signToken(user);
        if (!token) {
            throw new Error('Error signing token');
        }
        return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
        const user = await user.create({ username, email, password });
        if (!user) {
            throw new Error('Something is wrong!');
        }
        const token = signToken(user);
        if (!token) {
            throw new Error('Error signing token');
        }
        return { token, user };
    },
    saveBook: async (parent, { userId, bookData }) => {
        return await User.findOneAndUpdate(
            { _id: userId },
            {
                $addToSet: { savedBooks: bookData },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    },
    removeBook: async (parent, { userId, bookId }) => {
        return await User.findOneAndUpdate(
            { _id: userId },
            {
                $pull: {
                    savedBooks: {
                        bookId: bookId,
                    },
                },
            },
            { new: true }
        );
    }
  }
};

module.exports = resolvers;