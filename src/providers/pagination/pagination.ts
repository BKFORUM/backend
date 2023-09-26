export declare class PaginatedResult<T> {
  data: T[];
  totalRecords: number;
  skippedRecords: number;
  payloadSize: number;
  hasNext: boolean;
}

export class Pagination {
  static of({ take, skip }, totalRecords: number, dtos: any) {
    const hasNext = totalRecords > skip + take;
    return {
      skippedRecords: skip,
      totalRecords,
      data: dtos,
      payloadSize: dtos.length,
      hasNext,
    };
  }
}
