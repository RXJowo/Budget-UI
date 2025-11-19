// src/app/shared/config/auth.config.ts
// ZENTRALE TOKEN-KONFIGURATION

export interface AuthConfig {
  baseUrl: string;
  authToken: string;
  useBackend: boolean;
}

// ⚠️ HIER NUR EINMAL DEN TOKEN ERSETZEN! ⚠️
export const AUTH_CONFIG: AuthConfig = {
  baseUrl: 'https://budget-service.onrender.com',
  
  // 🔑 JWT TOKEN - NUR HIER ÄNDERN!
  authToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg',
  
  // 🎛️ Backend ein/aus schalten
  useBackend: true  // false = Mock-Daten, true = echtes Backend
};

// Helper function für HTTP Headers
export function getAuthHeaders(): { [header: string]: string } {
  if (AUTH_CONFIG.authToken === 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg') {
    console.warn('⚠️ JWT Token nicht gesetzt in auth.config.ts!');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_CONFIG.authToken}`
  };
}

// Helper function für Token-Validation
export function isTokenConfigured(): boolean {
  return AUTH_CONFIG.authToken !== 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ1YTZjMGMyYjgwMDcxN2EzNGQ1Y2JiYmYzOWI4NGI2NzYxMjgyNjUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiSm9uIFdvbmciLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS0ZicFlxWjZYYUl6SHZRQ0NTVGJVZFhOQm5FQzRLWUN1YXU1TFlaMlVaRkdlMjlSMD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9idWRnZXQtcGxhbm5lci03ZWRkYiIsImF1ZCI6ImJ1ZGdldC1wbGFubmVyLTdlZGRiIiwiYXV0aF90aW1lIjoxNzYyNjAxOTUyLCJ1c2VyX2lkIjoiMlMwMUdWcVZ5b2gxT2QzbllyVnNZQklQbFlFMiIsInN1YiI6IjJTMDFHVnFWeW9oMU9kM25ZclZzWUJJUGxZRTIiLCJpYXQiOjE3NjM1ODUyMjIsImV4cCI6MTc2MzU4ODgyMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMzExNzc2OTEyMDk2NDY1MzA5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.nfGL5_mKfCY6Gca5jHYhDhKCbFwTIjDAapGi8-cEaWqAKzx_C5BPzujTI3EeqDoU4g9tyDB2pzrHNu4DjUuEDMYKEGxYOJEKgBzo7GOTudp4pYdQydalurc4VefeUjR_W9cA3q2w18FKra59lU6wmpoEwWMjW5vkPNg4wyXFD2gg_gacJvwuk_cxxog19sSRmTjl53Tw94pqIMEAA9y5p9cqSRMiOd8UF0SsuKILE3OnlGPu51CEmV_J0jmxXBtF4Sv8aQH5fGO-jM4xB_8zR-qGB1gk4vv62NHcywr29FLuOecr7syh3vEcFDHWZNLG-KPxAo_K5cAAJyrpbNr5Jg';
}

// Quick Token Test Function
export function testToken(): void {
  console.log('🧪 Testing JWT Token from central config...');
  
  if (!isTokenConfigured()) {
    console.error('❌ Token not configured in auth.config.ts');
    return;
  }
  
  fetch(`${AUTH_CONFIG.baseUrl}/expenses?page=0&size=1&sort=date,desc`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Token works! Status:', response.status);
    } else {
      console.error('❌ Token failed! Status:', response.status);
    }
  })
  .catch(error => console.error('❌ Network error:', error));
}

// Console-friendly test
console.log('🔧 Auth Config loaded. Use testToken() to verify your JWT token.');