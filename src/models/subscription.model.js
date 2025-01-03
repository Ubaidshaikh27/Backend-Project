import mongoose, {Schema} from 'mongoose';

const SubscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,  // one who is subscribing
        ref: 'User',
        required: true
    },
    channel:{
        type: Schema.Types.ObjectId,  //one to whom the user is subscribing
        ref: 'User',
        required: true
    }//both are user only
}, {timestamps: true}
)




export const Subscription = mongoose.model('Subscription', SubscriptionSchema);