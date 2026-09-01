export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const url = new URL(request.url);
    const lastSegment = url.pathname.split("/").filter(Boolean).at(-1) ?? "";

    if (lastSegment.includes(".")) {
      return response;
    }

    url.pathname = url.pathname.endsWith("/")
      ? `${url.pathname}index.html`
      : `${url.pathname}/index.html`;

    return env.ASSETS.fetch(new Request(url, request));
  }
};
