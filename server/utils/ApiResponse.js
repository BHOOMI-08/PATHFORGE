class ApiResponse {
  constructor(statusCode, data, message = "Success", errors = []) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

export default ApiResponse;

