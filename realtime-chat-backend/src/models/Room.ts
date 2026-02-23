import mongoose, { Schema } from "mongoose";
import { IRoom } from "../types/types";

const roomSchema = new Schema<IRoom>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    type: {
        type: String,
        enum: ["private", "group"],
        required: true,
    },
    participants: [{
        type: Schema.Types.ObjectId as any,
        ref: "User",
        required: true,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

roomSchema.path("participants").validate({
    validator: function (val: any[]) {
        return val.length >= 2;
    },
    message: "Room must have at least 2 participants",
});

roomSchema.index({ participants: 1 });

roomSchema.set("toJSON", {
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Room = mongoose.model<IRoom>("Room", roomSchema);