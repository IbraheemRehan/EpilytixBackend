import { Injectable, Logger } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { SyncPayloadDto } from './dto/sync-payload.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Model } from 'mongoose';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private leadsService: LeadsService,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  async pullChanges(since: Date, userId: string, user: any) {
    // Return all records updated since the given timestamp
    // For leads, we check permissions
    const query: any = { updatedAt: { $gt: since } };
    if (user.role !== 'CEO' && !user.permissions?.canViewAllLeads) {
      query.assignedTo = userId;
    }

    const leads = await this.leadModel.find(query).exec();

    // Ideally, we'd also pull chat messages and content changes
    return {
      timestamp: new Date().toISOString(),
      leads,
      // chat: ...
    };
  }

  async pushChanges(payload: SyncPayloadDto, user: any) {
    const results = [];
    const conflicts = [];

    // Process sequentially to respect order of offline operations
    for (const change of payload.changes) {
      try {
        let result: any;
        switch (change.entityType) {
          case 'lead':
            if (change.action === 'CREATE') {
              result = await this.leadsService.create(change.payload);
            } else if (change.action === 'UPDATE') {
              // Basic conflict resolution: If server version > client version, server wins
              const serverLead = await this.leadModel.findById(change.entityId).select('syncVersion');
              if (serverLead && change.payload.syncVersion && serverLead.syncVersion > change.payload.syncVersion) {
                conflicts.push({
                  localId: change.localId,
                  entityId: change.entityId,
                  reason: 'conflict_server_wins',
                  serverVersion: serverLead.syncVersion,
                });
                continue; // Skip update
              }
              result = await this.leadsService.update(change.entityId as string, change.payload, user);
            }
            break;

          case 'note':
            if (change.action === 'CREATE') {
              result = await this.leadsService.addNote(change.entityId as string, change.payload, user);
            }
            break;


          default:
            this.logger.warn(`Unknown entity type for sync: ${change.entityType}`);
        }

        results.push({
          localId: change.localId,
          entityId: result?._id || change.entityId,
          status: 'success',
        });
      } catch (error) {
        this.logger.error(`Sync failed for ${change.entityType} ${change.localId}: ${error.message}`);
        results.push({
          localId: change.localId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      results,
      conflicts,
    };
  }
}
