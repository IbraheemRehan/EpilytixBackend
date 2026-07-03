"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("../leads/leads.service");
const mongoose_1 = require("@nestjs/mongoose");
const lead_schema_1 = require("../leads/schemas/lead.schema");
const mongoose_2 = require("mongoose");
let SyncService = SyncService_1 = class SyncService {
    leadsService;
    leadModel;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(leadsService, leadModel) {
        this.leadsService = leadsService;
        this.leadModel = leadModel;
    }
    async pullChanges(since, userId, user) {
        const query = { updatedAt: { $gt: since } };
        if (user.role !== 'CEO' && !user.permissions?.canViewAllLeads) {
            query.assignedTo = userId;
        }
        const leads = await this.leadModel.find(query).exec();
        return {
            timestamp: new Date().toISOString(),
            leads,
        };
    }
    async pushChanges(payload, user) {
        const results = [];
        const conflicts = [];
        for (const change of payload.changes) {
            try {
                let result;
                switch (change.entityType) {
                    case 'lead':
                        if (change.action === 'CREATE') {
                            result = await this.leadsService.create(change.payload);
                        }
                        else if (change.action === 'UPDATE') {
                            const serverLead = await this.leadModel.findById(change.entityId).select('syncVersion');
                            if (serverLead && change.payload.syncVersion && serverLead.syncVersion > change.payload.syncVersion) {
                                conflicts.push({
                                    localId: change.localId,
                                    entityId: change.entityId,
                                    reason: 'conflict_server_wins',
                                    serverVersion: serverLead.syncVersion,
                                });
                                continue;
                            }
                            result = await this.leadsService.update(change.entityId, change.payload, user);
                        }
                        break;
                    case 'note':
                        if (change.action === 'CREATE') {
                            result = await this.leadsService.addNote(change.entityId, change.payload, user);
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
            }
            catch (error) {
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
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(lead_schema_1.Lead.name)),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        mongoose_2.Model])
], SyncService);
//# sourceMappingURL=sync.service.js.map