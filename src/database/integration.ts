import * as Mongoose from 'mongoose';

Mongoose.connect(process.env.DATABASE_URL!);

const IntegrationSchema = new Mongoose.Schema({
  userId: Number,
  token: String
});

const Integration = Mongoose.model('Integration', IntegrationSchema);

export const setToken = (userId: string, token: string) => {
  return (new Integration({ userId, token })).save();
};
 
export const getToken = (userId: string) => {
  return Integration.findOne({ userId });
};
