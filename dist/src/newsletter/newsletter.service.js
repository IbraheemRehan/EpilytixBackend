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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscriber_schema_1 = require("./schemas/subscriber.schema");
let NewsletterService = class NewsletterService {
    subscriberModel;
    constructor(subscriberModel) {
        this.subscriberModel = subscriberModel;
    }
    async subscribe(subscribeDto) {
        const existing = await this.subscriberModel.findOne({ email: subscribeDto.email.toLowerCase() });
        if (existing) {
            if (existing.status === subscriber_schema_1.SubscriberStatus.UNSUBSCRIBED) {
                existing.status = subscriber_schema_1.SubscriberStatus.ACTIVE;
                await existing.save();
                return existing.toJSON();
            }
            throw new common_1.ConflictException('Email is already subscribed');
        }
        const subscriber = new this.subscriberModel({
            email: subscribeDto.email.toLowerCase(),
            status: subscriber_schema_1.SubscriberStatus.ACTIVE,
        });
        await subscriber.save();
        return subscriber.toJSON();
    }
    async findAll() {
        const items = await this.subscriberModel.find().sort({ createdAt: -1 }).exec();
        return {
            items: items.map((item) => item.toJSON()),
            total: items.length,
        };
    }
    async exportCsv(startDate, endDate) {
        const query = { status: subscriber_schema_1.SubscriberStatus.ACTIVE };
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const items = await this.subscriberModel.find(query).sort({ createdAt: -1 }).exec();
        const headers = ['Email', 'Status', 'Subscribed At'];
        const rows = items.map(item => [
            item.email,
            item.status,
            item.createdAt.toISOString()
        ]);
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscriber_schema_1.Subscriber.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map