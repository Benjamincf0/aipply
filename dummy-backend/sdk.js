export class BrowserSDK {
  constructor(apiKey, baseURL) {
    this.apiKey = apiKey;
    this.baseURL = baseURL || "https://lisa-taurine.tera.space";
    this.milanURL = "gcp-usc1-1.milan-taurine.tera.space";
    this.sessionId = null;
  }
  async createSession(targeting = {}) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${this.baseURL}/v1/consumer/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(targeting),
        });
        const data = await res.json();
        if (res.ok) {
          this.sessionId = data.sessionId;
          await this.#waitForSessionActive(this.sessionId);
          return data;
        } else {
          const err = new Error(data.error || "Failed to create session");
          if (attempt === 3) throw err;
          await new Promise((r) => setTimeout(r, 200 * attempt));
        }
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
    }
  }
  async #waitForSessionActive(sessionId) {
    const start = Date.now();
    const timeout = 20_000; // 20 seconds
    const url = `${this.baseURL}/v1/consumer/session?sessionId=${encodeURIComponent(sessionId)}`;
    while (true) {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": "insomnia/11.6.0",
        },
      });
      const data = await res.json();
      if (data && data.session && data.session.status === "active") {
        return true;
      }
      if (Date.now() - start >= timeout) {
        throw new Error("Session did not become active within 20 seconds");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  async endSession() {
    if (!this.sessionId) {
      throw new Error("No active session to end");
    }
    const res = await fetch(
      `${this.baseURL}/v1/consumer/session?sessionId=${encodeURIComponent(this.sessionId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to end session");
    }
    this.sessionId = null;
    return true;
  }

  async getSessionStatus() {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    const res = await fetch(
      `${this.baseURL}/v1/consumer/session?sessionId=${encodeURIComponent(this.sessionId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to get session status");
    }
    const data = await res.json();
    return data.session;
  }

  async getBrowserCDPUrl() {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    const res = await fetch(
      `https://${this.milanURL}/v1/consumer/${this.sessionId}/json/version`,
    );
    if (!res.ok) {
      throw new Error("Failed to get browser CDP URL");
    }
    const data = await res.json();
    return data.webSocketDebuggerUrl.replace(
      "ws://127.0.0.1",
      `wss://${this.milanURL}/v1/consumer/${this.sessionId}`,
    );
  }

  async getBrowserInfo() {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    const res = await fetch(
      `https://${this.milanURL}/v1/consumer/${this.sessionId}/json/version`,
    );
    if (!res.ok) {
      throw new Error("Failed to get browser info");
    }
    const data = await res.json();
    return data;
  }

  async createPage(url) {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    if (!url) {
      url = "about:blank";
    }
    if (url && typeof url !== "string") {
      throw new Error("URL must be a string");
    }
    const res = await fetch(
      `https://${this.milanURL}/v1/consumer/${this.sessionId}/json/new?${encodeURIComponent(url)}`,
      { method: "PUT" },
    );
    if (!res.ok) {
      throw new Error("Failed to create new page");
    }
    const data = await res.json();
    return data;
  }

  async closePage(targetId) {
    if (!this.sessionId) {
      throw new Error("No active session");
    }
    const res = await fetch(
      `https://${this.milanURL}/v1/consumer/${this.sessionId}/json/close/${targetId}`,
    );
    if (!res.ok) {
      throw new Error("Failed to close page");
    }
    return true;
  }
}
