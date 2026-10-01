import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.dispatch.planner import choose_driver
from app.guardrails.input import InvalidInputError, validate_message
from app.guardrails.output import validate_output
from app.operations.planner import plan_operations
from app.support.planner import plan_support

app = FastAPI(title="Food Delivery AI Service")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/health":
            self._send(404, {"message": "Not found."})
            return
        self._send(200, {"status": "ok", "service": "ai-service"})

    def do_POST(self):
        if self.path != "/v1/plan":
            self._send(404, {"message": "Not found."})
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            body = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            self._send(400, {"message": "Invalid request."})
            return

        agent = body.get("agent", "")
        try:
            message = validate_message(body.get("message") or "plan")
        except InvalidInputError as error:
            self._send(400, {"message": str(error)})
            return

        if agent == "support":
            tools = plan_support(message, body.get("order_id") or "")
            output = validate_output("Support tools selected.")
            self._send(200, {"tools": tools, "output": output, "fallback": False})
            return

        if agent == "operations":
            tools = plan_operations(message)
            output = validate_output("Operations tools selected.")
            self._send(200, {"tools": tools, "output": output, "fallback": False})
            return

        if agent == "dispatch":
            decision = choose_driver(
                body.get("candidates") or [],
                body.get("proposed_driver_id"),
                False,
            )
            output = validate_output(decision["driver_id"] or "No driver is available.")
            self._send(
                200,
                {
                    "tools": decision["tools"],
                    "driver_id": decision["driver_id"],
                    "output": output,
                    "fallback": decision["fallback"],
                },
            )
            return

        self._send(400, {"message": "Unknown agent."})

    def _send(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format, *args):
        return


def _plan(body: dict) -> tuple[int, dict]:
    agent = body.get("agent", "")
    try:
        message = validate_message(body.get("message") or "plan")
    except InvalidInputError as error:
        return 400, {"message": str(error)}

    if agent == "support":
        tools = plan_support(message, body.get("order_id") or "")
        output = validate_output("Support tools selected.")
        return 200, {"tools": tools, "output": output, "fallback": False}

    if agent == "operations":
        tools = plan_operations(message)
        output = validate_output("Operations tools selected.")
        return 200, {"tools": tools, "output": output, "fallback": False}

    if agent == "dispatch":
        decision = choose_driver(
            body.get("candidates") or [],
            body.get("proposed_driver_id"),
            False,
        )
        output = validate_output(decision["driver_id"] or "No driver is available.")
        return 200, {
            "tools": decision["tools"],
            "driver_id": decision["driver_id"],
            "output": output,
            "fallback": decision["fallback"],
        }

    return 400, {"message": "Unknown agent."}


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/v1/plan")
async def plan(request: Request):
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return JSONResponse({"message": "Invalid request."}, status_code=400)
    status, payload = _plan(body)
    return JSONResponse(payload, status_code=status)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 8090), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
