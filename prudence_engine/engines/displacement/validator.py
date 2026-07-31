class DisplacementValidator:
    @staticmethod
    def validate(data) -> bool:
        if not data:
            raise ValueError("Data required for displacement engine.")
        return True
