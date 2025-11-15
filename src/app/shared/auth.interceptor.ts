import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0NmE1ZWQwMDA2ZDE0YTFiYWIwMWUzNDUwODMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjMyMDY0MjIsImV4cCI6MTc2MzIxMDAyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.Gqoy5qJZm-Ll-72qW46hNvRREUbAVK-Wxpd5OtaKCK6Ogxr-fBouorE7yuv4Vjtw_0I8mv1JwK_iazE7F3fXO9HCv_eI72eeMXQE6PpB4RyIsUls0M00cR_sr61kPnlp2x76kbeuIi5lsjqianQ3RlEvlJl-oCFOw_pMh203WzF0yA0xiXqjDIf5J1LEqazLZhD4720v1toevCE8rzaJhj8sSoBEznMcnJ7g0ytgPZ_r3_91_42p6Qc6yRpJQkx8Y2E5xKMytJF0D0VchprHxXC3FZbrZgCe3RDAHMb136nACtSiwf28esTVjiv07EpvM4fmmsRmGoE2-tmucFRKww';
  
  // Log für Debugging
  console.log('Auth interceptor: Adding Authorization header to request:', req.url);
  
  // Check if token is provided
  if (!token) {
    console.warn('Auth interceptor: No token available');
    return next(req);
  }

  // Clone request and add Authorization header
  const clonedRequest = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Auth interceptor: Request cloned with headers:', clonedRequest.headers.keys());
  
  return next(clonedRequest);
};