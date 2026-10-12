export const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: blob: https://wcvhjrwplxthowpsrgqe.supabase.co",
	"frame-src https://www.facebook.com",
	"connect-src 'self'",
	'upgrade-insecure-requests'
].join('; ');
