export default class WebResponse<T> {
  data?: T;
  errors?: string;
  paging?: Paging;
  statusCode?: number;
  timestamp?: string;
}

export class Paging {
  size: number;
  total_page: number;
  current_page: number;
}