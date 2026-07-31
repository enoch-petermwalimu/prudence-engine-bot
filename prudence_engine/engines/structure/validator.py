class StructureValidator:
    @staticmethod
    def validate(data) -> bool:
        if not data:
            raise ValueError("Market data batch required.")
        return True
