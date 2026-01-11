import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map