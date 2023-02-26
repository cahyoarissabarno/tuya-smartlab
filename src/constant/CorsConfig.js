export const CorsConfig = {
    origin: [
      'https://openapi.tuyaus.com',
      'http://localhost:8000',
      'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], 
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Signature-Headers',
      'client_id',
      'access_token',
      'sign',
      'sign_method',
      'stringToSign',
      't',
      'nonce',
    ], 
  }