MAX_MESSAGE_LENGTH = 4000


class InvalidInputError(Exception):
    pass


def validate_message(message: str) -> str:
    message = message.strip()

    if not message:
        raise InvalidInputError("Message cannot be empty")

    if len(message) > MAX_MESSAGE_LENGTH:
        raise InvalidInputError("Message is too long")

    return message
