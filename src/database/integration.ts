import * as Mongoose from 'mongoose';

Mongoose.connect(process.env.DATABASE_URL!);

export interface IntegrationModel {
  userId: number
  mondayToken: string
  structurizrId: string
  structurizrKey: string
  structurizrSecret: string
}

const IntegrationSchema = new Mongoose.Schema<IntegrationModel>({
  userId: Number,
  mondayToken: String,
  structurizrId: String,
  structurizrKey: String,
  structurizrSecret: String
});

const Integration = Mongoose.model('Integration', IntegrationSchema);

export const createIntegration = (data: IntegrationModel) => {
  return (new Integration(data)).save();
};
 
export const findIntegration = (userId: number) => {
  return Integration.findOne({ userId });
};
