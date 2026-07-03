import { CreateFounderDto } from './create-founder.dto';
declare const UpdateFounderDto_base: import("@nestjs/common").Type<Partial<CreateFounderDto>>;
export declare class UpdateFounderDto extends UpdateFounderDto_base {
    isActive?: boolean;
}
export {};
