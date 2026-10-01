MAX_RESPONSE_LENGTH = 8000


def validate_output(output: str) -> str:
    output = output.strip()

    if not output:
        return "I couldn't complete that request."

    if len(output) > MAX_RESPONSE_LENGTH:
        output = output[:MAX_RESPONSE_LENGTH]

    return output
