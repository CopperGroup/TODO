import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a email"],
    },
    email: {
        type: String,
        required: [true, "Please provide a email"],
        unique: true,
    },
    profilePicture: String,
    online: {
        type: Boolean
    },
    teams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        }
    ]
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;