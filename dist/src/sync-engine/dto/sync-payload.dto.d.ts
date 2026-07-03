export declare class SyncPayloadDto {
    changes: SyncChange[];
}
export declare class SyncChange {
    entityType: string;
    entityId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    createdAt: string;
    localId?: string;
}
