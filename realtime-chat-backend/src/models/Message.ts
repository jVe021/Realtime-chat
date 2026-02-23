import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types/types";

const messageSchema = new Schema<IMessage>({
    roomId: {
        type: Schema.Types.ObjectId as any,
        ref: "Room",
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId as any,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        default: "",
        trim: true,
        maxlength: [5000, "Message must be at most 5000 characters"],
    },
    imageUrl: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

messageSchema.index({ roomId: 1, createdAt: -1 });

messageSchema.set("toJSON", {
    transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

export const Message = mongoose.model<IMessage>("Message", messageSchema);