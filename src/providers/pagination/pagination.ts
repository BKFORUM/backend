export declare class PaginatedResult<T> {
  data: T[];
  totalRecords: number;
  skippedRecords: number;
  payloadSize: number;
  hasNext: boolean;
  pages: number;
  currPage: number;
}

export class Pagination {
  static of({ take, skip }, totalRecords: number, dtos: any) {
    const hasNext = totalRecords > skip + take;
    return {
      skippedRecords: skip,
      totalRecords,
      data: dtos,
      pages: Math.ceil(totalRecords / (dtos.length || 1)),
      currPage: Math.floor(skip / take) + 1,
      payloadSize: dtos.length,
      hasNext,
    };
  }
}
