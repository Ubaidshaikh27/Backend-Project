class ApiResponse {
    constructor(successCode, data, message="Success") {
        this.successCode = successCode;
        this.message = message;
        this.data = data;
        this.success = successCode < 400;
    }
}