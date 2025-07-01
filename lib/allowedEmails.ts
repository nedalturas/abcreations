// Email access control configuration
// Add the email addresses that should have access to your application

export const ALLOWED_EMAILS = [
  // Add your allowed email addresses here
  'nedalturas527@gmail.com',
  'paulalturas0@gmail.com',
  'alturaselsa03@gmail.com'
  // Add more emails as needed
];

// Function to check if an email is allowed
export function isEmailAllowed(email: string | null): boolean {
  if (!email) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedEmail = email.toLowerCase().trim();
  
  return ALLOWED_EMAILS.some(allowedEmail => 
    allowedEmail.toLowerCase().trim() === normalizedEmail
  );
}

// Function to check if an email domain is allowed (optional)
export function isDomainAllowed(email: string | null, allowedDomains: string[]): boolean {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return allowedDomains.some(allowedDomain => 
    allowedDomain.toLowerCase() === domain
  );
}