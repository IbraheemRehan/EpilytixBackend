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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberSchema = exports.Subscriber = exports.SubscriberStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var SubscriberStatus;
(function (SubscriberStatus) {
    SubscriberStatus["ACTIVE"] = "ACTIVE";
    SubscriberStatus["UNSUBSCRIBED"] = "UNSUBSCRIBED";
})(SubscriberStatus || (exports.SubscriberStatus = SubscriberStatus = {}));
let Subscriber = class Subscriber {
    _id;
    email;
    status;
    createdAt;
    updatedAt;
};
exports.Subscriber = Subscriber;
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true, index: true, unique: true }),
    __metadata("design:type", String)
], Subscriber.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: SubscriberStatus, default: SubscriberStatus.ACTIVE }),
    __metadata("design:type", String)
], Subscriber.prototype, "status", void 0);
exports.Subscriber = Subscriber = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'subscribers' })
], Subscriber);
exports.SubscriberSchema = mongoose_1.SchemaFactory.createForClass(Subscriber);
exports.SubscriberSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
    },
});
//# sourceMappingURL=subscriber.schema.js.map