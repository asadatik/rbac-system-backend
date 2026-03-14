import mongoose, { Document, Schema } from 'mongoose';

export interface AuditLogDocument extends Document {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  status: 'success' | 'failure';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE'],
      index: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['USER', 'PERMISSION', 'ROLE', 'SYSTEM'],
    },
    resourceId: {
      type: String,
      index: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    reason: String,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  }
);

// Compound index for efficient querying
auditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);
