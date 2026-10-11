import mongoose, { Document, Schema } from 'mongoose';

export interface IAIToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: IAIToolCall[];
  sourceRecords?: Array<{
    type: string;
    id: string;
    title: string;
  }>;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Procurement Assistant Query' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
        content: { type: String, required: true },
        toolCalls: [
          {
            name: { type: String },
            arguments: { type: Schema.Types.Mixed },
            result: { type: Schema.Types.Mixed },
          },
        ],
        sourceRecords: [
          {
            type: { type: String },
            id: { type: String },
            title: { type: String },
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
