import { auth } from "@/lib/auth";

// Debug function to log requests
const debugRequest = (method: string, url: string) => {
  console.log(`[Better Auth] ${method} ${url}`);
};

export async function GET(request: Request) {
  debugRequest("GET", request.url);
  return auth.handler(request);
}

export async function POST(request: Request) {
  debugRequest("POST", request.url);
  return auth.handler(request);
}

export async function PUT(request: Request) {
  debugRequest("PUT", request.url);
  return auth.handler(request);
}

export async function DELETE(request: Request) {
  debugRequest("DELETE", request.url);
  return auth.handler(request);
}

export async function PATCH(request: Request) {
  debugRequest("PATCH", request.url);
  return auth.handler(request);
}
