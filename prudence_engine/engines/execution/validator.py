class ExecutionValidator:
    @staticmethod
    def validate_payload(payload) -> bool:
        if not payload.signal:
            raise ValueError("Payload missing signal.")
        return True
