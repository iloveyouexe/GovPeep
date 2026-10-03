// Pages gateway: preserve the website origin so auth cookies remain first-party.
// Configure the Pages service binding API -> govpeep-api for production.
export const onRequest = async ({
  request,
  env,
}: {
  request: Request;
  env: { API: Fetcher };
}) => {
  if (!env.API)
    return Response.json(
      { error: "API service binding is not configured." },
      { status: 503 },
    );
  return env.API.fetch(request);
};
