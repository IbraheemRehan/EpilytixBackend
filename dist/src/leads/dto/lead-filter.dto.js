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
exports.LeadFilterDto = void 0;
const class_validator_1 = require("class-validator");
const lead_schema_1 = require("../schemas/lead.schema");
class LeadFilterDto {
    status;
    assignedTo;
    search;
    page;
    limit;
}
exports.LeadFilterDto = LeadFilterDto;
__decorate([
    (0, class_validator_1.IsEnum)(lead_schema_1.LeadStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "assignedTo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=lead-filter.dto.js.map